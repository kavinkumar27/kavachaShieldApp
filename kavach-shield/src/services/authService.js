/**
 * Kavach Shield - Authentication & App Lock Service
 * Manages user registration, login, 4-digit PIN security, and native Biometrics.
 */

import { isBiometricAvailable, authenticateBiometric } from './kavachBridge';

const STORAGE_KEYS = {
  USER_PROFILE: 'kavach_user_profile',
  APP_LOCK_ENABLED: 'kavach_app_lock_enabled',
  BIOMETRIC_ENABLED: 'kavach_biometric_enabled',
  IS_AUTHENTICATED: 'kavach_session_authenticated'
};

let authListeners = [];

export function subscribeAuthState(callback) {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}

function notifyAuthState(state) {
  authListeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.warn('Auth state listener error:', e);
    }
  });
}

/**
 * Gets registered user profile
 */
export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || 'User',
      phone: parsed.phone || '',
      pin: parsed.pin || '1234',
      avatarIcon: parsed.avatarIcon || 'shield',
      avatarColor: parsed.avatarColor || '#38bdf8',
      createdAt: parsed.createdAt || new Date().toISOString()
    };
  } catch {
    return null;
  }
}

/**
 * Checks if user is registered
 */
export function isUserRegistered() {
  return !!getUserProfile();
}

/**
 * Checks if App Lock is enabled
 */
export function isAppLockActive() {
  try {
    const profile = getUserProfile();
    if (!profile) return false;
    const lockEnabled = localStorage.getItem(STORAGE_KEYS.APP_LOCK_ENABLED);
    return lockEnabled === null ? true : lockEnabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Checks if Biometrics is enabled
 */
export function isBiometricActive() {
  try {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Checks if current app session is unlocked
 */
export function isSessionUnlocked() {
  // If app lock is disabled or no user is registered, it's always unlocked
  if (!isUserRegistered() || !isAppLockActive()) {
    return true;
  }
  return sessionStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
}

/**
 * Registers a new user
 */
export function registerUser({ name, phone, pin, enableBiometrics = true, enableAppLock = true, avatarIcon = 'shield', avatarColor = '#38bdf8' }) {
  const profile = {
    name: name.trim(),
    phone: phone.trim(),
    pin: pin.trim(),
    avatarIcon,
    avatarColor,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, enableAppLock ? 'true' : 'false');
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enableBiometrics ? 'true' : 'false');
    sessionStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

    notifyAuthState({
      isRegistered: true,
      isUnlocked: true,
      profile
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates user profile details (Name, Phone, Avatar Icon, Color)
 */
export function updateUserProfile({ name, phone, avatarIcon, avatarColor }) {
  const current = getUserProfile() || { pin: '1234', createdAt: new Date().toISOString() };
  const updated = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    phone: phone !== undefined ? phone.trim() : current.phone,
    avatarIcon: avatarIcon || current.avatarIcon || 'shield',
    avatarColor: avatarColor || current.avatarColor || '#38bdf8'
  };

  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    notifyAuthState({
      isRegistered: true,
      isUnlocked: isSessionUnlocked(),
      profile: updated
    });
    return { success: true, profile: updated };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Validates PIN for login/unlock
 */
export function verifyPin(enteredPin) {
  const profile = getUserProfile();
  if (!profile) return false;

  const valid = profile.pin === enteredPin.trim();
  if (valid) {
    sessionStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    notifyAuthState({
      isRegistered: true,
      isUnlocked: true,
      profile
    });
  }
  return valid;
}

/**
 * Triggers native biometric authentication for unlock
 */
export async function unlockWithBiometrics() {
  const hasHardware = await isBiometricAvailable();
  if (!hasHardware) {
    return { success: false, reason: 'BIOMETRIC_UNAVAILABLE' };
  }

  const success = await authenticateBiometric(
    'Unlock Kavach Shield',
    'Verify your fingerprint or face to access anti-scam protection'
  );

  if (success) {
    sessionStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    notifyAuthState({
      isRegistered: true,
      isUnlocked: true,
      profile: getUserProfile()
    });
    return { success: true };
  }

  return { success: false, reason: 'AUTHENTICATION_FAILED' };
}

/**
 * Locks the app session
 */
export function lockAppSession() {
  sessionStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  notifyAuthState({
    isRegistered: isUserRegistered(),
    isUnlocked: false,
    profile: getUserProfile()
  });
}

/**
 * Updates security settings
 */
export function updateSecuritySettings({ enableAppLock, enableBiometrics, newPin }) {
  const profile = getUserProfile();
  if (!profile) return false;

  if (enableAppLock !== undefined) {
    localStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, enableAppLock ? 'true' : 'false');
  }
  if (enableBiometrics !== undefined) {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enableBiometrics ? 'true' : 'false');
  }
  if (newPin && newPin.length === 4) {
    profile.pin = newPin;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  notifyAuthState({
    isRegistered: true,
    isUnlocked: isSessionUnlocked(),
    profile
  });
  return true;
}

/**
 * Logs out user / resets authentication
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.APP_LOCK_ENABLED);
  localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
  sessionStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);

  notifyAuthState({
    isRegistered: false,
    isUnlocked: true,
    profile: null
  });
}

export default {
  getUserProfile,
  isUserRegistered,
  isAppLockActive,
  isBiometricActive,
  isSessionUnlocked,
  registerUser,
  updateUserProfile,
  verifyPin,
  unlockWithBiometrics,
  lockAppSession,
  updateSecuritySettings,
  logoutUser,
  subscribeAuthState
};
