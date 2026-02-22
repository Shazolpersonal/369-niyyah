import {
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    WithSpringConfig,
    WithTimingConfig,
} from 'react-native-reanimated';

/**
 * 369 Niyyah Core Animation System
 * High-quality, satisfying animation presets to achieve a premium feel.
 */

export const SPRING_CONFIG: WithSpringConfig = {
    damping: 14,
    stiffness: 120,
    mass: 0.8,
};

export const SPRING_CONFIG_BOUNCY: WithSpringConfig = {
    damping: 10,
    stiffness: 150,
    mass: 1,
};

export const TIMING_CONFIG_SMOOTH: WithTimingConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const TIMING_CONFIG_SLOW: WithTimingConfig = {
    duration: 600,
    easing: Easing.out(Easing.cubic),
};

/**
 * Staggered delay utility for list items appearing sequentially
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0, staggerMs: number = 100) => {
    return baseDelay + index * staggerMs;
};

/**
 * Reusable entry animation style generator for components
 * @param index Sequence index for staggering
 */
export const getStaggeredEntryAnimatedStyle = (
    opacityValue: any,
    translateYValue: any,
    targetY: number = 20
) => {
    return {
        opacity: opacityValue,
        transform: [{ translateY: translateYValue }],
    };
};

/**
 * Trigger a pulse effect on a shared value
 */
export const triggerPulse = (sharedValue: any, targetScale: number = 1.05) => {
    'worklet';
    sharedValue.value = withSequence(
        withTiming(targetScale, { duration: 150, easing: Easing.ease }),
        withTiming(1, { duration: 250, easing: Easing.ease })
    );
};
