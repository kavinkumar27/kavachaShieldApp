/**
 * Kavach Shield - AdMob Monetization Service
 * Handles Banner and Interstitial Ads using @capacitor-community/admob.
 * Automatically suppressed for Kavach Pro users.
 */

import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition
} from '@capacitor-community/admob';

// Google Official Android Test Ad Unit IDs
export const AD_CONFIG = {
  // Replace these with your live AdMob IDs before Google Play release
  PRODUCTION_APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
  PRODUCTION_BANNER_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  PRODUCTION_INTERSTITIAL_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',

  // Google Test IDs for Android
  TEST_APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
  TEST_INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712'
};

// Toggle to false for production release with live IDs
const USE_TEST_ADS = true;

const BANNER_AD_ID = USE_TEST_ADS
  ? AD_CONFIG.TEST_BANNER_ID
  : AD_CONFIG.PRODUCTION_BANNER_ID;

const INTERSTITIAL_AD_ID = USE_TEST_ADS
  ? AD_CONFIG.TEST_INTERSTITIAL_ID
  : AD_CONFIG.PRODUCTION_INTERSTITIAL_ID;

let isInitialized = false;
let isBannerVisible = false;

/**
 * Checks if current user has active Pro subscription
 */
export function isProUser() {
  try {
    return localStorage.getItem('isProUser') === 'true';
  } catch {
    return false;
  }
}

/**
 * Initializes AdMob SDK on native devices
 */
export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Non-native environment detected; ad rendering simulated.');
    return;
  }

  if (isInitialized) return;

  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['EMULATOR'],
      initializeForTesting: USE_TEST_ADS
    });
    isInitialized = true;
    console.log('[AdMob] Initialized successfully.');
  } catch (error) {
    console.warn('[AdMob] Initialization warning:', error?.message || error);
  }
}

/**
 * Displays sticky bottom banner ad if user is not Pro
 */
export async function showBannerAd() {
  if (isProUser()) {
    console.log('[AdMob] User is Pro. Skipping banner ad.');
    await hideBannerAd();
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Web] Simulating banner ad display.');
    return;
  }

  try {
    await initializeAdMob();
    
    // Remove existing before re-showing if already mounted
    if (isBannerVisible) {
      await AdMob.hideBanner().catch(() => {});
    }

    await AdMob.showBanner({
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 60, // Keep bottom navigation clear
      isTesting: USE_TEST_ADS
    });
    isBannerVisible = true;
  } catch (error) {
    console.warn('[AdMob] showBanner error:', error?.message || error);
  }
}

/**
 * Hides banner ad
 */
export async function hideBannerAd() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
    isBannerVisible = false;
  } catch {
    // Ignore if not currently shown
  }
}

/**
 * Shows Interstitial Ad on every 3rd scan for free users
 */
let scanCount = 0;
export async function handleScanMonetization() {
  if (isProUser()) return;

  // Track scan count
  try {
    const stored = parseInt(localStorage.getItem('kavach_scan_count') || '0', 10);
    scanCount = isNaN(stored) ? 1 : stored + 1;
    localStorage.setItem('kavach_scan_count', scanCount.toString());
  } catch {
    scanCount++;
  }

  // Trigger on every 3rd scan
  if (scanCount % 3 === 0) {
    await triggerInterstitialAd();
  }
}

/**
 * Prepares and displays an interstitial ad
 */
async function triggerInterstitialAd() {
  if (isProUser()) return;

  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Web] Interstitial ad threshold reached (Scan #3).');
    return;
  }

  try {
    await initializeAdMob();
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_AD_ID,
      isTesting: USE_TEST_ADS
    });
    await AdMob.showInterstitial();
  } catch (error) {
    console.warn('[AdMob] Interstitial display error:', error?.message || error);
  }
}

export default {
  initializeAdMob,
  showBannerAd,
  hideBannerAd,
  handleScanMonetization,
  isProUser
};
