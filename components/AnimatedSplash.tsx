import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    runOnJS,
    Easing,
    withRepeat,
    interpolate,
    Extrapolation,
    SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { useLanguage } from '../contexts/LanguageContext';
import { SPRING_CONFIG, SPRING_CONFIG_BOUNCY, TIMING_CONFIG_SMOOTH, TIMING_CONFIG_SLOW } from '../utils/animations';

const { width, height } = Dimensions.get('window');

// Number of particles for the background starry effect
const NUM_PARTICLES = 20;

interface AnimatedSplashProps {
    onAnimationComplete: () => void;
    isAppReady: boolean;
}

// Generate random particles once
const particles = Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * width * 1.5,
    y: (Math.random() - 0.5) * height * 1.5,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 1000,
}));

export default function AnimatedSplash({ onAnimationComplete, isAppReady }: AnimatedSplashProps) {
    const [animationDone, setAnimationDone] = useState(false);
    const { t, language } = useLanguage();

    // -- Shared Values --
    // Logo
    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    // Glow ring
    const glowOpacity = useSharedValue(0);
    const glowScale = useSharedValue(0.8);
    // Text
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(30);
    // Geometric Pattern
    const patternOpacity = useSharedValue(0);
    const patternScale = useSharedValue(0.8);
    const patternRotate = useSharedValue(0);
    // Particles progress (0 to 1)
    const particlesProgress = useSharedValue(0);
    // Exit Strategy
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        if (isAppReady) {
            setTimeout(async () => {
                await SplashScreen.hideAsync();
                startAnimation();
            }, 100);
        }
    }, [isAppReady]);

    const startAnimation = () => {
        // 1. Geometric Pattern scales and rotates in slowly
        patternOpacity.value = withTiming(0.15, { duration: 2500, easing: Easing.out(Easing.cubic) });
        patternScale.value = withTiming(1.2, { duration: 3000, easing: Easing.out(Easing.cubic) });
        patternRotate.value = withTiming(1, { duration: 4000, easing: Easing.out(Easing.cubic) });

        // 2. Logo entrance with spring
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withSpring(1, SPRING_CONFIG_BOUNCY);

        // 3. Continuous glow effect
        glowOpacity.value = withDelay(400, withTiming(0.5, { duration: 800 }));
        glowScale.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );

        // 4. Text entrance
        textOpacity.value = withDelay(700, withTiming(1, TIMING_CONFIG_SMOOTH));
        textTranslateY.value = withDelay(700, withSpring(0, SPRING_CONFIG));

        // 5. Particles drift outward
        particlesProgress.value = withTiming(1, { duration: 4500, easing: Easing.out(Easing.cubic) });

        // 6. Exit - smooth cross-dissolve to main app
        setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 800 }, (finished) => {
                if (finished) runOnJS(setAnimationDone)(true);
            });
        }, 3200);
    };

    useEffect(() => {
        if (animationDone) {
            onAnimationComplete();
        }
    }, [animationDone]);

    // -- Animated Styles --
    const rLogoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const rGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const rTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const rPatternStyle = useAnimatedStyle(() => ({
        opacity: patternOpacity.value,
        transform: [
            { scale: patternScale.value },
            { rotate: `${patternRotate.value * 45}deg` } // Subtle rotation
        ],
    }));

    const rContainerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    if (animationDone) return null;

    return (
        <Animated.View style={[styles.container, rContainerStyle]}>
            {/* Geometric SVG Pattern background */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.patternContainer, rPatternStyle]}>
                <Svg height="150%" width="150%" viewBox="0 0 100 100" opacity={0.5}>
                    {/* Simplified 8-point Islamic star motif path */}
                    <Path
                        d="M50 0 L55 35 L90 20 L65 45 L100 50 L65 55 L90 80 L55 65 L50 100 L45 65 L10 80 L35 55 L0 50 L35 45 L10 20 L45 35 Z"
                        fill="none"
                        stroke="#D4A847"
                        strokeWidth="0.5"
                    />
                    <Path
                        d="M50 15 L53 38 L75 25 L58 45 L85 50 L58 55 L75 75 L53 62 L50 85 L47 62 L25 75 L42 55 L15 50 L42 45 L25 25 L47 38 Z"
                        fill="none"
                        stroke="#0D9488"
                        strokeWidth="0.25"
                    />
                </Svg>
            </Animated.View>

            {/* Particles layer */}
            {particles.map((p) => (
                <Particle key={p.id} p={p} progress={particlesProgress} />
            ))}

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
        backgroundColor: '#020617', // Extremely dark slate/indigo
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    patternContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    particle: {
        position: 'absolute',
        backgroundColor: '#D4A847', // Gold color for stars
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
        backgroundColor: 'rgba(212, 168, 71, 0.08)', // Gold glow
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
        textShadowColor: 'rgba(212, 168, 71, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.85)',
    },
});

function Particle({ p, progress }: { p: any; progress: SharedValue<number> }) {
    const rParticleStyle = useAnimatedStyle(() => {
        const driftX = interpolate(progress.value, [0, 1], [0, p.x]);
        const driftY = interpolate(progress.value, [0, 1], [0, p.y]);
        const opacity = interpolate(progress.value, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]);
        return {
            opacity,
            transform: [{ translateX: driftX }, { translateY: driftY }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                { width: p.size, height: p.size, borderRadius: p.size / 2 },
                rParticleStyle,
            ]}
        />
    );
}
