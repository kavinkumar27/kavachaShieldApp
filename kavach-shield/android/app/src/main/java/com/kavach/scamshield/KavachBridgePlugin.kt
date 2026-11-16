package com.kavach.scamshield

import android.content.Intent
import android.provider.Settings
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * KavachBridgePlugin
 *
 * Capacitor plugin providing the JavaScript interface to:
 * 1. Check whether Notification Listener Access is enabled.
 * 2. Prompt the user directly to Android's Notification Access Settings.
 * 3. Stream real-time notification scan events to the React web application.
 * 4. Retrieve incoming shared text/URLs from Android ACTION_SEND Intent.
 * 5. Native Biometric authentication (Fingerprint / Face / Device Credential) for App Lock.
 */
@CapacitorPlugin(name = "KavachBridgePlugin")
class KavachBridgePlugin : Plugin() {

    companion object {
        private const val TAG = "KavachBridgePlugin"

        @Volatile
        private var instance: KavachBridgePlugin? = null

        @Volatile
        var lastSharedText: String? = null

        /**
         * Forwards a notification payload received in memory to registered JS listeners
         */
        fun notifyNotificationReceived(title: String, text: String, packageName: String) {
            val plugin = instance
            if (plugin != null) {
                val data = JSObject().apply {
                    put("title", title)
                    put("text", text)
                    put("packageName", packageName)
                    put("timestamp", System.currentTimeMillis())
                }
                plugin.notifyListeners("onNotificationScanned", data)
                Log.d(TAG, "Dispatched onNotificationScanned event to WebView")
            } else {
                Log.w(TAG, "KavachBridgePlugin instance is null; event queued or dropped")
            }
        }
    }

    override fun load() {
        super.load()
        instance = this
        Log.i(TAG, "KavachBridgePlugin loaded into Capacitor bridge.")
    }

    override fun handleOnDestroy() {
        if (instance == this) {
            instance = null
        }
        super.handleOnDestroy()
    }

    /**
     * Checks if Notification Listener Service permission is granted for this app
     */
    @PluginMethod
    fun checkNotificationPermission(call: PluginCall) {
        try {
            val context = context
            val packageName = context.packageName
            val flat = Settings.Secure.getString(
                context.contentResolver,
                "enabled_notification_listeners"
            )

            val isGranted = flat != null && flat.contains(packageName)

            val ret = JSObject().apply {
                put("granted", isGranted)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check notification permission", e)
            call.reject("Failed to check notification permission: ${e.message}")
        }
    }

    /**
     * Opens Android System Settings for Notification Access
     */
    @PluginMethod
    fun requestNotificationPermission(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            activity?.startActivity(intent)

            val ret = JSObject().apply {
                put("success", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch notification settings", e)
            call.reject("Failed to launch notification settings: ${e.message}")
        }
    }

    /**
     * Retrieves text or URL passed via Android ACTION_SEND share sheet
     */
    @PluginMethod
    fun getSharedText(call: PluginCall) {
        val shared = lastSharedText ?: ""
        // Clear after returning so it doesn't trigger on every tab switch
        lastSharedText = null

        val ret = JSObject().apply {
            put("text", shared)
        }
        call.resolve(ret)
    }

    /**
     * Checks if biometric hardware (fingerprint/face) or screen lock is available
     */
    @PluginMethod
    fun isBiometricAvailable(call: PluginCall) {
        try {
            val biometricManager = BiometricManager.from(context)
            val authenticators = BiometricManager.Authenticators.BIOMETRIC_STRONG or
                    BiometricManager.Authenticators.DEVICE_CREDENTIAL
            val canAuth = biometricManager.canAuthenticate(authenticators)

            val isAvailable = canAuth == BiometricManager.BIOMETRIC_SUCCESS
            val ret = JSObject().apply {
                put("available", isAvailable)
                put("status", canAuth)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Biometric check failed", e)
            val ret = JSObject().apply {
                put("available", false)
                put("error", e.message)
            }
            call.resolve(ret)
        }
    }

    /**
     * Triggers native Android BiometricPrompt (Fingerprint / Face / Device PIN)
     */
    @PluginMethod
    fun authenticateBiometric(call: PluginCall) {
        val act = activity
        if (act !is FragmentActivity) {
            call.reject("Activity is not a FragmentActivity")
            return
        }

        act.runOnUiThread {
            try {
                val title = call.getString("title", "Unlock Kavach Shield") ?: "Unlock Kavach Shield"
                val subtitle = call.getString("subtitle", "Confirm your fingerprint or biometric credential") ?: "Confirm your biometric credential"

                val executor = ContextCompat.getMainExecutor(act)

                val promptInfo = BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setSubtitle(subtitle)
                    .setAllowedAuthenticators(
                        BiometricManager.Authenticators.BIOMETRIC_STRONG or
                                BiometricManager.Authenticators.DEVICE_CREDENTIAL
                    )
                    .build()

                val biometricPrompt = BiometricPrompt(
                    act,
                    executor,
                    object : BiometricPrompt.AuthenticationCallback() {
                        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                            super.onAuthenticationSucceeded(result)
                            val ret = JSObject().apply {
                                put("success", true)
                            }
                            call.resolve(ret)
                        }

                        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                            super.onAuthenticationError(errorCode, errString)
                            val ret = JSObject().apply {
                                put("success", false)
                                put("error", errString.toString())
                                put("errorCode", errorCode)
                            }
                            call.resolve(ret)
                        }

                        override fun onAuthenticationFailed() {
                            super.onAuthenticationFailed()
                            // User presented wrong finger, dialog remains open until success or cancel
                        }
                    }
                )

                biometricPrompt.authenticate(promptInfo)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to display BiometricPrompt", e)
                call.reject("Failed to display BiometricPrompt: ${e.message}")
            }
        }
    }
}
