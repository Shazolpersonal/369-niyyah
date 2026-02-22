import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Calendar } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import AdBanner from '../../components/AdBanner';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFontFamily } from '../../utils/fonts';
import { COLORS, SHADOWS } from '../../utils/theme';
import { SPRING_CONFIG_BOUNCY } from '../../utils/animations';

function TabIcon({ icon: Icon, color, focused }: { icon: any; color: string; focused: boolean }) {
    const rStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(focused ? 1.15 : 1, SPRING_CONFIG_BOUNCY) }],
    }));

    return (
        <Animated.View style={[styles.iconContainer, rStyle]}>
            <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
        </Animated.View>
    );
}

export default function TabLayout() {
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: '#94A3B8',
                    tabBarStyle: styles.tabBar,
                    tabBarLabelStyle: {
                        fontFamily: f('semibold'),
                        fontSize: 11,
                        marginTop: -2,
                        marginBottom: Platform.OS === 'ios' ? 0 : 8,
                    },
                    tabBarItemStyle: {
                        paddingTop: 8,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t('tabs.home'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon icon={Home} color={color} focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: t('tabs.history'),
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon icon={Calendar} color={color} focused={focused} />
                        ),
                    }}
                />
            </Tabs>

            {/* AdMob Banner — sits above the tab bar via absolute positioning */}
            <View style={styles.adContainer}>
                <AdBanner />
            </View>
        </>
    );
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        height: TAB_BAR_HEIGHT,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 8 },
        }),
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 3,
    },
    adContainer: {
        position: 'absolute',
        bottom: TAB_BAR_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});
