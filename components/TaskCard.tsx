import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Lock, ChevronRight } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TimeSlot } from '../types';
import { getSlotEmoji, getRepetitionTarget } from '../utils/timeSlotManager';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { SPRING_CONFIG } from '../utils/animations';

const SLOT_LABEL_KEYS: Record<TimeSlot, string> = {
    morning: 'slot.morning.label',
    noon: 'slot.noon.label',
    night: 'slot.night.label',
};

const SLOT_TIME_KEYS: Record<TimeSlot, string> = {
    morning: 'slot.morning.timeRange',
    noon: 'slot.noon.timeRange',
    night: 'slot.night.timeRange',
};

interface TaskCardProps {
    slot: TimeSlot;
    isActive: boolean;
    isCompleted: boolean;
    onPress: () => void;
    index?: number;
}

function TaskCardComponent({ slot, isActive, isCompleted, onPress, index = 0 }: TaskCardProps) {
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const label = t(SLOT_LABEL_KEYS[slot]);
    const emoji = getSlotEmoji(slot);
    const timeRange = t(SLOT_TIME_KEYS[slot]);
    const count = getRepetitionTarget(slot);

    // Animations
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            glowOpacity.value = withTiming(0);
        }
    }, [isActive]);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const rGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.96, SPRING_CONFIG);
    };

    const onPressOut = () => {
        scale.value = withSpring(1, SPRING_CONFIG);
    };

    const gradientColors = GRADIENTS[slot];

    // ─── Completed State ───
    if (isCompleted) {
        return (
            <Animated.View style={rStyle}>
                <Pressable
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={({ pressed }) => [
                        styles.card,
                        styles.completedCard,
                        pressed && { opacity: 0.9 }
                    ]}
                >
                    <View style={styles.completedIconContainer}>
                        <LinearGradient
                            colors={GRADIENTS.emerald as any}
                            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                        />
                        <Check size={22} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.completedLabel, { fontFamily: f('bold') }]}>
                            {emoji} {label}
                        </Text>
                        <Text style={[styles.completedSubtext, { fontFamily: f('regular') }]}>
                            {t('taskCard.completedTapToView')}
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // ─── Active State ───
    if (isActive) {
        return (
            <Animated.View style={rStyle}>
                <Pressable
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={[styles.card, styles.activeCard]}
                >
                    {/* Animated Glow Border */}
                    <Animated.View style={[StyleSheet.absoluteFill, styles.glowBorder, rGlowStyle]}>
                        <LinearGradient
                            colors={gradientColors as any}
                            style={[StyleSheet.absoluteFill, { borderRadius: 21 }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>

                    {/* Inner Card */}
                    <View style={styles.activeInner}>
                        <LinearGradient
                            colors={gradientColors as any}
                            style={styles.iconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={{ fontSize: 22 }}>{emoji}</Text>
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.activeLabel, { fontFamily: f('bold') }]}>
                                {label}
                            </Text>
                            <Text style={[styles.activeSubtext, { fontFamily: f('regular') }]}>
                                {timeRange} · {t('taskCard.write')} ×{count}
                            </Text>
                        </View>
                        <View style={styles.chevronContainer}>
                            <ChevronRight size={18} color="#D4A847" strokeWidth={2.5} />
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }

    // ─── Locked State ───
    return (
        <View style={[styles.card, styles.lockedCard]}>
            <View style={styles.lockedIconContainer}>
                <Lock size={18} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.lockedLabel, { fontFamily: f('bold') }]}>
                    {label}
                </Text>
                <Text style={[styles.lockedSubtext, { fontFamily: f('regular') }]}>
                    {timeRange} · {t('taskCard.write')} ×{count}
                </Text>
            </View>
        </View>
    );
}

export const TaskCard = React.memo(TaskCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.slot === nextProps.slot &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.isCompleted === nextProps.isCompleted &&
        prevProps.index === nextProps.index
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    // ─── Completed ───
    completedCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.25)',
    },
    completedIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    completedLabel: {
        fontSize: 17,
        color: '#10B981',
    },
    completedSubtext: {
        fontSize: 13,
        color: 'rgba(16, 185, 129, 0.7)',
        marginTop: 3,
    },

    // ─── Active ───
    activeCard: {
        padding: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    activeInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#0F172A',
        borderRadius: 19,
        margin: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    activeLabel: {
        fontSize: 17,
        color: '#FFFFFF',
    },
    activeSubtext: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 3,
    },
    chevronContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(212, 168, 71, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.15)',
    },
    glowBorder: {
        zIndex: -1,
        borderRadius: 21,
    },

    // ─── Locked ───
    lockedCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.2)',
        opacity: 0.6,
    },
    lockedIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        backgroundColor: 'rgba(51, 65, 85, 0.4)',
    },
    lockedLabel: {
        fontSize: 17,
        color: '#64748B',
    },
    lockedSubtext: {
        fontSize: 13,
        color: '#475569',
        marginTop: 3,
    },
});
