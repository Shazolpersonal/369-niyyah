import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { HelpCircle, Globe, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useProgress } from '../../contexts/ProgressContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TaskCard } from '../../components/TaskCard';
import { DailyQuote } from '../../components/DailyQuote';
import { BottomSheet } from '../../components/BottomSheet';
import { JourneyProgressRing } from '../../components/JourneyProgressRing';
import { showToast } from '../../components/Toast';

import { isSlotActive, getTodayEffectiveDateKey, getDisplayDay, isJourneyComplete } from '../../utils/timeSlotManager';
import { getAffirmationByLanguage } from '../../utils/contentCycler';
import { TimeSlot } from '../../types';
import { getFontFamily } from '../../utils/fonts';
import { COLORS, GRADIENTS, SHADOWS } from '../../utils/theme';
import { useStaggeredEntry } from '../../utils/useStaggeredEntry';

const { width } = Dimensions.get('window');

function StaggeredView({ children, index, delay = 0 }: { children: React.ReactNode, index: number, delay?: number }) {
    const { animatedStyle } = useStaggeredEntry(index, delay, 100, 20);
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export default function Dashboard() {
    const router = useRouter();
    const { dailyProgress, totalElapsedDays, trueStreak, isTodayComplete, isLoading, isFirstLaunch } = useProgress();
    const { t, language, setLanguage } = useLanguage();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAffirmation, setSelectedAffirmation] = useState('');

    const fireScale = useSharedValue(1);

    useEffect(() => {
        if (trueStreak > 0) {
            fireScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1, true
            );
        }
    }, [trueStreak]);

    const rFireStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fireScale.value }]
    }));

    if (!isLoading && isFirstLaunch) {
        return <Redirect href="/onboarding" />;
    }

    const todayKey = getTodayEffectiveDateKey();
    const todayProgress = dailyProgress[todayKey] || { morning: false, noon: false, night: false };

    const handleTaskPress = (slot: TimeSlot) => {
        if (todayProgress[slot]) {
            const affirmation = getAffirmationByLanguage(totalElapsedDays, slot, language);
            setSelectedAffirmation(affirmation);
            setModalVisible(true);
        } else {
            router.push(`/task/${slot}`);
        }
    };

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'bn' : 'en';
        setLanguage(newLang);
        showToast({
            message: newLang === 'en' ? 'Language switched to English' : 'ভাষা বাংলাতে পরিবর্তন করা হয়েছে',
            type: 'success',
        });
    };

    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={['#064E3B', '#0F172A'] as any} style={StyleSheet.absoluteFill} />
                <Text style={[styles.loadingText, { fontFamily: f('regular') }]}>
                    {t('app.loading')}
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Full-page gradient background */}
            <LinearGradient
                colors={['#064E3B', '#0F766E', '#134E4A', '#1E293B', '#0F172A'] as any}
                locations={[0, 0.12, 0.22, 0.40, 0.55]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* ─── Premium Header ─── */}
                <Animated.View entering={FadeIn.duration(800)}>
                    <View style={styles.header}>
                        {/* Islamic geometric pattern */}
                        <View style={styles.headerPattern}>
                            <Svg width={180} height={120} viewBox="0 0 200 80" opacity={0.06}>
                                <Path d="M100 0 L105 35 L140 20 L115 45 L150 50 L115 55 L140 80 L105 65 L100 100 L95 65 L60 80 L85 55 L50 50 L85 45 L60 20 L95 35 Z" fill="#D4A847" />
                                <Path d="M30 10 L33 30 L50 22 L38 38 L60 40 L38 42 L50 58 L33 50 L30 70 L27 50 L10 58 L22 42 L0 40 L22 38 L10 22 L27 30 Z" fill="#D4A847" />
                            </Svg>
                        </View>

                        <SafeAreaView>
                            <View style={styles.headerRow}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.headerEmoji}>🕌</Text>
                                    <Text style={[styles.headerTitle, { fontFamily: f('bold') }]}>
                                        {t('app.name')}
                                    </Text>
                                </View>
                                <View style={styles.headerRight}>
                                    <TouchableOpacity onPress={toggleLanguage} activeOpacity={0.7}>
                                        <View style={styles.langToggle}>
                                            <Globe size={15} color="#D4A847" />
                                            <Text style={[styles.langText, { fontFamily: f('semibold') }]}>
                                                {language === 'en' ? 'বা' : 'EN'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => router.push('/guide')} activeOpacity={0.7} style={styles.helpBtn}>
                                        <HelpCircle size={20} color="#D4A847" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={[styles.bismillah, { fontFamily: f('bold') }]}>
                                {t('app.bismillah')}
                            </Text>
                        </SafeAreaView>
                    </View>
                </Animated.View>

                {/* ─── Streak / Progress Section ─── */}
                <StaggeredView index={0}>
                    <View style={styles.progressSection}>
                        {isJourneyComplete(totalElapsedDays) ? (
                            <>
                                <Text style={[styles.mashaAllah, { fontFamily: f('bold') }]}>
                                    {t('dashboard.mashaAllah')}
                                </Text>
                                <Text style={[styles.journeyCompleteText, { fontFamily: f('semibold') }]}>
                                    {t('dashboard.journeyComplete')}
                                </Text>
                                <Text style={[styles.journeyCompleteMsg, { fontFamily: f('regular') }]}>
                                    {t('dashboard.journeyCompleteMsg')}
                                </Text>
                            </>
                        ) : (
                            <>
                                {trueStreak > 0 ? (
                                    <View style={styles.streakRow}>
                                        <Text style={[styles.streakText, { fontFamily: f('bold') }]}>
                                            {t('dashboard.streak')} {trueStreak}
                                        </Text>
                                        <Animated.View style={rFireStyle}>
                                            <Flame size={30} color="#F59E0B" fill="#F59E0B" />
                                        </Animated.View>
                                    </View>
                                ) : isTodayComplete ? (
                                    <View style={styles.todayCompleteBadge}>
                                        <Text style={[styles.todayCompleteText, { fontFamily: f('bold') }]}>
                                            {t('dashboard.todayComplete')} 🎉
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.startFresh, { fontFamily: f('semibold') }]}>
                                        {t('dashboard.startFresh')} ✨
                                    </Text>
                                )}
                                <View style={{ marginTop: 28, alignItems: 'center' }}>
                                    <JourneyProgressRing currentDay={getDisplayDay(totalElapsedDays)} />
                                </View>
                            </>
                        )}
                    </View>
                </StaggeredView>

                {/* ─── Daily Quote ─── */}
                <StaggeredView index={1}>
                    <DailyQuote />
                </StaggeredView>

                {/* ─── Task Cards ─── */}
                <View style={{ paddingHorizontal: 24 }}>
                    <StaggeredView index={2}>
                        <TaskCard slot="morning" isActive={isSlotActive('morning')} isCompleted={todayProgress.morning} onPress={() => handleTaskPress('morning')} />
                    </StaggeredView>
                    <StaggeredView index={3}>
                        <TaskCard slot="noon" isActive={isSlotActive('noon')} isCompleted={todayProgress.noon} onPress={() => handleTaskPress('noon')} />
                    </StaggeredView>
                    <StaggeredView index={4}>
                        <TaskCard slot="night" isActive={isSlotActive('night')} isCompleted={todayProgress.night} onPress={() => handleTaskPress('night')} />
                    </StaggeredView>
                </View>
            </ScrollView>

            {/* ─── Bottom Sheet Modal ─── */}
            <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle, { fontFamily: f('bold') }]}>
                        {t('dashboard.completedNiyyah')}
                    </Text>
                    <View style={styles.modalQuoteCard}>
                        <Text style={[styles.modalQuoteText, { fontFamily: f('medium') }]}>
                            "{selectedAffirmation}"
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8} style={styles.modalCloseBtn}>
                        <LinearGradient colors={GRADIENTS.emerald as any} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                        <Text style={[styles.modalCloseBtnText, { fontFamily: f('bold') }]}>
                            {t('dashboard.close')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
    },

    // ─── Header ───
    header: {
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    headerPattern: {
        position: 'absolute',
        top: 10,
        right: -20,
        opacity: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    langToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 168, 71, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.2)',
    },
    langText: {
        fontSize: 13,
        color: '#D4A847',
        marginLeft: 5,
    },
    helpBtn: {
        padding: 8,
        backgroundColor: 'rgba(212, 168, 71, 0.12)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.2)',
    },
    bismillah: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 17,
        color: '#D4A847',
        letterSpacing: 0.5,
    },

    // ─── Progress Section ───
    progressSection: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        alignItems: 'center',
    },
    mashaAllah: {
        fontSize: 28,
        color: '#10B981',
        textAlign: 'center',
    },
    journeyCompleteText: {
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 8,
    },
    journeyCompleteMsg: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: 8,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginRight: 8,
        letterSpacing: -0.5,
    },
    todayCompleteBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.25)',
    },
    todayCompleteText: {
        fontSize: 18,
        color: '#10B981',
        textAlign: 'center',
    },
    startFresh: {
        fontSize: 20,
        color: '#D4A847',
        textAlign: 'center',
    },

    // ─── Modal ───
    modalContent: {
        alignItems: 'center',
        paddingBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        color: COLORS.primary,
        marginBottom: 20,
    },
    modalQuoteCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24,
    },
    modalQuoteText: {
        fontSize: 17,
        color: '#1E293B',
        lineHeight: 28,
        textAlign: 'center',
    },
    modalCloseBtn: {
        width: '100%',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        overflow: 'hidden',
    },
    modalCloseBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
