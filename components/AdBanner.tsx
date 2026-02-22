import React, { useRef } from 'react';
import { View, Platform } from 'react-native';
import {
    BannerAd,
    BannerAdSize,
    useForeground,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../utils/adConfig';

/**
 * Reusable Banner Ad component.
 * Displays an adaptive banner ad at the bottom of the screen.
 * NOTE: Only works on native (Android/iOS). Returns null on web.
 */
export default function AdBanner() {
    const bannerRef = useRef<BannerAd>(null);

    // (iOS) Reload ad when app returns from background
    useForeground(() => {
        Platform.OS === 'ios' && bannerRef.current?.load();
    });

    return (
        <View style={{ alignItems: 'center', backgroundColor: '#F8FAFC' }}>
            <BannerAd
                ref={bannerRef}
                unitId={AD_UNIT_IDS.BANNER}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                onAdFailedToLoad={(error) => {
                    console.warn('Banner ad failed to load:', error);
                }}
            />
        </View>
    );
}
