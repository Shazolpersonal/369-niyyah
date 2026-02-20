import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    runOnJS,
    Easing,
    withRepeat,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useLanguage } from '../contexts/LanguageContext';

interface AnimatedSplashProps {
    onAnimationComplete: () => void;
    isAppReady: boolean;
}

export default function AnimatedSplash({ onAnimationComplete, isAppReady }: AnimatedSplashProps) {
    const [animationDone, setAnimationDone] = useState(false);

    // Animation Values
    const logoScale = useSharedValue(0.8);
    const logoOpacity = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);
    const containerOpacity = useSharedValue(1);

    const { t, language } = useLanguage();

    useEffect(() => {
        if (isAppReady) {
            // Wait a frame then hide native splash and start complex animations
            setTimeout(async () => {
                await SplashScreen.hideAsync();
                startAnimation();
            }, 100);
        }
    }, [isAppReady]);

    const startAnimation = () => {
        // 1. Logo fades in and scales up
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withSpring(1, { damping: 12, stiffness: 80 });

        // 2. Glow effect starts after logo is mostly in
        setTimeout(() => {
            glowOpacity.value = withTiming(0.6, { duration: 800 });
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // infinite
                true // reverse
            );
        }, 500);

        // 3. App Name Text fades in and slides up
        setTimeout(() => {
            textOpacity.value = withTiming(1, { duration: 800 });
            textTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
        }, 1200);

        // 4. End the splash screen after sufficient time
        setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
                if (finished) {
                    runOnJS(setAnimationDone)(true);
                }
            });
        }, 3000); // the Splash stays visible for about 3 seconds before fading out
    };

    useEffect(() => {
        if (animationDone) {
            onAnimationComplete();
        }
    }, [animationDone]);

    // Animated Styles
    const rLogoStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            transform: [{ scale: logoScale.value }],
        };
    });

    const rGlowStyle = useAnimatedStyle(() => {
        return {
            opacity: glowOpacity.value,
            transform: [{ scale: glowScale.value }],
        };
    });

    const rTextStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        };
    });

    const rContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: containerOpacity.value,
        };
    });

    if (animationDone) return null;

    return (
        <Animated.View style={[styles.container, rContainerStyle]}>
            <View style={styles.content}>
                {/* Glow Ring */}
                <Animated.View style={[styles.glow, rGlowStyle]} />

                {/* Main Logo */}
                <Animated.Image
                    source={require('../assets/splash-icon.png')}
                    style={[styles.logo, rLogoStyle]}
                    resizeMode="contain"
                />

                {/* Text below logo */}
                <Animated.View style={[styles.textContainer, rTextStyle]}>
                    <Animated.Text style={[styles.title, { fontFamily: language === 'bn' ? 'NotoSansBengali_700Bold' : 'Inter_700Bold' }]}>
                        {t('app.name')}
                    </Animated.Text>
                    <Animated.Text style={[styles.subtitle, { fontFamily: language === 'bn' ? 'NotoSansBengali_400Regular' : 'Inter_400Regular' }]}>
                        {t('app.bismillah')}
                    </Animated.Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#020617',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    glow: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(234, 179, 8, 0.05)',
    },
    logo: {
        width: 220,
        height: 220,
    },
    textContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        color: '#FFFFFF',
        letterSpacing: 2,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.85)',
    },
});
