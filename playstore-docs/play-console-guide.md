# Google Play Console Submission Guide & Policy Declarations

**Application Name:** Kavach Shield  
**Package Name / Application ID:** `com.kavach.scamshield`  
**Version:** 1.0.0 (Version Code: 1)  
**Category:** Security / Tools  

---

## 1. Google Play Data Safety Section (Exact Answers)

Follow these exact answers when completing the **Data Safety** questionnaire in Google Play Console:

### Step 1: Data Collection and Security
- **Does your app collect or share any of the required user data types?**  
  👉 Select: **Yes** (required because Google AdMob uses device IDs/diagnostics for ads, and Google Play Billing handles purchases).
- **Is all of the user data collected by your app encrypted in transit?**  
  👉 Select: **Yes** (HTTPS/TLS for AdMob and Google Play Billing).
- **Do you provide a way for users to request that their data be deleted?**  
  👉 Select: **Yes** (All app-level settings and history can be cleared instantly via the "Clear History" button or Android App Info > Clear Storage).

### Step 2: Data Types Breakdown

#### Category: Messages (Emails, SMS, WhatsApp)
- **Do you collect or share SMS or chat messages?**  
  👉 Select: **NO**  
  *Justification:* The app uses `NotificationListenerService` strictly for on-device, in-memory heuristic classification of scam URLs and urgent phishing keywords. No message text, phone numbers, or metadata are ever stored on disk or transmitted off the device.

#### Category: Personal Info (Name, Email, Phone Number)
- **Phone Number:**  
  👉 Select: **NO** (Emergency numbers entered by the user are stored strictly inside the device's private sandboxed `localStorage` and never uploaded to any server).

#### Category: Financial Info (In-app purchase history)
- **In-App Purchase History:**  
  👉 Select: **Collected: Yes**, **Shared: No**, **Ephemeral: No**  
  *Purpose:* App Functionality, Account Management (processed securely by Google Play Billing library).

#### Category: Device or other IDs (Advertising ID)
- **Device or other IDs:**  
  👉 Select: **Collected: Yes**, **Shared: Yes** (Shared with Google AdMob for ad delivery and fraud prevention).  
  *Purpose:* Advertising or marketing, Analytics.

---

## 2. NotificationListenerService Policy Declaration & Reviewer Note

When submitting the app, Google Play requires a specific declaration for apps using `android.permission.BIND_NOTIFICATION_LISTENER_SERVICE`. Use the exact text below in the declaration form and in the "Notes for Reviewers":

### Purpose of Notification Access Declaration:
> **Core Feature Description:**  
> "Kavach Shield is an anti-fraud security and consumer protection utility for Android users. Its primary core functionality is real-time detection of cyber scams, banking trojan APK downloads, and brand impersonation attacks sent via SMS and messaging applications.
> 
> To protect users from clicking malicious links, Kavach Shield implements a lightweight on-device `NotificationListenerService` (`KavachNotificationService`) that intercepts incoming notifications from messaging applications (`com.whatsapp`, `com.whatsapp.w4b`, `com.google.android.apps.messaging`, `com.android.mms`).
> 
> **Zero-Cloud & Privacy Guarantees:**  
> 1. Kavach Shield strictly DOES NOT request or declare `READ_SMS` or `RECEIVE_SMS` permissions.  
> 2. Incoming notifications are parsed entirely in volatile memory (RAM) using an on-device heuristic engine (`scamDetector.js`).  
> 3. No notification text, sender phone numbers, or user messages are ever written to disk, saved to databases, or transmitted to external servers.  
> 4. Users have complete control to enable or revoke Notification Access at any time from Android System Settings."

---

## 3. App Content & Store Declarations

### A. Ads Declaration
- **Does your app contain ads?**  
  👉 Select: **Yes** (Contains Google AdMob banner and interstitial ads for free users; suppressed for Pro subscribers).

### B. Target Audience and Content
- **Target Age Group:** 18 and over (or 13 and over).
- **Could your app appeal to children?** No.

### C. News / COVID-19 / Financial Services Declarations
- **Is this a Financial Services app?** No (It is an anti-scam security utility).
- **Is this a Government app?** No (Emergency button connects to the public Cyber Crime Helpline 1930 for consumer assistance).

---

## 4. How to Open in Android Studio & Generate Signed `.aab`

### Step 1: Open in Android Studio
1. Launch **Android Studio**.
2. Select **Open**.
3. Navigate to and select the `android/` directory inside `kavach-shield`:
   ```
   D:\Kavin-projects\Kavach\kavach-shield\android
   ```
4. Allow Android Studio to complete the initial Gradle project sync.

### Step 2: Code Inspection
Inspect the clean Kotlin architecture under `android/app/src/main/java/com/kavach/scamshield/`:
- `KavachNotificationService.kt`: Extends `NotificationListenerService`, filters whitelist messaging apps, and processes payloads strictly in RAM.
- `KavachBridgePlugin.kt`: Exposes permission checking, settings launching, and real-time event streaming to the React web app.
- `MainActivity.kt`: Extends `BridgeActivity`, registers plugin, and routes `ACTION_SEND` intents into the Scanner screen.
- `AndroidManifest.xml`: Declares services and `ACTION_SEND` intent filter with **ZERO SMS permissions**.

### Step 3: Build Signed Android App Bundle (.aab)
1. In Android Studio, go to the top menu: **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle (.aab)** and click **Next**.
3. Select your existing keystore (or click **Create new...** to create a production keystore):
   - Key store path: `kavach-release-key.jks`
   - Key alias: `kavach_key`
4. Select build variant: **release**.
5. Click **Create**.
6. The optimized, signed `.aab` bundle will be generated in:
   ```
   android/app/release/app-release.aab
   ```
7. Upload this `.aab` directly to Google Play Console under **Production > Create new release** or **Closed Testing**.

---

## 5. Monetization Setup Checklist

1. **Google AdMob:**
   - Create an app entry in [AdMob Console](https://apps.admob.com/).
   - Replace the test App ID and unit IDs in `android/app/src/main/AndroidManifest.xml` and `src/services/adService.js` with your production IDs.
2. **Google Play In-App Subscriptions:**
   - In Google Play Console under **Monetize > Products > Subscriptions**, create two subscription products:
     - SKU 1: `kavach_pro_monthly` (₹49/month)
     - SKU 2: `kavach_pro_yearly` (₹299/year)
   - Ensure the SKUs match `SUBSCRIPTION_SKUS` in `src/services/billingService.js`.
