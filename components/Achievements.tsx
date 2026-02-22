import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useProgress } from '../contexts/ProgressContext';
import { getAchievements } from '../utils/achievements';
import { COLORS, SHADOWS } from '../utils/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ConfettiBurst } from './ConfettiBurst';

export function Achievements() {
    const { dailyProgress, trueStreak, totalElapsedDays } = useProgress();
    const { t, language } = useLanguage();
    const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const badges = getAchievements(dailyProgress, trueStreak, totalElapsedDays);

    const handlePress = (badgeId: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setActiveBadgeId(badgeId);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontFamily: f('bold') }]}>
                {t('achievements.title')}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {badges.map((badge, index) => (
                    <Animated.View
                        key={badge.id}
                        entering={FadeInRight.delay(index * 100).duration(400)}
                        style={styles.badgeOuter}
                    >
                        {badge.isUnlocked ? (
                            /* ─── Unlocked: Gold shimmer card ─── */
                            <Pressable
                                style={styles.unlockedCard}
                                onPress={() => handlePress(badge.id)}
                            >
                                <LinearGradient
                                    colors={['#D4A847', '#F5D98C', '#C49B3A'] as any}
                                    style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                                {/* Inner glass layer */}
                                <View style={styles.unlockedGlass} />

                                <View style={styles.iconGlowRing}>
                                    <Text style={styles.icon}>{badge.icon}</Text>
                                </View>

                                <Text
                                    style={[styles.badgeTitle, styles.unlockedTitle, { fontFamily: f('bold') }]}
                                    numberOfLines={1}
                                >
                                    {t(badge.titleKey)}
                                </Text>

                                <Text
                                    style={[styles.badgeDesc, styles.unlockedDesc, { fontFamily: f('regular') }]}
                                    numberOfLines={2}
                                >
                                    {t(badge.descriptionKey)}
                                </Text>

                                {activeBadgeId === badge.id && (
                                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                        <ConfettiBurst count={30} onComplete={() => setActiveBadgeId(null)} />
                                    </View>
                                )}
                            </Pressable>
                        ) : (
                            /* ─── Locked: Dark frosted glass card ─── */
                            <View style={styles.lockedCard}>
                                <View style={styles.lockedIconWrapper}>
                                    <Text style={styles.lockedIcon}>🔒</Text>
                                </View>

                                <Text
                                    style={[styles.badgeTitle, styles.lockedTitle, { fontFamily: f('semibold') }]}
                                    numberOfLines={1}
                                >
                                    {t(badge.titleKey)}
                                </Text>

                                <Text
                                    style={[styles.badgeDesc, styles.lockedDesc, { fontFamily: f('regular') }]}
                                    numberOfLines={2}
                                >
                                    {t(badge.descriptionKey)}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 14,
        letterSpacing: 0.3,
    },
    scrollView: {
        marginHorizontal: -20,
        paddingHorizontal: 0,
    },
    scrollContent: {
        paddingLeft: 20,
        paddingRight: 32,
        paddingBottom: 8,
    },
    badgeOuter: {
        marginRight: 12,
    },

    // ─── Unlocked Card ───
    unlockedCard: {
        width: 130,
        height: 165,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.5)',
        shadowColor: '#D4A847',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    unlockedGlass: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 18,
    },
    iconGlowRing: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 8,
    },
    icon: {
        fontSize: 28,
    },
    badgeTitle: {
        textAlign: 'center',
        marginTop: 4,
        fontSize: 13,
        paddingHorizontal: 8,
    },
    unlockedTitle: {
        color: '#3B1F00',
    },
    badgeDesc: {
        textAlign: 'center',
        marginTop: 2,
        fontSize: 10,
        paddingHorizontal: 6,
        lineHeight: 14,
    },
    unlockedDesc: {
        color: 'rgba(59, 31, 0, 0.7)',
    },

    // ─── Locked Card ───
    lockedCard: {
        width: 130,
        height: 165,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.3)',
    },
    lockedIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        marginBottom: 8,
    },
    lockedIcon: {
        fontSize: 24,
        opacity: 0.6,
    },
    lockedTitle: {
        color: 'rgba(148, 163, 184, 0.8)',
    },
    lockedDesc: {
        color: 'rgba(100, 116, 139, 0.7)',
    },
});
