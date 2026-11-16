package com.kavach.scamshield

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.getcapacitor.BridgeActivity

/**
 * MainActivity
 *
 * Primary entry point for Kavach Shield on Android.
 * Registers the KavachBridgePlugin and handles incoming ACTION_SEND Share Intents
 * so messages shared from WhatsApp/SMS populate directly in the Scanner screen.
 */
class MainActivity : BridgeActivity() {

    companion object {
        private const val TAG = "KavachMainActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Register custom native bridge plugin before super.onCreate
        registerPlugin(KavachBridgePlugin::class.java)
        super.onCreate(savedInstanceState)

        handleShareIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleShareIntent(intent)
    }

    private fun handleShareIntent(intent: Intent?) {
        if (intent == null) return

        if (Intent.ACTION_SEND == intent.action && intent.type != null) {
            if ("text/plain" == intent.type) {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                if (!sharedText.isNullOrBlank()) {
                    Log.i(TAG, "Received ACTION_SEND text payload: $sharedText")
                    KavachBridgePlugin.lastSharedText = sharedText
                }
            }
        }
    }
}
