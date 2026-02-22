import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { DayStatus } from '../types';
import { COLORS } from '../utils/theme';
import { SPRING_CONFIG } from '../utils/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';

interface CalendarDayProps {
    day: number;
    status: DayStatus;
    isToday: boolean;
    onPress?: () => void;
}

// Vibrant heatmap colors optimized for dark calendar background
const HEATMAP_STYLES: Record<DayStatus, { bg: string; text: string }> = {
    complete: { bg: '#10B981', text: '#FFFFFF' },         // bright emerald
    partial: { bg: '#F59E0B', text: '#FFFFFF' },         // warm amber
    missed: { bg: 'rgba(244, 63, 94, 0.7)', text: '#FFF1F2' }, // rose
    future: { bg: 'rgba(30, 41, 59, 0.5)', text: '#475569' },  // dark slate
    pending: { bg: 'rgba(51, 65, 85, 0.6)', text: '#94A3B8' },  // mid slate
};

function CalendarDayComponent({ day, status, isToday, onPress }: CalendarDayProps) {
    const { bg, text } = HEATMAP_STYLES[status];
    const { language } = useLanguage();

    // Animations
    const scale = useSharedValue(1);
    const glowPulse = useSharedValue(isToday ? 1 : 0);

    useEffect(() => {
        if (isToday) {
            glowPulse.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            glowPulse.value = 0;
        }
    }, [isToday]);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const rGlowStyle = useAnimatedStyle(() => ({
        opacity: glowPulse.value,
        borderWidth: 2.5,
        borderColor: '#D4A847',
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
    }));

    // Outer glow ring for today
    const rOuterGlowStyle = useAnimatedStyle(() => ({
        opacity: glowPulse.value * 0.4,
        borderWidth: 1,
        borderColor: '#D4A847',
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
    }));

    const handlePressIn = () => {
        if (onPress) scale.value = withSpring(0.82, SPRING_CONFIG);
    };

    const handlePressOut = () => {
        if (onPress) scale.value = withSpring(1, SPRING_CONFIG);
    };

    const content = (
        <Animated.View style={[styles.container, rStyle]}>
            <View style={[styles.circle, { backgroundColor: bg }]}>
                {isToday && <Animated.View style={rGlowStyle} />}
                {isToday && <Animated.View style={rOuterGlowStyle} />}
                <Text style={[
                    styles.dayText,
                    {
                        color: text,
                        fontWeight: isToday ? '800' : '600',
                        fontFamily: getFontFamily(language, isToday ? 'bold' : 'semibold'),
                    }
                ]}>
                    {day}
                </Text>
            </View>
        </Animated.View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
                {content}
            </Pressable>
        );
    }

    return content;
}

export const CalendarDay = React.memo(CalendarDayComponent, (prevProps, nextProps) => {
    return (
        prevProps.day === nextProps.day &&
        prevProps.status === nextProps.status &&
        prevProps.isToday === nextProps.isToday
    );
});

const styles = StyleSheet.create({
    pressable: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 3,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 14,
    }
});
