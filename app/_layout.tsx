import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    useFonts,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
    NotoSansBengali_400Regular,
    NotoSansBengali_500Medium,
    NotoSansBengali_600SemiBold,
    NotoSansBengali_700Bold,
} from '@expo-google-fonts/noto-sans-bengali';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { configureNotificationHandler, snoozeNotification } from '../utils/notifications';
import AnimatedSplash from '../components/AnimatedSplash';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider, showToast } from '../components/Toast';
import { initializeAds } from '../utils/adConfig';
import * as Notifications from 'expo-notifications';
import { registerBackgroundFetchAsync } from '../utils/backgroundTasks';
import { recordNotificationInteraction } from '../utils/notificationAnalytics';
import { logger } from '../utils/logger';
import { TimeSlot } from '../types';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handler
configureNotificationHandler();

// Initialize AdMob SDK
initializeAds();

function NotificationHandler() {
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        // Listen to notification interactions (taps and quick actions)
        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            const actionIdentifier = response.actionIdentifier;

            if (data?.slot) {
                // Security: Validate untrusted external input (Push Notification Payload)
                const isValidSlot = ['morning', 'noon', 'night'].includes(data.slot as string);

                if (isValidSlot) {
                    // Record the hour to adapt future push times
                    recordNotificationInteraction(data.slot as TimeSlot);
                } else {
                    logger.warn('Received invalid time slot in notification payload:', data.slot);
                }
            }

            if (
                actionIdentifier === 'write_niyyah' ||
                actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
                // Navigate user straight into the app dashboard/tabs
                router.push('/(tabs)');
            } else if (actionIdentifier === 'snooze') {
                // Rescheduling feature
                snoozeNotification(response.notification);
                showToast(t('notification.snoozed'));
            }
        });

        return () => subscription.remove();
    }, [router, t]);

    return null;
}

export default function RootLayout() {
    const [splashComplete, setSplashComplete] = useState(false);

    useEffect(() => {
        // Register background tasks purely outside of React lifecycle.
        registerBackgroundFetchAsync();
    }, []);

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        NotoSansBengali_400Regular,
        NotoSansBengali_500Medium,
        NotoSansBengali_600SemiBold,
        NotoSansBengali_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ErrorBoundary>
            <LanguageProvider>
                <NotificationHandler />
                <ProgressProvider>
                    <View style={{ flex: 1 }}>
                        <StatusBar style="dark" />
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                animation: 'slide_from_right',
                                contentStyle: { backgroundColor: '#F8FAFC' },
                            }}
                        />
                        {!splashComplete && (
                            <AnimatedSplash
                                isAppReady={fontsLoaded}
                                onAnimationComplete={() => setSplashComplete(true)}
                            />
                        )}
                        <ToastProvider />
                    </View>
                </ProgressProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
}
