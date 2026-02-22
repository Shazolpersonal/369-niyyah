import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    SlideInRight,
    SlideInLeft,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useProgress } from '../../contexts/ProgressContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CalendarDay } from '../../components/CalendarDay';
import { BottomSheet } from '../../components/BottomSheet';
import { Achievements } from '../../components/Achievements';
import { getEffectiveTodayDate, formatLocalDateKey } from '../../utils/timeSlotManager';
import { DayStatus, DailyProgress } from '../../types';
import { getFontFamily } from '../../utils/fonts';
import { COLORS, GRADIENTS, SHADOWS } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MONTH_KEYS = [
    'history.month.january', 'history.month.february', 'history.month.march',
    'history.month.april', 'history.month.may', 'history.month.june',
    'history.month.july', 'history.month.august', 'history.month.september',
    'history.month.october', 'history.month.november', 'history.month.december',
];

const WEEKDAY_KEYS = [
    'history.weekday.sun', 'history.weekday.mon', 'history.weekday.tue',
    'history.weekday.wed', 'history.weekday.thu', 'history.weekday.fri',
    'history.weekday.sat',
];

function getDayStatus(
    progress: DailyProgress | null,
    isToday: boolean,
    isFuture: boolean
): DayStatus {
    if (isFuture) return 'future';
    if (!progress) return isToday ? 'pending' : 'missed';

    const completed = [progress.morning, progress.noon, progress.night].filter(Boolean).length;
    if (completed === 3) return 'complete';
    if (completed > 0) return isToday ? 'pending' : 'partial';
    return isToday ? 'pending' : 'missed';
}

// ─── Animated Counter ───────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 800;
        const startTime = Date.now();
        const startValue = displayValue;
        let rafId: ReturnType<typeof requestAnimationFrame>;
        let cancelled = false;

        const tick = () => {
            if (cancelled) return;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (value - startValue) * eased);
            setDisplayValue(current);
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [value]);

    return <Text>{displayValue}</Text>;
}

// ─── Mini Progress Ring ─────────────────────────────────────────
function MiniProgressRing({
    progress,
    color,
    trackColor = 'rgba(255,255,255,0.15)',
    size = 52,
    strokeWidth = 5,
}: {
    progress: number;
    color: string;
    trackColor?: string;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    const animatedProps = {
        strokeDashoffset: circumference * (1 - Math.min(progress, 1)),
    };

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={animatedProps.strokeDashoffset}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({
    value,
    label,
    color,
    gradientColors,
    icon,
    progress,
    index,
    fontFamily,
}: {
    value: number;
    label: string;
    color: string;
    gradientColors: readonly string[];
    icon: React.ReactNode;
    progress: number;
    index: number;
    fontFamily: (w: 'regular' | 'medium' | 'semibold' | 'bold') => string;
}) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 120).duration(600).springify().damping(14)}
            style={styles.statCard}
        >
            <LinearGradient
                colors={gradientColors as any}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Glassmorphism overlay */}
            <View style={styles.statGlassOverlay} />

            <View style={styles.statCardInner}>
                <MiniProgressRing progress={progress} color={color} size={48} strokeWidth={4} />
                <Text style={[styles.statValue, { fontFamily: fontFamily('bold'), color }]}>
                    <AnimatedNumber value={value} />
                </Text>
                <Text style={[styles.statLabel, { fontFamily: fontFamily('medium') }]}>
                    {label}
                </Text>
            </View>
        </Animated.View>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function HistoryScreen() {
    const router = useRouter();
    const { dailyProgress, startDate, trueStreak } = useProgress();
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const effectiveToday = getEffectiveTodayDate();
    const todayKey = formatLocalDateKey(effectiveToday);

    const [viewDate, setViewDate] = useState(new Date(effectiveToday));
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [monthKey, setMonthKey] = useState(viewDate.getTime());

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startDow = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: Array<{ day: number; dateKey: string } | null> = [];
        for (let i = 0; i < startDow; i++) days.push(null);
        for (let d = 1; d <= totalDays; d++) {
            const date = new Date(viewYear, viewMonth, d);
            days.push({ day: d, dateKey: formatLocalDateKey(date) });
        }
        return days;
    }, [viewYear, viewMonth]);

    const handlePrevMonth = () => {
        setDirection('left');
        const prev = new Date(viewYear, viewMonth - 1, 1);
        setViewDate(prev);
        setMonthKey(prev.getTime());
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(viewYear, viewMonth + 1, 1);
        if (nextMonth <= effectiveToday) {
            setDirection('right');
            setViewDate(nextMonth);
            setMonthKey(nextMonth.getTime());
        }
    };

    const handleDayPress = (dateKey: string) => {
        setSelectedDay(dateKey);
        setModalVisible(true);
    };

    const selectedProgress = selectedDay ? dailyProgress[selectedDay] : null;
    const canGoNext = new Date(viewYear, viewMonth + 1, 1) <= effectiveToday;

    // Stats for current month
    const monthStats = useMemo(() => {
        let complete = 0;
        let partial = 0;
        let total = 0;

        for (const cell of calendarDays) {
            if (!cell) continue;
            const { dateKey } = cell;
            const date = new Date(viewYear, viewMonth, cell.day);
            if (date > effectiveToday) continue;
            if (startDate && dateKey < startDate) continue;

            total++;
            const progress = dailyProgress[dateKey];
            if (progress) {
                const count = [progress.morning, progress.noon, progress.night].filter(Boolean).length;
                if (count === 3) complete++;
                else if (count > 0) partial++;
            }
        }

        return { complete, partial, total };
    }, [calendarDays, dailyProgress, startDate, effectiveToday]);

    // Legend items
    const legendItems = [
        { color: '#10B981', labelKey: 'history.complete' },
        { color: '#F59E0B', labelKey: 'history.partial' },
        { color: '#F43F5E', labelKey: 'history.missed' },
        { color: '#475569', labelKey: 'history.pending' },
    ];

    return (
        <View style={styles.rootContainer}>
            {/* ─── Full-page gradient background ─── */}
            <LinearGradient
                colors={['#064E3B', '#0F766E', '#134E4A', '#1E293B', '#F1F5F9'] as any}
                locations={[0, 0.15, 0.25, 0.45, 0.55]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* ─── Premium Header ─── */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
                    {/* Islamic geometric pattern overlay */}
                    <View style={styles.headerPatternOverlay}>
                        <Svg width="200" height="80" viewBox="0 0 200 80" opacity={0.08}>
                            <Path
                                d="M100 0 L105 35 L140 20 L115 45 L150 50 L115 55 L140 80 L105 65 L100 100 L95 65 L60 80 L85 55 L50 50 L85 45 L60 20 L95 35 Z"
                                fill="#D4A847"
                                stroke="none"
                            />
                            <Path
                                d="M30 10 L33 30 L50 22 L38 38 L60 40 L38 42 L50 58 L33 50 L30 70 L27 50 L10 58 L22 42 L0 40 L22 38 L10 22 L27 30 Z"
                                fill="#D4A847"
                                stroke="none"
                            />
                            <Path
                                d="M170 10 L173 30 L190 22 L178 38 L200 40 L178 42 L190 58 L173 50 L170 70 L167 50 L150 58 L162 42 L140 40 L162 38 L150 22 L167 30 Z"
                                fill="#D4A847"
                                stroke="none"
                            />
                        </Svg>
                    </View>

                    <View style={styles.headerContent}>
                        <Text style={[styles.headerEmoji]}>☪️</Text>
                        <Text style={[styles.headerTitle, { fontFamily: f('bold') }]}>
                            {t('history.title')}
                        </Text>
                        {trueStreak > 0 && (
                            <View style={styles.streakBadge}>
                                <Flame size={14} color="#F59E0B" />
                                <Text style={[styles.streakText, { fontFamily: f('bold') }]}>
                                    {trueStreak}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ─── Stats Row ─── */}
                    <View style={styles.statsRow}>
                        <StatCard
                            value={monthStats.complete}
                            label={t('history.complete')}
                            color="#10B981"
                            gradientColors={['rgba(16, 185, 129, 0.25)', 'rgba(6, 78, 59, 0.4)']}
                            icon={<TrendingUp size={18} color="#10B981" />}
                            progress={monthStats.total > 0 ? monthStats.complete / monthStats.total : 0}
                            index={0}
                            fontFamily={f}
                        />
                        <StatCard
                            value={monthStats.partial}
                            label={t('history.partial')}
                            color="#F59E0B"
                            gradientColors={['rgba(245, 158, 11, 0.2)', 'rgba(120, 53, 15, 0.35)']}
                            icon={<Calendar size={18} color="#F59E0B" />}
                            progress={monthStats.total > 0 ? monthStats.partial / monthStats.total : 0}
                            index={1}
                            fontFamily={f}
                        />
                        <StatCard
                            value={monthStats.total}
                            label={t('history.totalDays')}
                            color="#94A3B8"
                            gradientColors={['rgba(100, 116, 139, 0.2)', 'rgba(30, 41, 59, 0.4)']}
                            icon={<Calendar size={18} color="#94A3B8" />}
                            progress={1}
                            index={2}
                            fontFamily={f}
                        />
                    </View>

                    {/* ─── Achievements ─── */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                        <Achievements />
                    </Animated.View>

                    {/* ─── Calendar Card (Dark themed) ─── */}
                    <Animated.View
                        entering={FadeInUp.delay(400).duration(700).springify().damping(16)}
                        style={styles.calendarCard}
                    >
                        {/* Month Navigation */}
                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton} activeOpacity={0.6}>
                                <ChevronLeft size={22} color="#D4A847" />
                            </TouchableOpacity>
                            <View style={styles.monthTitleContainer}>
                                <Text style={[styles.monthTitle, { fontFamily: f('bold') }]}>
                                    {t(MONTH_KEYS[viewMonth])} {viewYear}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleNextMonth}
                                style={styles.navButton}
                                disabled={!canGoNext}
                                activeOpacity={0.6}
                            >
                                <ChevronRight size={22} color={canGoNext ? '#D4A847' : '#334155'} />
                            </TouchableOpacity>
                        </View>

                        {/* Weekday Headers */}
                        <View style={styles.weekdayRow}>
                            {WEEKDAY_KEYS.map((key) => (
                                <View key={key} style={styles.weekdayCell}>
                                    <Text style={[styles.weekdayText, { fontFamily: f('bold') }]}>
                                        {t(key)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Divider */}
                        <View style={styles.calendarDivider} />

                        {/* Calendar Grid */}
                        <Animated.View
                            key={monthKey}
                            entering={direction === 'right' ? SlideInRight.duration(350) : SlideInLeft.duration(350)}
                            style={styles.calendarGrid}
                        >
                            {calendarDays.map((cell, index) => (
                                <View key={index} style={styles.calendarCell}>
                                    {cell ? (
                                        <Animated.View entering={FadeIn.delay(index * 12).duration(300)}>
                                            <CalendarDay
                                                day={cell.day}
                                                status={getDayStatus(
                                                    dailyProgress[cell.dateKey] || null,
                                                    cell.dateKey === todayKey,
                                                    new Date(viewYear, viewMonth, cell.day) > effectiveToday ||
                                                    (startDate ? cell.dateKey < startDate : false)
                                                )}
                                                isToday={cell.dateKey === todayKey}
                                                onPress={() => handleDayPress(cell.dateKey)}
                                            />
                                        </Animated.View>
                                    ) : (
                                        <View style={{ width: 40, height: 40 }} />
                                    )}
                                </View>
                            ))}
                        </Animated.View>

                        {/* Legend inside calendar card */}
                        <View style={styles.legendDivider} />
                        <View style={styles.legendRow}>
                            {legendItems.map(({ color, labelKey }) => (
                                <View key={labelKey} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                                    <Text style={[styles.legendText, { fontFamily: f('medium') }]}>
                                        {t(labelKey)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Bottom spacer for tab bar */}
                    <View style={{ height: 80 }} />
                </ScrollView>
            </SafeAreaView>

            {/* ─── Day Detail Bottom Sheet ─── */}
            <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle, { fontFamily: f('bold') }]}>
                        {selectedDay}
                    </Text>

                    {selectedProgress ? (
                        <View style={styles.modalSlots}>
                            {[
                                { key: 'morning', label: t('history.morningNiyyah'), done: selectedProgress.morning, emoji: '🌅' },
                                { key: 'noon', label: t('history.afternoonNiyyah'), done: selectedProgress.noon, emoji: '☀️' },
                                { key: 'night', label: t('history.eveningNiyyah'), done: selectedProgress.night, emoji: '🌙' },
                            ].map((slot, i) => (
                                <Animated.View
                                    key={slot.key}
                                    entering={FadeInDown.delay(i * 100).duration(400)}
                                    style={[
                                        styles.modalSlotRow,
                                        slot.done && styles.modalSlotDone,
                                    ]}
                                >
                                    <Text style={styles.modalSlotEmoji}>{slot.emoji}</Text>
                                    <Text style={[styles.modalSlotLabel, { fontFamily: f('semibold') }]}>
                                        {slot.label}
                                    </Text>
                                    <View style={[
                                        styles.modalSlotBadge,
                                        { backgroundColor: slot.done ? '#10B981' : '#334155' }
                                    ]}>
                                        <Text style={[styles.modalSlotBadgeText, { fontFamily: f('bold') }]}>
                                            {slot.done ? '✓' : '—'}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.modalEmpty}>
                            <Text style={styles.modalEmptyEmoji}>📝</Text>
                            <Text style={[styles.modalEmptyText, { fontFamily: f('medium') }]}>
                                {t('history.noProgress')}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        activeOpacity={0.8}
                        style={styles.modalCloseBtn}
                    >
                        <LinearGradient
                            colors={GRADIENTS.emerald as any}
                            style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                        />
                        <Text style={[styles.modalCloseBtnText, { fontFamily: f('bold') }]}>
                            {t('history.close')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
    },

    // ─── Header ───
    header: {
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    headerPatternOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerEmoji: {
        fontSize: 22,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        flex: 1,
        letterSpacing: 0.5,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    streakText: {
        color: '#F59E0B',
        fontSize: 14,
        marginLeft: 4,
    },

    // ─── Scroll ───
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },

    // ─── Stats ───
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: 130,
    },
    statGlassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statCardInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    statValue: {
        fontSize: 26,
        marginTop: 6,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
        textAlign: 'center',
    },

    // ─── Calendar Card ───
    calendarCard: {
        backgroundColor: '#0F172A',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 16,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(212, 168, 71, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.15)',
    },
    monthTitleContainer: {
        alignItems: 'center',
    },
    monthTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekdayCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekdayText: {
        fontSize: 11,
        color: '#D4A847',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    calendarDivider: {
        height: 1,
        backgroundColor: 'rgba(212, 168, 71, 0.1)',
        marginBottom: 12,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: '14.28%' as any,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },

    // ─── Legend ───
    legendDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        marginTop: 16,
        marginBottom: 14,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },

    // ─── Bottom Sheet Modal ───
    modalContent: {
        paddingBottom: 8,
    },
    modalTitle: {
        fontSize: 22,
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalSlots: {
        gap: 12,
    },
    modalSlotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalSlotDone: {
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    modalSlotEmoji: {
        fontSize: 24,
        marginRight: 14,
    },
    modalSlotLabel: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    modalSlotBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSlotBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    modalEmpty: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalEmptyEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    modalEmptyText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
    modalCloseBtn: {
        marginTop: 24,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    modalCloseBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
