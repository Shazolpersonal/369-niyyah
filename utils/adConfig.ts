import mobileAds from 'react-native-google-mobile-ads';
import { TestIds } from 'react-native-google-mobile-ads';

// ======================================================================
// AdMob Configuration — CLOSED TESTING MODE
// ======================================================================
// Currently using Google's official Test Ad Unit IDs for ALL builds
// (dev + release). This is intentional for the 14-day Closed Testing
// phase on Google Play to protect the AdMob account from invalid traffic.
//
// ==> AFTER the app is live on the Play Store AND linked in AdMob,
//     swap USE_TEST_ADS to false and fill in your real IDs below.
// ======================================================================

const USE_TEST_ADS = process.env.EXPO_PUBLIC_USE_TEST_ADS !== 'false';

const PRODUCTION_BANNER_ID = process.env.EXPO_PUBLIC_AD_BANNER_ID || '';
const PRODUCTION_INTERSTITIAL_ID = process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ID || '';

export const AD_UNIT_IDS = {
    BANNER: USE_TEST_ADS || !PRODUCTION_BANNER_ID ? TestIds.ADAPTIVE_BANNER : PRODUCTION_BANNER_ID,
    INTERSTITIAL: USE_TEST_ADS || !PRODUCTION_INTERSTITIAL_ID ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID,
};

// Maximum interstitial ads shown per day to avoid annoying users
export const MAX_INTERSTITIALS_PER_DAY = 3;

// AsyncStorage key for tracking daily interstitial count
export const INTERSTITIAL_COUNT_KEY = '@niyyah_369_interstitial_count';

/**
 * Initialize the Google Mobile Ads SDK.
 * Call once at app launch.
 */
export async function initializeAds(): Promise<void> {
    try {
        await mobileAds().initialize();
    } catch (error) {
        console.warn('AdMob SDK initialization failed:', error);
    }
}
