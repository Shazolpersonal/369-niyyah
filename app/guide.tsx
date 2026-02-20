import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function GuideScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text
                    className="text-lg font-semibold text-slate-800"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                    How It Works
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
            >
                {/* What is 369 Niyyah */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        🕌 What is 369 Niyyah?
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        369 Niyyah is your daily companion for building a stronger connection
                        with Allah through the power of written affirmations. Based on the
                        369 manifestation method, this app helps you internalize positive
                        Islamic beliefs by writing them repeatedly throughout the day.
                    </Text>
                </View>

                {/* The 369 Method */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        ✨ The 369 Method
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7 mb-3"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        The method is simple but powerful:
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">🌅</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Morning Niyyah (8 AM – 1 PM)
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                                    Write your affirmation 3 times to set your intention for the day.
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">☀️</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Afternoon Niyyah (1 PM – 6 PM)
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                                    Write it 6 times to refocus your mind and remember Allah.
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">🌙</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Evening Niyyah (6 PM – 5 AM)
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                                    Write it 9 times to end the day with gratitude and peace.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* How to Write */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        ✍️ How to Write
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        Each session shows you an affirmation at the top of the screen. Type
                        it exactly as shown. The text will highlight in real-time:{'\n\n'}
                        🟢 Green = You're typing correctly{'\n'}
                        🔴 Red = There's a mismatch{'\n'}
                        ⚪ Gray = Not yet typed{'\n\n'}
                        When you reach 80% accuracy, the Submit button becomes active. At
                        100%, it auto-submits. After all repetitions are done, you'll see a
                        beautiful "Alhamdulillah, Complete!" animation.
                    </Text>
                </View>

                {/* Daily Themes */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        📖 Daily Themes
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        The app contains 41 days of unique affirmations covering 17 Islamic
                        themes, including Tawakkul, Sabr, Shukr, Health, Family, Rizq,
                        Self-Discipline, Taqwa, and more. After Day 41, the cycle repeats
                        with fresh perspective.
                    </Text>
                </View>

                {/* Streaks */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        🔥 Streaks & Progress
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        Complete all three sessions (Morning, Afternoon, Evening) to mark a
                        day as complete. Build your streak by completing consecutive days.
                        Check your progress in the calendar view to see your journey.
                    </Text>
                </View>

                {/* Dua */}
                <View className="bg-emerald-50 rounded-2xl p-5 items-center">
                    <Text className="text-3xl mb-3">🤲</Text>
                    <Text
                        className="text-base text-emerald-700 text-center leading-7"
                        style={{ fontFamily: 'Inter_500Medium' }}
                    >
                        "Verily, with hardship comes ease."{'\n'}
                        — Quran 94:6
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
