import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    Easing,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    initiallyExpanded?: boolean;
}

export function Accordion({ title, children, initiallyExpanded = false }: AccordionProps) {
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const [contentHeight, setContentHeight] = useState(0);
    const progress = useSharedValue(initiallyExpanded ? 1 : 0);

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0) setContentHeight(height);
    }, []);

    const toggle = () => {
        setExpanded((prev) => {
            progress.value = withSpring(prev ? 0 : 1, {
                damping: 20,
                stiffness: 200,
            });
            return !prev;
        });
    };

    const rStyle = useAnimatedStyle(() => {
        if (contentHeight <= 0) {
            return {
                height: progress.value > 0.5 ? undefined : 0,
                opacity: progress.value,
                overflow: 'hidden' as const,
            };
        }
        return {
            height: interpolate(progress.value, [0, 1], [0, contentHeight], Extrapolation.CLAMP),
            opacity: progress.value,
            overflow: 'hidden' as const,
        };
    });

    const rIconStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
        ],
    }));

    return (
        <View style={styles.container}>
            <Pressable
                onPress={toggle}
                style={({ pressed }) => [
                    styles.header,
                    pressed && styles.headerPressed,
                ]}
            >
                <Text style={styles.titleText}>{title}</Text>
                <Animated.View style={rIconStyle}>
                    <ChevronDown size={20} color="#D4A847" />
                </Animated.View>
            </Pressable>

            <Animated.View style={rStyle}>
                <View onLayout={onLayout} style={styles.content}>
                    {children}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
    },
    headerPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    titleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 12,
    },
    content: {
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
});
