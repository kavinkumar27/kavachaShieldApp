# Kavach Shield (கவச் ஷீல்ட்) 🛡️

**Production-Ready Anti-Scam & Fraud Defense Hybrid Android Application**  
*App ID:* `com.kavach.scamshield`  
*Stack:* React 19 + Vite 8 + Material UI (@mui/material) + Lucide Icons + Capacitor 8 + Native Kotlin Bridge

---

## 📂 Directory Structure

```
kavach-shield/
├── android/                             # Native Android Studio Project
│   ├── app/
│   │   ├── build.gradle                 # Application build config with Kotlin plugin
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      # Service declaration, ACTION_SEND, AdMob metadata
│   │       ├── assets/public/           # Synced production web assets
│   │       └── java/com/kavach/scamshield/
│   │           ├── KavachNotificationService.kt  # In-memory NotificationListenerService
│   │           ├── KavachBridgePlugin.kt         # Capacitor Kotlin Bridge Plugin
│   │           └── MainActivity.kt               # BridgeActivity & ACTION_SEND router
│   ├── build.gradle                     # Top-level Gradle config
│   └── variables.gradle                 # Android SDK & dependency versions
├── playstore-docs/
│   ├── privacy-policy.html              # Hosted-ready Zero-Cloud Privacy Policy
│   └── play-console-guide.md            # Data Safety & NotificationListenerService declaration
├── src/
│   ├── components/
│   │   ├── ShieldScreen.jsx             # Tab 1: Protection status, counters, alerts feed, 1930 helpline
│   │   ├── ScannerScreen.jsx            # Tab 2: Message/link scanner, test chips, WhatsApp family alert
│   │   └── ProScreen.jsx                # Tab 3: Emergency contacts, language switch, Kavach Pro billing
│   ├── services/
│   │   ├── adService.js                 # AdMob banner & 3rd-scan interstitial logic
│   │   ├── billingService.js            # Google Play monthly/yearly subscriptions
│   │   └── kavachBridge.js              # Web client for KavachBridgePlugin
│   ├── utils/
│   │   ├── i18n.js                      # English & Tamil localization dictionary
│   │   └── scamDetector.js              # Zero-backend heuristic scam engine
│   ├── App.jsx                          # Root UI frame, mobile layout, tab navigation
│   ├── main.jsx                         # React 19 entry point
│   └── index.css                        # Mobile-first CSS reset
├── capacitor.config.ts                  # Capacitor configuration
└── package.json
```

---

## 🛠️ Verification & Building

- Web production build:
  ```bash
  npm run build
  ```
- Sync with Android:
  ```bash
  npx cap sync android
  ```
- Linter verification:
  ```bash
  npm run lint
  ```
- Open in Android Studio:
  ```bash
  npx cap open android
  ```
