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
import { requestNotificationPermissions, scheduleAllNotifications } from '../utils/notifications';

const { width } = Dimensions.get('window');

interface Slide {
    id: string;
    emoji: string;
    title: string;
    description: string;
}

const slides: Slide[] = [
    {
        id: '1',
        emoji: '🕌',
        title: 'Bismillah',
        description:
            'Welcome to 369 Niyyah. Begin every day with intention and end it with gratitude. This app helps you build a stronger connection with Allah through daily written affirmations.',
    },
    {
        id: '2',
        emoji: '✨',
        title: 'The 369 Method',
        description:
            'Write your affirmation 3 times every morning, 6 times at noon, and 9 times before bed. This powerful repetition trains your mind to align with your faith and goals.',
    },
    {
        id: '3',
        emoji: '🚀',
        title: "Let's Begin",
        description:
            "Every day is a gift from Allah. Your journey to becoming a better Muslim starts now. Bismillah, let's go.",
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { completeOnboarding } = useProgress();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

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
                style={{ fontFamily: 'Inter_700Bold' }}
            >
                {item.title}
            </Text>
            <Text
                className="text-lg text-slate-600 text-center leading-8"
                style={{ fontFamily: 'Inter_400Regular' }}
            >
                {item.description}
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
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        {isLastSlide ? 'Get Started' : 'Next'}
                    </Text>
                </Pressable>

                {!isLastSlide && (
                    <Pressable onPress={handleStart} className="mt-4 py-2">
                        <Text
                            className="text-slate-500 text-center"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Skip
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
