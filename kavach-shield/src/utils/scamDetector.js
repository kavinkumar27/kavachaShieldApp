/**
 * Kavach Shield - Zero-Backend Heuristic Scam Detection Engine
 * Analyzes SMS/WhatsApp text, URLs, and social-engineering urgency triggers locally in memory.
 * No personal message text or raw logs are transmitted to any server.
 */

// Known URL shorteners often used to mask malicious landing pages
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'cutt.ly',
  'rb.gy',
  'is.gd',
  't.co'
];

// High-risk TLDs heavily abused in phishing and malware campaigns
const HIGH_RISK_TLDS = [
  '.xyz',
  '.top',
  '.buzz',
  '.click',
  '.vip',
  '.loan'
];

// Legitimate domain mappings for Indian banks, UPI, and utility providers
const BRAND_AUTHORITY = {
  sbi: {
    name: 'State Bank of India (SBI)',
    officialDomains: ['sbi.co.in', 'onlinesbi.sbi', 'statebankofindia.com', 'sbi']
  },
  hdfc: {
    name: 'HDFC Bank',
    officialDomains: ['hdfcbank.com', 'hdfc.com']
  },
  icici: {
    name: 'ICICI Bank',
    officialDomains: ['icicibank.com', 'icici.com']
  },
  paytm: {
    name: 'Paytm',
    officialDomains: ['paytm.com', 'paytmbank.com']
  },
  phonepe: {
    name: 'PhonePe',
    officialDomains: ['phonepe.com']
  },
  gpay: {
    name: 'Google Pay (GPay)',
    officialDomains: ['google.com', 'pay.google.com', 'google.co.in']
  },
  bescom: {
    name: 'BESCOM (Electricity)',
    officialDomains: ['bescom.karnataka.gov.in', 'bescom.co.in', 'karnataka.gov.in']
  },
  tangedco: {
    name: 'TANGEDCO (Electricity)',
    officialDomains: ['tangedco.gov.in', 'tangedco.org']
  },
  epfo: {
    name: 'EPFO (Provident Fund)',
    officialDomains: ['epfindia.gov.in', 'epfo.gov.in', 'gov.in']
  }
};

// Social engineering urgency phrases commonly used by Indian scammers
const SOCIAL_ENGINEERING_TRIGGERS = [
  {
    key: 'electricity disconnect',
    pattern: /\b(?:electricity\s+(?:power\s+)?(?:bill|supply|power)?\s*(?:will\s+be\s+)?disconnect(?:ed|ion)?|power\s+disconnect(?:ed)?|light\s+disconnect(?:ed)?)\b/i,
    score: 20,
    reason: 'Urgent electricity disconnection threat detected (Standard utility scam tactic).'
  },
  {
    key: 'kyc update',
    pattern: /\b(?:kyc\s*(?:update|verification|expire|blocked|suspend|pending)|update\s+(?:your\s+)?kyc|complete\s+(?:your\s+)?kyc)\b/i,
    score: 20,
    reason: 'Urgent KYC update lure detected. Banks never request KYC via SMS or third-party links.'
  },
  {
    key: 'pan card block',
    pattern: /\b(?:pan\s*(?:card)?\s*(?:block(?:ed)?|suspend(?:ed)?|deactivat(?:ed)?|inactive)|link\s+pan\s+(?:with\s+)?aadhaar\s+immediately)\b/i,
    score: 20,
    reason: 'Threat of PAN card block or deactivation detected (Income tax/banking phishing tactic).'
  },
  {
    key: 'digital arrest',
    pattern: /\b(?:digital\s+arrest|cbi\s+investigation|customs\s+arrest|police\s+video\s+call|supreme\s+court\s+order)\b/i,
    score: 20,
    reason: 'Severe "Digital Arrest" extortion phrase detected. Law enforcement agencies never arrest people online or via video call.'
  },
  {
    key: 'customs parcel',
    pattern: /\b(?:customs?\s+parcel|customs?\s+(?:duty|tax|clearance|seized|detained)|parcel\s+(?:held|detained|stuck))\b/i,
    score: 20,
    reason: 'Fake customs parcel detention lure detected (FedEx/Courier parcel scam).'
  },
  {
    key: 'traffic challan',
    pattern: /\b(?:traffic\s+challan|e-?challan\s+(?:pending|unpaid|court)|pay\s+(?:traffic\s+)?challan\s+fine)\b/i,
    score: 20,
    reason: 'Urgent traffic e-challan payment alert detected (Malicious challan APK/payment scam).'
  },
  {
    key: 'pm kisan',
    pattern: /\b(?:pm\s*kisan|kisan\s+samman\s+nidhi|kisan\s+installment\s+(?:credited|stopped|claim))\b/i,
    score: 20,
    reason: 'PM-KISAN subsidy scheme impersonation lure detected.'
  },
  {
    key: 'reward points expire',
    pattern: /\b(?:reward\s+points?\s*(?:expir(?:e|ed|ing)|worth|redeem)|redeem\s+(?:your\s+)?cashback|credit\s+card\s+points?\s+expire)\b/i,
    score: 20,
    reason: 'Urgent reward points / cashback expiry lure detected (Credential harvesting tactic).'
  }
];

/**
 * Extracts and sanitizes URLs from input text
 */
export function extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Matches http://, https://, www., or bare domains with valid paths
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|org|net|xyz|top|buzz|click|vip|loan|gov\.in|co\.in|gy|gd|ly|co)[^\s<>"'{}|\\^`]*/gi;
  const matches = text.match(urlRegex) || [];
  
  return [...new Set(matches.map(raw => {
    let clean = raw.trim().replace(/[.,;:!?)]+$/, '');
    return clean;
  }))];
}

/**
 * Safely parses a URL string into a URL object
 */
function parseUrlSafe(rawUrl) {
  let urlStr = rawUrl;
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }
  try {
    return new URL(urlStr);
  } catch {
    return null;
  }
}

/**
 * Checks if a hostname matches any authorized official domain
 */
function isOfficialDomain(hostname, officialList) {
  const host = hostname.toLowerCase();
  return officialList.some(off => host === off || host.endsWith('.' + off));
}

/**
 * Primary synchronous heuristic detection engine
 * @param {string} text - Message content or URL to analyze
 * @returns {{ level: "SAFE" | "WARNING" | "DANGER", riskScore: number, reasons: string[], urls: string[] }}
 */
export function analyzeContent(text) {
  if (!text || typeof text !== 'string') {
    return {
      level: 'SAFE',
      riskScore: 0,
      reasons: ['No content provided to analyze.'],
      urls: []
    };
  }

  let riskScore = 0;
  const reasons = [];
  const urls = extractUrls(text);
  const normalizedText = text.toLowerCase();

  // 1. Analyze extracted URLs
  for (const rawUrl of urls) {
    const parsed = parseUrlSafe(rawUrl);
    const urlLower = rawUrl.toLowerCase();
    const hostname = parsed ? parsed.hostname.toLowerCase() : '';
    const pathname = parsed ? parsed.pathname.toLowerCase() : '';

    // a. Flag .apk file download links (+80 risk score)
    const isApk = urlLower.includes('.apk') || pathname.endsWith('.apk') || urlLower.includes('/apk/') || urlLower.includes('download-apk');
    if (isApk) {
      riskScore += 80;
      reasons.push(`Contains direct Android application package (.apk) download link: "${rawUrl}". Sideloaded APKs are the primary vehicle for banking trojans.`);
    }

    // b. Flag shortened URLs (+30 risk score)
    const isShortened = URL_SHORTENERS.some(shortener => 
      hostname === shortener || hostname.endsWith('.' + shortener) || urlLower.includes(shortener + '/')
    );
    if (isShortened) {
      riskScore += 30;
      reasons.push(`Uses URL shortener hiding the destination: "${rawUrl}". Cyber criminals hide phishing and malware links behind link shorteners.`);
    }

    // c. Flag high-risk domain extensions (+45 risk score)
    const hasHighRiskTld = HIGH_RISK_TLDS.some(tld => 
      hostname.endsWith(tld) || urlLower.includes(tld + '/') || urlLower.endsWith(tld)
    );
    if (hasHighRiskTld) {
      riskScore += 45;
      reasons.push(`Uses a high-risk domain extension (.xyz, .top, .buzz, .click, .vip, .loan) frequently linked to automated scam kits: "${hostname || rawUrl}".`);
    }

    // d. Detect Indian bank, UPI, and utility brand spoofing (+50 risk score)
    for (const [brandKey, brandInfo] of Object.entries(BRAND_AUTHORITY)) {
      // Check if the URL contains the brand keyword
      const brandMentioned = hostname.includes(brandKey) || pathname.includes(brandKey) || urlLower.includes(brandKey);
      
      if (brandMentioned) {
        // Verify whether the hostname actually belongs to official authorized domains
        const isOfficial = parsed && isOfficialDomain(hostname, brandInfo.officialDomains);
        
        // Also check if it ends with legit .gov.in if it's a utility/govt entity
        const isLegitGov = hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');
        
        if (!isOfficial && !(isLegitGov && (brandKey === 'bescom' || brandKey === 'tangedco' || brandKey === 'epfo'))) {
          riskScore += 50;
          reasons.push(`Brand spoofing detected: URL references "${brandInfo.name}" (${brandKey}) but points to unofficial host "${hostname || rawUrl}" instead of authorized domains (${brandInfo.officialDomains.join(', ')}).`);
        }
      }
    }
  }

  // 2. Check for Indian social-engineering urgency phrases (+20 per match)
  for (const trigger of SOCIAL_ENGINEERING_TRIGGERS) {
    if (trigger.pattern.test(normalizedText)) {
      riskScore += trigger.score;
      reasons.push(trigger.reason);
    }
  }

  // Clamp risk score to 0 - 100
  const clampedScore = Math.min(100, Math.max(0, riskScore));

  // Determine threat level
  let level = 'SAFE';
  if (clampedScore >= 70) {
    level = 'DANGER';
  } else if (clampedScore >= 30) {
    level = 'WARNING';
  } else {
    level = 'SAFE';
  }

  if (reasons.length === 0) {
    reasons.push('No known scam patterns, malicious links, or spoofing detected. Always verify sender identity independently.');
  }

  return {
    level,
    riskScore: clampedScore,
    reasons,
    urls
  };
}

/**
 * Optional Google Safe Browsing API v4 integration
 * Gracefully falls back if VITE_SAFE_BROWSING_KEY is not configured
 * @param {string[]} urls - Array of URLs to check
 * @returns {Promise<{ checked: boolean, safe: boolean, matches: any[] }>}
 */
export async function checkGoogleSafeBrowsing(urls) {
  const apiKey = import.meta.env.VITE_SAFE_BROWSING_KEY;
  if (!apiKey || !urls || urls.length === 0) {
    return { checked: false, safe: true, matches: [] };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const requestBody = {
    client: {
      clientId: 'kavach-shield',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION'
      ],
      platformTypes: ['ANDROID', 'ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: urls.map(u => ({ url: u }))
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Google Safe Browsing API returned status:', response.status);
      return { checked: false, safe: true, matches: [] };
    }

    const data = await response.json();
    const matches = data.matches || [];
    return {
      checked: true,
      safe: matches.length === 0,
      matches
    };
  } catch (err) {
    console.warn('Google Safe Browsing lookup skipped or timed out:', err.message);
    return { checked: false, safe: true, matches: [] };
  }
}

export default {
  analyzeContent,
  extractUrls,
  checkGoogleSafeBrowsing
};
