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

const USE_TEST_ADS = true; // TODO: Set to false when enabling real ads

// TODO: Replace with your actual Ad Unit IDs from the AdMob console
const PRODUCTION_BANNER_ID = 'ca-app-pub-xxxxxxxx/yyyyyyyyyy';
const PRODUCTION_INTERSTITIAL_ID = 'ca-app-pub-xxxxxxxx/zzzzzzzzzz';

export const AD_UNIT_IDS = {
    BANNER: USE_TEST_ADS ? TestIds.ADAPTIVE_BANNER : PRODUCTION_BANNER_ID,
    INTERSTITIAL: USE_TEST_ADS ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID,
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
        console.log('AdMob SDK initialized successfully');
    } catch (error) {
        console.warn('AdMob SDK initialization failed:', error);
    }
}
