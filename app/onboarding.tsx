import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    TouchableOpacity,
    useWindowDimensions,
    ViewToken,
    Platform,
    StyleSheet,
} from 'react-native';
import { Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    FadeInDown,
    SharedValue,
} from 'react-native-reanimated';

import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';
import { requestNotificationPermissions, scheduleAllNotifications } from '../utils/notifications';
import { getFontFamily } from '../utils/fonts';

interface Slide {
    id: string;
    emoji: string;
    titleKey: string;
    descriptionKey: string;
}

const slides: Slide[] = [
    { id: '1', emoji: '🕌', titleKey: 'onboarding.slide1.title', descriptionKey: 'onboarding.slide1.description' },
    { id: '2', emoji: '✨', titleKey: 'onboarding.slide2.title', descriptionKey: 'onboarding.slide2.description' },
    { id: '3', emoji: '🚀', titleKey: 'onboarding.slide3.title', descriptionKey: 'onboarding.slide3.description' },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { completeOnboarding } = useProgress();
    const { t, language, setLanguage } = useLanguage();

    const [currentIndex, setCurrentIndex] = useState(0);
    const { width } = useWindowDimensions();
    const flatListRef = useRef<Animated.FlatList<Slide>>(null);
    const scrollX = useSharedValue(0);

    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'bn' : 'en');
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < slides.length) {
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
    };

    const handleStart = async () => {
        if (Platform.OS !== 'web') {
            const granted = await requestNotificationPermissions();
            if (granted) await scheduleAllNotifications();
        }
        await completeOnboarding();
        router.replace('/');
    };

    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#064E3B', '#0F766E', '#134E4A', '#1E293B', '#0F172A'] as any}
                locations={[0, 0.2, 0.35, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={{ flex: 1 }}>
                {/* Language Toggle */}
                <View style={styles.langRow}>
                    <TouchableOpacity onPress={toggleLanguage} activeOpacity={0.7}>
                        <View style={styles.langToggle}>
                            <Globe size={15} color="#D4A847" />
                            <Text style={[styles.langText, { fontFamily: f('semibold') }]}>
                                {language === 'en' ? 'বাংলা' : 'EN'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                    <Animated.FlatList
                        ref={flatListRef}
                        data={slides}
                        renderItem={({ item, index }) => (
                            <SlideItem item={item} index={index} scrollX={scrollX} t={t} f={f} width={width} />
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        bounces={false}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                    />
                </View>

                {/* Pagination Dots */}
                <View style={styles.paginationRow}>
                    {slides.map((_, index) => (
                        <PaginationDot key={index} index={index} scrollX={scrollX} width={width} />
                    ))}
                </View>

                {/* Buttons */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.buttonArea}>
                    <Pressable onPress={isLastSlide ? handleStart : handleNext}>
                        <View style={styles.ctaButton}>
                            <LinearGradient
                                colors={['#10B981', '#059669'] as any}
                                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                            />
                            <Text style={[styles.ctaText, { fontFamily: f('semibold') }]}>
                                {isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
                            </Text>
                        </View>
                    </Pressable>

                    {!isLastSlide && (
                        <Pressable onPress={handleStart} style={styles.skipBtn}>
                            <Text style={[styles.skipText, { fontFamily: f('regular') }]}>
                                {t('onboarding.skip')}
                            </Text>
                        </Pressable>
                    )}
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

// ─── Slide Item ─────────────────────────────────────────────────
function SlideItem({
    item, index, scrollX, t, f, width,
}: {
    item: Slide; index: number; scrollX: SharedValue<number>;
    t: (key: string) => string;
    f: (weight: 'regular' | 'medium' | 'semibold' | 'bold') => string;
    width: number;
}) {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const rEmojiStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [width * 0.6, 0, -width * 0.6], Extrapolation.CLAMP);
        const scale = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP);
        const rotate = interpolate(scrollX.value, inputRange, [Math.PI / 5, 0, -Math.PI / 5], Extrapolation.CLAMP);
        return { transform: [{ translateX }, { scale }, { rotate: `${rotate}rad` }] };
    });

    const rTitleStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [width * 0.3, 0, -width * 0.3], Extrapolation.CLAMP);
        return { transform: [{ translateX }] };
    });

    const rDescStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [width * 0.15, 0, -width * 0.15], Extrapolation.CLAMP);
        return { transform: [{ translateX }] };
    });

    return (
        <View style={[styles.slide, { width }]}>
            {/* Emoji with glow ring */}
            <View style={styles.emojiGlow}>
                <Animated.Text style={[rEmojiStyle, styles.emoji]}>
                    {item.emoji}
                </Animated.Text>
            </View>
            <Animated.Text style={[rTitleStyle, styles.slideTitle, { fontFamily: f('bold') }]}>
                {t(item.titleKey)}
            </Animated.Text>
            <Animated.Text style={[rDescStyle, styles.slideDesc, { fontFamily: f('regular') }]}>
                {t(item.descriptionKey)}
            </Animated.Text>
        </View>
    );
}

// ─── Pagination Dot ──────────────────────────────────────────────
function PaginationDot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
    const rDotStyle = useAnimatedStyle(() => {
        const dotWidth = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [8, 24, 8], Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.3, 1, 0.3], Extrapolation.CLAMP
        );
        return { width: dotWidth, opacity };
    });

    return (
        <Animated.View style={[styles.dot, rDotStyle]} />
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 8,
        zIndex: 10,
    },
    langToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 168, 71, 0.12)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.2)',
    },
    langText: {
        color: '#D4A847',
        fontSize: 14,
        marginLeft: 6,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emojiGlow: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 168, 71, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.15)',
        marginBottom: 36,
    },
    emoji: {
        fontSize: 72,
    },
    slideTitle: {
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    slideDesc: {
        fontSize: 17,
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
        lineHeight: 28,
    },
    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: '#D4A847',
    },
    buttonArea: {
        paddingHorizontal: 32,
        paddingBottom: 32,
        marginTop: 8,
    },
    ctaButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 19,
    },
    skipBtn: {
        marginTop: 16,
        paddingVertical: 8,
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        fontSize: 15,
    },
});
