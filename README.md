# Kavach Shield (கவச் ஷீல்ட்) 🛡️

**Production-Ready Anti-Scam & Fraud Defense Hybrid Android Application**  
*App ID:* `com.kavach.scamshield`  
*Stack:* React 19 + Vite 8 + Material UI (@mui/material) + Lucide Icons + Capacitor 8 + Native Kotlin Bridge

---

## 🌟 Key Highlights & Architecture

1. **Zero-Backend Heuristic Scam Engine (`src/utils/scamDetector.js`):**
   - 100% in-memory heuristic analysis of SMS and WhatsApp messages/links.
   - Flags `.apk` sideloaded downloads (+80 risk).
   - Flags URL shorteners (`bit.ly`, `tinyurl.com`, `cutt.ly`, `rb.gy`, `is.gd`, `t.co`) (+30 risk).
   - Flags high-risk TLDs (`.xyz`, `.top`, `.buzz`, `.click`, `.vip`, `.loan`) (+45 risk).
   - Detects Indian bank, UPI, and utility spoofing (`sbi`, `hdfc`, `icici`, `paytm`, `phonepe`, `gpay`, `bescom`, `tangedco`, `epfo`) against official domains (+50 risk).
   - Flags social engineering urgency keywords (`electricity disconnect`, `kyc update`, `pan card block`, `digital arrest`, `customs parcel`, `traffic challan`, `pm kisan`, `reward points expire`) (+20 each).
   - Integrates Google Safe Browsing API v4 (`threatMatches:find`) when `VITE_SAFE_BROWSING_KEY` is provided.

2. **Mobile-First Bilingual UI (`English` & `தமிழ்`):**
   - Instant language switching via localization dictionary (`src/utils/i18n.js`).
   - **Tab 1 — Shield Dashboard:** Real-time permission card, daily counters (`Scanned Today`, `Threats Blocked`), live alerts feed, and 1-tap Cyber Crime Helpline (`tel:1930`).
   - **Tab 2 — Link & Message Scanner:** Multi-line text analysis, instant scam test chips, auto-population via Android `ACTION_SEND` Share Sheet, and 1-tap **"Alert Family on WhatsApp"** button.
   - **Tab 3 — Kavach Pro & Settings:** Emergency contact configuration, language toggle, and subscription card (`₹49/mo` & `₹299/yr`).

3. **Clean Native Android Kotlin Bridge (`android/`):**
   - `KavachNotificationService.kt`: Extends `NotificationListenerService`, filters messaging apps (`com.whatsapp`, `com.whatsapp.w4b`, `com.google.android.apps.messaging`, `com.android.mms`), extracts title/body in RAM, and dispatches to WebView without touching disk or external servers.
   - `KavachBridgePlugin.kt`: Exposes permission checking, system notification settings launcher, and event emitter.
   - `MainActivity.kt`: BridgeActivity registering the plugin and handling `Intent.ACTION_SEND` share payloads.
   - `AndroidManifest.xml`: Configured with `BIND_NOTIFICATION_LISTENER_SERVICE`, `ACTION_SEND` intent filter, AdMob test App ID, and **strictly ZERO `READ_SMS` or `RECEIVE_SMS` permissions**.

4. **Monetization & Billing Services:**
   - `adService.js`: AdMob Banner ad on Shield and Scanner tabs for free users; Interstitial ad on every 3rd scan. Suppressed for Pro users.
   - `billingService.js`: Google Play Billing integration via `cordova-plugin-purchase` with subscriptions: `kavach_pro_monthly` and `kavach_pro_yearly`.

5. **Play Store Documentation (`playstore-docs/`):**
   - `privacy-policy.html`: Hosted-ready privacy policy compliant with Indian DPDP Act 2023 and Google Play Data Safety requirements.
   - `play-console-guide.md`: Exact questionnaire answers for Google Play Data Safety, NotificationListenerService declaration, and signed `.aab` generation steps.

---

## 🚀 Quick Start

### 1. Web Development Server
```bash
cd kavach-shield
npm run dev
```

### 2. Build & Sync Web Assets to Android
```bash
cd kavach-shield
npm run build
npx cap sync android
```

### 3. Open in Android Studio & Generate Signed `.aab`
1. Launch **Android Studio**.
2. Click **Open** and select:
   ```
   D:\Kavin-projects\Kavach\kavach-shield\android
   ```
3. Allow Gradle to sync.
4. Go to **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)** to generate your release bundle.
