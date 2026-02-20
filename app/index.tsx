import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { Calendar, HelpCircle, X } from 'lucide-react-native';
import { useProgress } from '../contexts/ProgressContext';
import { TaskCard } from '../components/TaskCard';
import { isSlotActive, getTodayEffectiveDateKey, getDisplayDay, isJourneyComplete } from '../utils/timeSlotManager';
import { getAffirmation } from '../utils/contentCycler';
import { TimeSlot } from '../types';

export default function Dashboard() {
    const router = useRouter();
    const { dailyProgress, totalElapsedDays, trueStreak, isTodayComplete, isLoading, isFirstLaunch } = useProgress();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAffirmation, setSelectedAffirmation] = useState('');

    // Redirect to onboarding on first launch
    if (!isLoading && isFirstLaunch) {
        return <Redirect href="/onboarding" />;
    }

    const todayKey = getTodayEffectiveDateKey();
    const todayProgress = dailyProgress[todayKey] || {
        morning: false,
        noon: false,
        night: false,
    };

    const handleTaskPress = (slot: TimeSlot) => {
        if (todayProgress[slot]) {
            const affirmation = getAffirmation(totalElapsedDays, slot);
            setSelectedAffirmation(affirmation);
            setModalVisible(true);
        } else {
            router.push(`/task/${slot}`);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-slate-600" style={{ fontFamily: 'Inter_400Regular' }}>
                        Loading...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-1">🕌</Text>
                            <Text
                                className="text-emerald-700 font-bold text-base"
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                369 Niyyah
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/guide')}
                            activeOpacity={0.7}
                            className="p-2"
                        >
                            <HelpCircle size={24} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                    <Text
                        className="text-center text-emerald-800 font-bold text-lg"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        Bismillahir Rahmanir Rahim
                    </Text>
                </View>

                {/* Streak Section */}
                <View className="px-6 py-8">
                    {isJourneyComplete(totalElapsedDays) ? (
                        <>
                            <Text
                                className="text-center text-3xl font-bold text-emerald-600"
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                🎉 MashaAllah! 🎉
                            </Text>
                            <Text
                                className="text-center text-xl font-semibold text-slate-700 mt-2"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                369-day journey complete!
                            </Text>
                            <Text
                                className="text-center text-slate-500 mt-2"
                                style={{ fontFamily: 'Inter_400Regular' }}
                            >
                                You are growing stronger in faith every day
                            </Text>
                        </>
                    ) : (
                        <>
                            {trueStreak > 0 ? (
                                <Text
                                    className="text-center text-3xl font-bold text-slate-800"
                                    style={{ fontFamily: 'Inter_700Bold' }}
                                >
                                    🔥 Streak: {trueStreak} {trueStreak === 1 ? 'day' : 'days'}
                                </Text>
                            ) : isTodayComplete ? (
                                <Text
                                    className="text-center text-3xl font-bold text-emerald-600"
                                    style={{ fontFamily: 'Inter_700Bold' }}
                                >
                                    ✅ Today Complete!
                                </Text>
                            ) : (
                                <Text
                                    className="text-center text-xl font-semibold text-emerald-600"
                                    style={{ fontFamily: 'Inter_600SemiBold' }}
                                >
                                    Start fresh today!
                                </Text>
                            )}
                            <Text
                                className="text-center text-slate-500 mt-2"
                                style={{ fontFamily: 'Inter_400Regular' }}
                            >
                                Day {getDisplayDay(totalElapsedDays)}
                            </Text>
                        </>
                    )}
                    <Text
                        className="text-center text-slate-400 text-sm mt-1"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        Set your intention. Write it. Live it.
                    </Text>
                </View>

                {/* Task Cards */}
                <View className="px-6 gap-4">
                    <TaskCard
                        slot="morning"
                        isActive={isSlotActive('morning')}
                        isCompleted={todayProgress.morning}
                        onPress={() => handleTaskPress('morning')}
                    />
                    <TaskCard
                        slot="noon"
                        isActive={isSlotActive('noon')}
                        isCompleted={todayProgress.noon}
                        onPress={() => handleTaskPress('noon')}
                    />
                    <TaskCard
                        slot="night"
                        isActive={isSlotActive('night')}
                        isCompleted={todayProgress.night}
                        onPress={() => handleTaskPress('night')}
                    />
                </View>

                {/* History Navigation Button */}
                <View className="px-6 mt-6">
                    <TouchableOpacity
                        className="bg-emerald-100 p-4 rounded-xl flex-row items-center justify-center"
                        onPress={() => router.push('/history')}
                        activeOpacity={0.7}
                    >
                        <Calendar size={24} color="#10B981" />
                        <Text
                            className="text-emerald-700 font-semibold text-lg ml-3"
                            style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                            View My Progress
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Completed Affirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text
                                className="text-lg font-bold text-emerald-700"
                                style={{ fontFamily: 'Inter_700Bold' }}
                            >
                                Today's Completed Niyyah
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <View className="bg-emerald-50 rounded-xl p-4 mb-6">
                            <Text
                                className="text-base text-slate-700 leading-6"
                                style={{ fontFamily: 'Inter_400Regular' }}
                            >
                                {selectedAffirmation}
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="bg-emerald-500 py-3 rounded-xl"
                            onPress={() => setModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-white text-center font-semibold text-base"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
