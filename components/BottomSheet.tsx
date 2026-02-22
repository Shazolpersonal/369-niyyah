import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { SPRING_CONFIG, SPRING_CONFIG_BOUNCY } from '../utils/animations';

const { height } = Dimensions.get('window');

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoint?: number;
}

export function BottomSheet({ visible, onClose, children, snapPoint = height * 0.5 }: BottomSheetProps) {
    const [renderModal, setRenderModal] = useState(visible);

    // Animation states
    const translateY = useSharedValue(height);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            setRenderModal(true);
            translateY.value = withSpring(0, SPRING_CONFIG_BOUNCY);
            backdropOpacity.value = withTiming(1, { duration: 400 });
        } else {
            translateY.value = withTiming(height, { duration: 300 }, (finished) => {
                if (finished) runOnJS(setRenderModal)(false);
            });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible]);

    const rBottomSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const rBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    if (!renderModal) return null;

    return (
        <Modal transparent visible={renderModal} animationType="none" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Blur Backdrop (simulated with semi-transparent dark view) */}
                <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, rBackdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                {/* Bottom Sheet Content */}
                <Animated.View style={[styles.sheet, rBottomSheetStyle, { maxHeight: snapPoint }]}>
                    <View style={styles.dragHandleContainer} pointerEvents="none">
                        <View style={styles.dragHandle} />
                    </View>
                    <View style={styles.contentContainer}>
                        {children}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // slate-900 with opacity
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40, // Safe area padding
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    dragHandle: {
        width: 48,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#CBD5E1', // slate-300
    },
    contentContainer: {
        paddingHorizontal: 24,
    }
});
