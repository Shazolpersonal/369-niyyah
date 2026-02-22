import { useEffect, useState, useCallback, useRef } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AD_UNIT_IDS,
    MAX_INTERSTITIALS_PER_DAY,
    INTERSTITIAL_COUNT_KEY,
} from './adConfig';

interface DailyAdCount {
    date: string; // YYYY-MM-DD
    count: number;
}

function getTodayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getDailyCount(): Promise<DailyAdCount> {
    try {
        const raw = await AsyncStorage.getItem(INTERSTITIAL_COUNT_KEY);
        if (raw) {
            const parsed: DailyAdCount = JSON.parse(raw);
            if (parsed.date === getTodayKey()) {
                return parsed;
            }
        }
    } catch {
        // ignore parse errors
    }
    return { date: getTodayKey(), count: 0 };
}

async function incrementDailyCount(): Promise<void> {
    const current = await getDailyCount();
    const updated: DailyAdCount = {
        date: getTodayKey(),
        count: current.count + 1,
    };
    await AsyncStorage.setItem(INTERSTITIAL_COUNT_KEY, JSON.stringify(updated));
}

/**
 * Custom hook for managing interstitial ads with daily frequency cap.
 *
 * Usage:
 *   const { showAd, isAdReady } = useInterstitialAd();
 *   // After task completion:
 *   await showAd();
 */
export function useInterstitialAd() {
    const [isAdReady, setIsAdReady] = useState(false);
    const interstitialRef = useRef<InterstitialAd | null>(null);

    useEffect(() => {
        const interstitial = InterstitialAd.createForAdRequest(
            AD_UNIT_IDS.INTERSTITIAL,
        );
        interstitialRef.current = interstitial;

        const unsubscribeLoaded = interstitial.addAdEventListener(
            AdEventType.LOADED,
            () => {
                setIsAdReady(true);
            },
        );

        const unsubscribeClosed = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setIsAdReady(false);
                // Preload next ad
                interstitial.load();
            },
        );

        const unsubscribeError = interstitial.addAdEventListener(
            AdEventType.ERROR,
            (error) => {
                console.warn('Interstitial ad error:', error);
                setIsAdReady(false);
            },
        );

        // Start preloading
        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const showAd = useCallback(async (): Promise<boolean> => {
        try {
            const dailyCount = await getDailyCount();
            if (dailyCount.count >= MAX_INTERSTITIALS_PER_DAY) {
                return false; // Daily cap reached
            }

            if (isAdReady && interstitialRef.current) {
                await interstitialRef.current.show();
                await incrementDailyCount();
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Failed to show interstitial:', error);
            return false;
        }
    }, [isAdReady]);

    return { showAd, isAdReady };
}
