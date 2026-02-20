import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
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
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handler
configureNotificationHandler();

export default function RootLayout() {
    const [splashComplete, setSplashComplete] = useState(false);

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
                    </View>
                </ProgressProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
}
