import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    Dimensions,
    FlatList,
    ViewToken,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../contexts/ProgressContext';
import { useLanguage } from '../contexts/LanguageContext';
import { requestNotificationPermissions, scheduleAllNotifications } from '../utils/notifications';
import { getFontFamily } from '../utils/fonts';

const { width } = Dimensions.get('window');

interface Slide {
    id: string;
    emoji: string;
    titleKey: string;
    descriptionKey: string;
}

const slides: Slide[] = [
    {
        id: '1',
        emoji: '🕌',
        titleKey: 'onboarding.slide1.title',
        descriptionKey: 'onboarding.slide1.description',
    },
    {
        id: '2',
        emoji: '✨',
        titleKey: 'onboarding.slide2.title',
        descriptionKey: 'onboarding.slide2.description',
    },
    {
        id: '3',
        emoji: '🚀',
        titleKey: 'onboarding.slide3.title',
        descriptionKey: 'onboarding.slide3.description',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { completeOnboarding } = useProgress();
    const { t, language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        }
    };

    const handleStart = async () => {
        // Only request notification permissions on native platforms
        if (Platform.OS !== 'web') {
            const granted = await requestNotificationPermissions();
            if (granted) {
                await scheduleAllNotifications();
            }
        }

        await completeOnboarding();
        router.replace('/');
    };

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <Text className="text-8xl mb-8">{item.emoji}</Text>
            <Text
                className="text-3xl font-bold text-emerald-700 mb-6 text-center"
                style={{ fontFamily: f('bold') }}
            >
                {t(item.titleKey)}
            </Text>
            <Text
                className="text-lg text-slate-600 text-center leading-8"
                style={{ fontFamily: f('regular') }}
            >
                {t(item.descriptionKey)}
            </Text>
        </View>
    );

    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={renderSlide}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    bounces={false}
                />
            </View>

            {/* Pagination Dots */}
            <View className="flex-row justify-center items-center py-4">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className={`w-3 h-3 rounded-full mx-2 ${index === currentIndex ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                ))}
            </View>

            {/* Buttons */}
            <View className="px-8 pb-8">
                <Pressable
                    onPress={isLastSlide ? handleStart : handleNext}
                    className="bg-emerald-500 py-4 rounded-2xl active:bg-emerald-600"
                >
                    <Text
                        className="text-white text-xl text-center font-semibold"
                        style={{ fontFamily: f('semibold') }}
                    >
                        {isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
                    </Text>
                </Pressable>

                {!isLastSlide && (
                    <Pressable onPress={handleStart} className="mt-4 py-2">
                        <Text
                            className="text-slate-500 text-center"
                            style={{ fontFamily: f('regular') }}
                        >
                            {t('onboarding.skip')}
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
