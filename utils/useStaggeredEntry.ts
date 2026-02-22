import { useEffect } from 'react';
import {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { SPRING_CONFIG_BOUNCY, TIMING_CONFIG_SMOOTH, getStaggerDelay } from './animations';

/**
 * Reusable hook for staggered entry animations
 * 
 * @param index - Index of the item in the list
 * @param baseDelay - Base delay before starting the animation sequence
 * @param staggerMs - Milliseconds to delay per index step
 * @param translateYDistance - Distance to slide up from (default 20px)
 */
export function useStaggeredEntry(
    index: number,
    baseDelay: number = 0,
    staggerMs: number = 100,
    translateYDistance: number = 30
) {
    const isMounted = useSharedValue(0);

    useEffect(() => {
        // Trigger the animation on mount
        const delay = getStaggerDelay(index, baseDelay, staggerMs);

        isMounted.value = withDelay(
            delay,
            withSpring(1, SPRING_CONFIG_BOUNCY)
        );
    }, [index, baseDelay, staggerMs]);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            isMounted.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            isMounted.value,
            [0, 1],
            [translateYDistance, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return { animatedStyle, isMounted };
}
