import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing,
    interpolate,
    Extrapolation,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../utils/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RepetitionCounterProps {
    total: number;
    completed: number;
    size?: number;
    strokeWidth?: number;
}

export function RepetitionCounter({
    total,
    completed,
    size = 120,
    strokeWidth = 12,
}: RepetitionCounterProps) {
    const { language } = useLanguage();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Animation values
    const progress = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        const targetProgress = total > 0 ? completed / total : 0;

        // Ensure progress strictly between 0 and 1
        progress.value = withTiming(Math.min(Math.max(targetProgress, 0), 1), {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });

        // Add a slight satisfying pop when completing a unit
        if (completed > 0 && completed <= total) {
            scale.value = withSequence(
                withTiming(1.08, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 150 })
            );
        }
    }, [completed, total]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = interpolate(
            progress.value,
            [0, 1],
            [circumference, 0],
            Extrapolation.CLAMP
        );
        return {
            strokeDashoffset,
        };
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(16, 185, 129, 0.15)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Animated Progress Fill */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={COLORS.goldLight}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    // Rotate -90 degrees to start at the top
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={[styles.numberText, { fontFamily: getFontFamily(language, 'bold') }]}>
                    {completed}
                    <Text style={[styles.totalText, { fontFamily: getFontFamily(language, 'regular') }]}>/{total}</Text>
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 10,
    },
    textContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    totalText: {
        fontSize: 18,
        color: '#94A3B8',
        fontWeight: 'normal',
    },
});
