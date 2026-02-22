import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, DeviceEventEmitter, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    SlideInUp,
    SlideOutUp,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

import { getFontFamily } from '../utils/fonts';
import { useLanguage } from '../contexts/LanguageContext';
import { SHADOWS } from '../utils/theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number;
}

export const ToastEvent = 'SHOW_TOAST';

export function showToast(config: ToastConfig | string) {
    if (typeof config === 'string') {
        DeviceEventEmitter.emit(ToastEvent, { message: config, type: 'success' });
    } else {
        DeviceEventEmitter.emit(ToastEvent, config);
    }
}

export function ToastProvider() {
    const { language } = useLanguage();
    const insets = useSafeAreaInsets();
    const [toast, setToast] = useState<ToastConfig | null>(null);

    const translateY = useSharedValue(-150);
    const opacity = useSharedValue(0);

    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener(ToastEvent, (config: ToastConfig) => {
            setToast(config);

            // Animate in
            translateY.value = withSpring(insets.top + (Platform.OS === 'ios' ? 10 : 20), {
                damping: 14,
                stiffness: 120,
            });
            opacity.value = withTiming(1, { duration: 300 });

            // Auto dismiss
            const duration = config.duration || 3000;
            if (duration > 0) {
                setTimeout(() => {
                    hideToast();
                }, duration);
            }
        });

        return () => listener.remove();
    }, [insets.top]);

    const hideToast = () => {
        translateY.value = withTiming(-150, { duration: 300, easing: Easing.in(Easing.ease) }, (finished) => {
            if (finished) runOnJS(setToast)(null);
        });
        opacity.value = withTiming(0, { duration: 300 });
    };

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'error': return <AlertCircle size={20} color="#EF4444" />;
            case 'info': return <Info size={20} color="#3B82F6" />;
            case 'success':
            default: return <CheckCircle2 size={20} color="#10B981" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'error': return '#FEF2F2';
            case 'info': return '#EFF6FF';
            case 'success':
            default: return '#ECFDF5';
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'error': return '#FECACA';
            case 'info': return '#BFDBFE';
            case 'success':
            default: return '#A7F3D0';
        }
    };

    const getTextColor = () => {
        switch (toast.type) {
            case 'error': return '#991B1B';
            case 'info': return '#1E3A8A';
            case 'success':
            default: return '#065F46';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                rStyle,
                SHADOWS.md as any,
                {
                    backgroundColor: getBgColor(),
                    borderColor: getBorderColor(),
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.content}>
                {getIcon()}
                <Text
                    style={[
                        styles.message,
                        { fontFamily: f('medium'), color: getTextColor() },
                    ]}
                >
                    {toast.message}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        borderRadius: 16,
        padding: 16,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    message: {
        fontSize: 15,
        marginLeft: 12,
        flex: 1,
    },
});
