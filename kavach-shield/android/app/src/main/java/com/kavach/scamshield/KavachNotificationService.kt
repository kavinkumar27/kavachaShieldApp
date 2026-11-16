package com.kavach.scamshield

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * KavachNotificationService
 *
 * Privacy-First Notification Listener that intercepts notifications from messaging
 * and SMS applications to inspect URLs and phishing indicators locally in memory.
 *
 * PRIVACY GUARANTEE:
 * - Only listens to designated messaging package names (WhatsApp, Google Messages, SMS).
 * - Extracts only notification title and text strictly in volatile RAM.
 * - ZERO SMS database access.
 * - ZERO disk storage of message content.
 * - ZERO transmission of notification text to external cloud servers.
 */
class KavachNotificationService : NotificationListenerService() {

    companion object {
        private const val TAG = "KavachNotification"

        // Restricted whitelist of target messaging applications
        private val ALLOWED_PACKAGES = setOf(
            "com.whatsapp",
            "com.whatsapp.w4b",                   // WhatsApp Business
            "com.google.android.apps.messaging",  // Google Messages
            "com.android.mms"                     // Standard Android MMS/SMS
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        if (sbn == null) return

        val packageName = sbn.packageName ?: return

        // Filter strictly to allowed messaging applications
        if (!ALLOWED_PACKAGES.contains(packageName)) {
            return
        }

        try {
            val notification = sbn.notification ?: return
            val extras = notification.extras ?: return

            // Extract title and text strictly in memory
            val titleCharSequence = extras.getCharSequence("android.title")
            val textCharSequence = extras.getCharSequence("android.text")

            val title = titleCharSequence?.toString() ?: ""
            val text = textCharSequence?.toString() ?: ""

            // Skip empty notifications or system progress updates
            if (title.isBlank() && text.isBlank()) {
                return
            }

            Log.d(TAG, "Intercepted notification in RAM from package: $packageName")

            // Forward to the Capacitor Plugin Bridge for on-device heuristic evaluation
            KavachBridgePlugin.notifyNotificationReceived(
                title = title,
                text = text,
                packageName = packageName
            )

        } catch (e: Exception) {
            Log.e(TAG, "Error processing incoming notification in memory", e)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        // No action required on removal
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "KavachNotificationService successfully connected and active.")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.w(TAG, "KavachNotificationService disconnected.")
    }
}
