/**
 * Kavach Shield - Capacitor Native Bridge Client
 * Communicates with KavachBridgePlugin.kt on Android
 */

import { registerPlugin, Capacitor } from '@capacitor/core';

export const KavachBridge = registerPlugin('KavachBridgePlugin', {
  web: {
    checkNotificationPermission: async () => {
      const granted = localStorage.getItem('kavach_sim_perm') === 'true';
      return { granted };
    },
    requestNotificationPermission: async () => {
      localStorage.setItem('kavach_sim_perm', 'true');
      return { granted: true, message: 'Simulated Notification Access granted in web' };
    },
    getSharedText: async () => {
      const pendingShare = sessionStorage.getItem('kavach_pending_share') || '';
      if (pendingShare) {
        sessionStorage.removeItem('kavach_pending_share');
      }
      return { text: pendingShare };
    },
    isBiometricAvailable: async () => {
      const hasWebAuthn = typeof window !== 'undefined' && !!window.PublicKeyCredential;
      return { available: hasWebAuthn, type: 'webauthn_or_pin' };
    },
    authenticateBiometric: async (_options) => {
      // In web simulation, confirm with prompt or return success
      return { success: true };
    }
  }
});

/**
 * Checks if Notification Listener permission is active on Android
 */
export async function checkNotificationPermission() {
  try {
    const res = await KavachBridge.checkNotificationPermission();
    return !!res?.granted;
  } catch (err) {
    console.warn('[KavachBridge] checkNotificationPermission error:', err);
    return false;
  }
}

/**
 * Directs user to Android Notification Listener Access settings screen
 */
export async function requestNotificationPermission() {
  try {
    const res = await KavachBridge.requestNotificationPermission();
    return res;
  } catch (err) {
    console.warn('[KavachBridge] requestNotificationPermission error:', err);
    return null;
  }
}

/**
 * Retrieves text shared via Android ACTION_SEND Intent
 */
export async function getSharedText() {
  try {
    const res = await KavachBridge.getSharedText();
    return res?.text || '';
  } catch (err) {
    console.warn('[KavachBridge] getSharedText error:', err);
    return '';
  }
}

/**
 * Checks if biometric hardware is supported and available
 */
export async function isBiometricAvailable() {
  try {
    const res = await KavachBridge.isBiometricAvailable();
    return !!res?.available;
  } catch (err) {
    console.warn('[KavachBridge] isBiometricAvailable error:', err);
    return false;
  }
}

/**
 * Prompts native biometric prompt (Fingerprint / Face / Device PIN)
 */
export async function authenticateBiometric(title = 'Unlock Kavach Shield', subtitle = 'Confirm your fingerprint to proceed') {
  try {
    const res = await KavachBridge.authenticateBiometric({ title, subtitle });
    return !!res?.success;
  } catch (err) {
    console.warn('[KavachBridge] authenticateBiometric error:', err);
    return false;
  }
}

/**
 * Registers callback for real-time scanned notifications from Kotlin service
 */
export function addNotificationScanListener(callback) {
  if (Capacitor.isNativePlatform()) {
    return KavachBridge.addListener('onNotificationScanned', callback);
  }
  return { remove: () => {} };
}

export default {
  KavachBridge,
  checkNotificationPermission,
  requestNotificationPermission,
  getSharedText,
  isBiometricAvailable,
  authenticateBiometric,
  addNotificationScanListener
};
