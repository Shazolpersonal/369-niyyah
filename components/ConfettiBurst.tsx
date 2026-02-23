import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    Extrapolation,
    withDelay,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#D4A847', '#0D9488'];

interface ConfettiPieceProps {
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
    duration: number;
    onComplete?: () => void;
}

const ConfettiPiece = ({ x, y, color, size, delay, duration, onComplete }: ConfettiPieceProps) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(delay, withTiming(1, { duration }));
    }, [delay, duration]);

    const rStyle = useAnimatedStyle(() => {
        // Add gravity effect: particles drop further down as time progresses
        const gravityY = interpolate(progress.value, [0, 0.5, 1], [0, y, y + 80], Extrapolation.CLAMP);
        const translateY = interpolate(progress.value, [0, 1], [0, gravityY], Extrapolation.CLAMP);
        const translateX = interpolate(progress.value, [0, 1], [0, x], Extrapolation.CLAMP);
        const opacity = interpolate(progress.value, [0, 0.7, 1], [1, 1, 0], Extrapolation.CLAMP);
        const rotate = interpolate(progress.value, [0, 1], [0, Math.PI * 6], Extrapolation.CLAMP);
        const scale = interpolate(progress.value, [0, 0.2, 1], [0, 1, 0.4], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [
                { translateX },
                { translateY },
                { rotate: `${rotate}rad` },
                { scale },
            ],
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2, // making them circles
        };
    });

    return <Animated.View style={[styles.confetti, rStyle]} />;
};

interface ConfettiBurstProps {
    count?: number;
    duration?: number;
    onComplete?: () => void;
}

export function ConfettiBurst({ count = 40, duration = 1500, onComplete }: ConfettiBurstProps) {
    const [pieces, setPieces] = useState<any[]>([]);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        const newPieces = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * width * 0.8,
            y: (Math.random() - 0.5) * height * 0.5 - 20, // Start slightly higher
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: Math.random() * 8 + 5, // Slightly larger
            delay: Math.random() * 150, // Faster burst sequence
        }));
        setPieces(newPieces);

        const timer = setTimeout(() => {
            onCompleteRef.current?.();
        }, duration + 300);

        return () => clearTimeout(timer);
    }, [count, duration]);

    return (
        <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
            {pieces.map((p) => (
                <ConfettiPiece
                    key={p.id}
                    x={p.x}
                    y={p.y}
                    color={p.color}
                    size={p.size}
                    delay={p.delay}
                    duration={duration}
                />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    confetti: {
        position: 'absolute',
        top: '50%',
        left: '50%',
    },
});
