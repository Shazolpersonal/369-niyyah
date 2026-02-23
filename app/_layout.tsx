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
import { LanguageProvider } from '../contexts/LanguageContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { configureNotificationHandler } from '../utils/notifications';
import AnimatedSplash from '../components/AnimatedSplash';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';
import { initializeAds } from '../utils/adConfig';
import * as Notifications from 'expo-notifications';
import { registerBackgroundFetchAsync } from '../utils/backgroundTasks';
import { recordNotificationInteraction } from '../utils/notificationAnalytics';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handler
configureNotificationHandler();

// Initialize AdMob SDK
initializeAds();

export default function RootLayout() {
    const [splashComplete, setSplashComplete] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Register background tasks purely outside of React lifecycle.
        registerBackgroundFetchAsync();

        // Listen to notification interactions (taps and quick actions)
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            const actionIdentifier = response.actionIdentifier;

            if (data?.slot) {
                // Record the hour to adapt future push times
                recordNotificationInteraction(data.slot as any);
            }

            if (actionIdentifier === 'write_niyyah' || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
                // Navigate user straight into the app dashboard/tabs
                router.push('/(tabs)');
            } else if (actionIdentifier === 'snooze') {
                // Rescheduling feature
                console.log('User snoozed the notification');
            }
        });

        return () => subscription.remove();
    }, [router]);

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
