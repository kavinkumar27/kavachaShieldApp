/**
 * Kavach Shield - Bilingual Localization Dictionary (English & தமிழ்)
 */

export const translations = {
  en: {
    // App Header & Navigation
    appName: 'Kavach Shield',
    appSubtitle: 'Anti-Scam & Fraud Defense',
    tabShield: 'Shield',
    tabScanner: 'Scanner',
    tabPlan: 'Plan',
    tabSettings: 'Settings',

    // Shield Dashboard
    protectionActive: 'Live Protection Active',
    protectionInactive: 'Protection Disabled',
    protectionActiveDesc: 'Monitoring incoming SMS & WhatsApp notifications locally in memory for scam links.',
    protectionInactiveDesc: 'Grant Notification Access so Kavach can scan incoming SMS and WhatsApp alerts in real-time.',
    enableProtectionBtn: 'Enable Protection',
    checkStatusBtn: 'Refresh Status',
    scannedToday: 'Scanned Today',
    threatsBlocked: 'Threats Blocked',
    recentAlerts: 'Recent Threat Alerts',
    noAlertsYet: 'No alerts recorded yet. Scanned SMS & WhatsApp alerts will appear here.',
    clearAlerts: 'Clear History',
    helplineTitle: 'Cyber Fraud Emergency?',
    helplineDesc: 'National Cyber Crime Reporting Portal Helpline',
    callHelplineBtn: 'Call Cyber Crime Helpline (1930)',
    levelSafe: 'SAFE',
    levelWarning: 'WARNING',
    levelDanger: 'DANGER',

    // Scanner Screen
    scannerTitle: 'Scan Message or Link',
    scannerSubtitle: 'Paste any suspicious SMS, WhatsApp message, or link for instant zero-cloud heuristic security analysis.',
    inputPlaceholder: 'Paste suspicious SMS, WhatsApp text, or URL here...',
    scanNowBtn: 'Analyze Threat Level',
    scanning: 'Analyzing...',
    quickTestChips: 'Quick Test Samples:',
    chipElectricity: 'Fake Electricity APK',
    chipKyc: 'PAN / KYC Phishing',
    chipDigitalArrest: 'Digital Arrest Threat',
    chipSafeUpi: 'Official UPI Link',
    chipClear: 'Clear Input',
    riskScore: 'Risk Score',
    detectionReasons: 'Threat Analysis & Indicators',
    extractedUrls: 'Detected Links',
    alertFamilyBtn: 'Alert Family on WhatsApp',
    noFamilyNumberWarning: 'No emergency contact set. Please add a trusted contact in Settings.',
    shareSuccessMsg: 'Opening WhatsApp to alert your emergency contact...',
    safeVerdictDesc: 'This content does not match any known malicious patterns or suspicious links.',
    warningVerdictDesc: 'Exercise extreme caution. Suspicious keywords or masked links detected.',
    dangerVerdictDesc: 'High risk of fraud or malware! Do not click links, make payments, or install apps.',

    // Settings Screen
    settingsTitle: 'Settings & Security',
    languageSectionTitle: 'Language / மொழி',
    currentLanguage: 'Selected Language',
    familyContactsTitle: 'Trusted Family Emergency Contacts',
    familyContactsDesc: 'Save up to 2 trusted contacts to quickly warn them via WhatsApp if you receive a dangerous scam.',
    contact1Label: 'Contact 1 (WhatsApp Mobile Number with country code)',
    contact1Placeholder: 'e.g. 919876543210',
    contact2Label: 'Contact 2 (Optional)',
    contact2Placeholder: 'e.g. 919876543211',
    saveContactsBtn: 'Save Contacts',
    contactsSavedMsg: 'Contacts saved successfully!',
    invalidPhoneMsg: 'Please enter valid numbers (digits only, e.g. 919876543210).',

    // Security & App Lock Section
    securitySectionTitle: 'App Lock & Biometrics',
    securitySectionDesc: 'Secure your anti-scam shield with 4-digit PIN and native Android Fingerprint / Face authentication.',
    appLockToggleLabel: 'Enable App Lock on Launch',
    biometricToggleLabel: 'Fingerprint / Biometric Unlock',
    changePinBtn: 'Change Security PIN',
    logoutProfileBtn: 'Reset Security Profile',
    loggedInAs: 'Security Account',

    // Plan Screen (Pro)
    proCardTitle: 'Kavach Pro Security',
    proCardSubtitle: '100% Ad-Free & Priority Heuristic Updates',
    proStatusActive: 'Kavach Pro Member (Active)',
    proStatusFree: 'Free Version (Ad-Supported)',
    proFeature1: 'Ad-free experience across all screens',
    proFeature2: 'Priority on-device heuristic engine updates',
    proFeature3: 'Instant family broadcast shortcut',
    proFeature4: 'Zero data collection guarantee',
    monthlyPlan: 'Monthly Plan',
    monthlyPrice: '₹49 / month',
    yearlyPlan: 'Yearly Plan (Best Value)',
    yearlyPrice: '₹299 / year',
    upgradeMonthlyBtn: 'Upgrade Monthly (₹49)',
    upgradeYearlyBtn: 'Upgrade Yearly (₹299)',
    restorePurchasesBtn: 'Restore Purchases',
    manageSubBtn: 'Manage / Downgrade Plan (Test)',
    purchaseSuccessMsg: 'Kavach Pro activated! Thank you for supporting privacy-first security.',
    restoreSuccessMsg: 'Purchases restored successfully.',
    purchaseErrorMsg: 'Subscription process was cancelled or not completed.',

    // About & Privacy
    privacyNoticeTitle: 'Zero-Cloud Privacy Guarantee',
    privacyNoticeDesc: 'Kavach Shield processes all notifications and scanned texts entirely in memory on your Android device. We do not operate external logging servers or sell your data.'
  },

  ta: {
    // App Header & Navigation
    appName: 'கவச் ஷீல்ட்',
    appSubtitle: 'மோசடி & சைபர் பாதுகாப்பு',
    tabShield: 'ஷீல்ட்',
    tabScanner: 'ஸ்கேனர்',
    tabPlan: 'ப்ளான்',
    tabSettings: 'அமைப்புகள்',

    // Shield Dashboard
    protectionActive: 'நேரடி பாதுகாப்பு செயலில் உள்ளது',
    protectionInactive: 'பாதுகாப்பு முடக்கப்பட்டுள்ளது',
    protectionActiveDesc: 'எஸ்எம்எஸ் மற்றும் வாட்ஸ்அப் அறிவிப்புகளில் மோசடி இணைப்புகளை சாதனத்தில் மட்டுமே பாதுகாப்பாக கண்காணிக்கிறது.',
    protectionInactiveDesc: 'எஸ்எம்எஸ் மற்றும் வாட்ஸ்அப் விழிப்பூட்டல்களை உடனடியாக ஸ்கேன் செய்ய அறிவிப்பு அணுகலை வழங்கவும்.',
    enableProtectionBtn: 'பாதுகாப்பை இயக்கு',
    checkStatusBtn: 'நிலையைப் புதுப்பி',
    scannedToday: 'இன்று ஸ்கேன் செய்யப்பட்டவை',
    threatsBlocked: 'தடுக்கப்பட்ட அச்சுறுத்தல்கள்',
    recentAlerts: 'சமீபத்திய எச்சரிக்கைகள்',
    noAlertsYet: 'இன்னும் எச்சரிக்கைகள் எதுவும் இல்லை. ஸ்கேன் செய்யப்பட்ட செய்திகள் இங்கே காட்டப்படும்.',
    clearAlerts: 'வரலாற்றை அழிக்கவும்',
    helplineTitle: 'சைபர் மோசடி அவசர உதவிகள்?',
    helplineDesc: 'தேசிய சைபர் கிரைம் உதவி எண்',
    callHelplineBtn: 'சைபர் கிரைம் உதவி எண்ணை அழைக்கவும் (1930)',
    levelSafe: 'பாதுகாப்பானது',
    levelWarning: 'எச்சரிக்கை',
    levelDanger: 'அபாயம்',

    // Scanner Screen
    scannerTitle: 'செய்தி அல்லது இணைப்பை ஸ்கேன் செய்',
    scannerSubtitle: 'சந்தேகத்திற்கிடமான எஸ்எம்எஸ், வாட்ஸ்அப் செய்தி அல்லது இணைப்பை உள்ளிட்டு உடனடி பாதுகாப்பு ஆய்வு செய்யவும்.',
    inputPlaceholder: 'சந்தேகத்திற்கிடமான செய்தி அல்லது இணைய இணைப்பை இங்கே ஒட்டவும்...',
    scanNowBtn: 'அபாயத்தை ஆய்வு செய்',
    scanning: 'ஆய்வு செய்யப்படுகிறது...',
    quickTestChips: 'மாதிரி சோதனைகள்:',
    chipElectricity: 'போலி மின்சார பில் APK',
    chipKyc: 'பான் / கேஒய்சி மோசடி',
    chipDigitalArrest: 'டிஜிட்டல் அரெஸ்ட் மிரட்டல்',
    chipSafeUpi: 'அங்கீகரிக்கப்பட்ட UPI இணைப்பு',
    chipClear: 'உரையை அழி',
    riskScore: 'அபாய மதிப்பீடு',
    detectionReasons: 'கண்டறியப்பட்ட காரணங்கள்',
    extractedUrls: 'கண்டறியப்பட்ட இணைப்புகள்',
    alertFamilyBtn: 'குடும்பத்தினருக்கு வாட்ஸ்அப்பில் எச்சரி',
    noFamilyNumberWarning: 'அவசர தொடர்பு எண் சேர்க்கப்படவில்லை. அமைப்புகள் பக்கத்தில் எண்ணை உள்ளிடவும்.',
    shareSuccessMsg: 'உங்கள் அவசர தொடர்பை எச்சரிக்க வாட்ஸ்அப் திறக்கப்படுகிறது...',
    safeVerdictDesc: 'இந்த செய்தியில் எந்தவித மோசடி அல்லது தீங்கிழைக்கும் குறிப்புகளும் காணப்படவில்லை.',
    warningVerdictDesc: 'அதிக கவனம் தேவை. சந்தேகத்திற்குரிய சொற்கள் அல்லது இணைப்புகள் கண்டறியப்பட்டுள்ளன.',
    dangerVerdictDesc: 'மிகவும் ஆபத்தானது! இணைப்புகளைத் திறக்கவோ, பணம் செலுத்தவோ, ஆப்-களை நிறுவவோ வேண்டாம்.',

    // Settings Screen
    settingsTitle: 'அமைப்புகள் & பாதுகாப்பு',
    languageSectionTitle: 'மொழி / Language',
    currentLanguage: 'தேர்ந்தெடுக்கப்பட்ட மொழி',
    familyContactsTitle: 'நம்பகமான குடும்ப அவசர தொடர்புகள்',
    familyContactsDesc: 'மோசடி எச்சரிக்கைகளை வாட்ஸ்அப் மூலம் உடனடியாக அனுப்ப 2 குடும்ப தொடர்பு எண்களை சேமிக்கவும்.',
    contact1Label: 'தொடர்பு எண் 1 (நாட்டுக் குறியீட்டுடன், எ.கா. 919876543210)',
    contact1Placeholder: 'எ.கா. 919876543210',
    contact2Label: 'தொடர்பு எண் 2 (விருப்பத்திற்குரியது)',
    contact2Placeholder: 'எ.கா. 919876543211',
    saveContactsBtn: 'எண்களைச் சேமி',
    contactsSavedMsg: 'தொடர்பு எண்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
    invalidPhoneMsg: 'சரியான தொலைபேசி எண்களை உள்ளிடவும் (எ.கா. 919876543210).',

    // Security & App Lock Section
    securitySectionTitle: 'ஆப் பூட்டு & கைரேகை பாதுகாப்பு',
    securitySectionDesc: '4 இலக்க பின் மற்றும் கைரேகை அங்கீகாரம் மூலம் உங்கள் கவச் ஷீல்ட்டை பாதுகாக்கவும்.',
    appLockToggleLabel: 'துவக்கும் போது ஆப் பூட்டை இயக்கு',
    biometricToggleLabel: 'கைரேகை / பயோமெட்ரிக் பூட்டு',
    changePinBtn: 'பாதுகாப்பு பின்னை மாற்றுக',
    logoutProfileBtn: 'பாதுகாப்பு சுயவிவரத்தை மீட்டமை',
    loggedInAs: 'பாதுகாப்பு கணக்கு',

    // Plan Screen (Pro)
    proCardTitle: 'கவச் ப்ரோ பாதுகாப்பு',
    proCardSubtitle: '100% விளம்பரமில்லா & முன்னுரிமைப் பாதுகாப்பு',
    proStatusActive: 'கவச் ப்ரோ உறுப்பினர் (செயலில் உள்ளது)',
    proStatusFree: 'இலவச பதிப்பு (விளம்பரங்களுடன்)',
    proFeature1: 'எல்லா பக்கங்களிலும் முழுமையான விளம்பரமில்லா அனுபவம்',
    proFeature2: 'சாதனத்திற்குள் அதிவேக புதிய மோசடி கண்டறிதல்',
    proFeature3: 'உடனடி குடும்ப எச்சரிக்கை குறுக்குவழி',
    proFeature4: 'பூஜ்ஜிய தரவு பகிர்வு மற்றும் முழு தனியுரிமை',
    monthlyPlan: 'மாதாந்திர சந்தா',
    monthlyPrice: '₹49 / மாதம்',
    yearlyPlan: 'வருடாந்திர சந்தா (சிறந்தது)',
    yearlyPrice: '₹299 / வருடம்',
    upgradeMonthlyBtn: 'மாதாந்திர சந்தா (₹49)',
    upgradeYearlyBtn: 'வருடாந்திர சந்தா (₹299)',
    restorePurchasesBtn: 'முந்தைய வாங்குதல்களை மீட்டெடு',
    manageSubBtn: 'சந்தா மேலாண்மை (சோதனை)',
    purchaseSuccessMsg: 'கவச் ப்ரோ செயல்படுத்தப்பட்டது! ஆதரவிற்கு நன்றி.',
    restoreSuccessMsg: 'வாங்குதல்கள் வெற்றிகரமாக மீட்டெடுக்கப்பட்டன.',
    purchaseErrorMsg: 'சந்தா செயல்முறை ரத்து செய்யப்பட்டது அல்லது தோல்வியடைந்தது.',

    // About & Privacy
    privacyNoticeTitle: 'முழுமையான தனியுரிமை உறுதிமொழி',
    privacyNoticeDesc: 'கவச் ஷீல்ட் அனைத்து செய்திகளையும் உங்கள் சாதனத்தில் மட்டுமே படிக்கிறது. உங்கள் தனிப்பட்ட செய்திகள் அல்லது தரவுகள் எந்த வெளி சர்வர்களுக்கும் அனுப்பப்படுவதில்லை.'
  }
};

export function getTranslation(lang, key) {
  const dictionary = translations[lang] || translations.en;
  return dictionary[key] || translations.en[key] || key;
}
