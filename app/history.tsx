import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useProgress } from '../contexts/ProgressContext';
import { CalendarDay } from '../components/CalendarDay';
import { getEffectiveTodayDate, formatLocalDateKey } from '../utils/timeSlotManager';
import { DayStatus, DailyProgress } from '../types';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getDayStatus(
    progress: DailyProgress | null,
    isToday: boolean,
    isFuture: boolean
): DayStatus {
    if (isFuture) return 'future';
    if (!progress) return isToday ? 'pending' : 'missed';

    const completed = [progress.morning, progress.noon, progress.night].filter(Boolean).length;
    if (completed === 3) return 'complete';
    if (completed > 0) return isToday ? 'pending' : 'partial';
    return isToday ? 'pending' : 'missed';
}

export default function HistoryScreen() {
    const router = useRouter();
    const { dailyProgress, startDate } = useProgress();
    const effectiveToday = getEffectiveTodayDate();
    const todayKey = formatLocalDateKey(effectiveToday);

    const [viewDate, setViewDate] = useState(new Date(effectiveToday));
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startDow = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: Array<{ day: number; dateKey: string } | null> = [];

        // Empty cells before first day
        for (let i = 0; i < startDow; i++) {
            days.push(null);
        }

        // Actual days
        for (let d = 1; d <= totalDays; d++) {
            const date = new Date(viewYear, viewMonth, d);
            days.push({
                day: d,
                dateKey: formatLocalDateKey(date),
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(viewYear, viewMonth + 1, 1);
        if (nextMonth <= effectiveToday) {
            setViewDate(nextMonth);
        }
    };

    const handleDayPress = (dateKey: string) => {
        setSelectedDay(dateKey);
        setModalVisible(true);
    };

    const selectedProgress = selectedDay ? dailyProgress[selectedDay] : null;

    // Stats for current month
    const monthStats = useMemo(() => {
        let complete = 0;
        let partial = 0;
        let total = 0;

        for (const cell of calendarDays) {
            if (!cell) continue;
            const { dateKey } = cell;
            const date = new Date(viewYear, viewMonth, cell.day);
            if (date > effectiveToday) continue;
            if (startDate && dateKey < startDate) continue;

            total++;
            const progress = dailyProgress[dateKey];
            if (progress) {
                const count = [progress.morning, progress.noon, progress.night].filter(Boolean).length;
                if (count === 3) complete++;
                else if (count > 0) partial++;
            }
        }

        return { complete, partial, total };
    }, [calendarDays, dailyProgress, startDate, effectiveToday]);

    const canGoNext = new Date(viewYear, viewMonth + 1, 1) <= effectiveToday;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text
                    className="text-lg font-semibold text-slate-800 flex-1"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                    My Progress
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Month Navigation */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={handlePrevMonth} className="p-2">
                        <ChevronLeft size={24} color="#334155" />
                    </TouchableOpacity>
                    <Text
                        className="text-xl font-bold text-slate-800"
                        style={{ fontFamily: 'Inter_700Bold' }}
                    >
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </Text>
                    <TouchableOpacity
                        onPress={handleNextMonth}
                        className="p-2"
                        disabled={!canGoNext}
                    >
                        <ChevronRight size={24} color={canGoNext ? '#334155' : '#CBD5E1'} />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View className="flex-row mb-6 gap-3">
                    <View className="flex-1 bg-emerald-50 rounded-xl p-3 items-center">
                        <Text className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Inter_700Bold' }}>
                            {monthStats.complete}
                        </Text>
                        <Text className="text-xs text-emerald-600 mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                            Complete
                        </Text>
                    </View>
                    <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                        <Text className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Inter_700Bold' }}>
                            {monthStats.partial}
                        </Text>
                        <Text className="text-xs text-amber-600 mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                            Partial
                        </Text>
                    </View>
                    <View className="flex-1 bg-slate-100 rounded-xl p-3 items-center">
                        <Text className="text-2xl font-bold text-slate-600" style={{ fontFamily: 'Inter_700Bold' }}>
                            {monthStats.total}
                        </Text>
                        <Text className="text-xs text-slate-600 mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                            Total Days
                        </Text>
                    </View>
                </View>

                {/* Weekday Headers */}
                <View className="flex-row mb-2">
                    {WEEKDAY_LABELS.map((label) => (
                        <View key={label} className="flex-1 items-center">
                            <Text
                                className="text-xs text-slate-400 font-semibold"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View className="flex-row flex-wrap">
                    {calendarDays.map((cell, index) => (
                        <View key={index} className="items-center justify-center py-1" style={{ width: '14.28%' }}>
                            {cell ? (
                                <CalendarDay
                                    day={cell.day}
                                    status={getDayStatus(
                                        dailyProgress[cell.dateKey] || null,
                                        cell.dateKey === todayKey,
                                        new Date(viewYear, viewMonth, cell.day) > effectiveToday ||
                                        (startDate ? cell.dateKey < startDate : false)
                                    )}
                                    isToday={cell.dateKey === todayKey}
                                    onPress={() => handleDayPress(cell.dateKey)}
                                />
                            ) : (
                                <View className="w-10 h-10" />
                            )}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View className="flex-row flex-wrap gap-4 mt-6 justify-center">
                    {[
                        { color: 'bg-emerald-500', label: 'Complete' },
                        { color: 'bg-amber-400', label: 'Partial' },
                        { color: 'bg-red-400', label: 'Missed' },
                        { color: 'bg-slate-100', label: 'Pending' },
                    ].map(({ color, label }) => (
                        <View key={label} className="flex-row items-center">
                            <View className={`w-3 h-3 rounded-full ${color} mr-1`} />
                            <Text className="text-xs text-slate-500" style={{ fontFamily: 'Inter_400Regular' }}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Day Detail Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Inter_700Bold' }}>
                                {selectedDay}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {selectedProgress ? (
                            <View className="gap-3">
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-3">{selectedProgress.morning ? '✅' : '⬜'}</Text>
                                    <Text className="text-base text-slate-700" style={{ fontFamily: 'Inter_500Medium' }}>
                                        Morning Niyyah
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-3">{selectedProgress.noon ? '✅' : '⬜'}</Text>
                                    <Text className="text-base text-slate-700" style={{ fontFamily: 'Inter_500Medium' }}>
                                        Afternoon Niyyah
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-3">{selectedProgress.night ? '✅' : '⬜'}</Text>
                                    <Text className="text-base text-slate-700" style={{ fontFamily: 'Inter_500Medium' }}>
                                        Evening Niyyah
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text className="text-slate-500 text-center py-4" style={{ fontFamily: 'Inter_400Regular' }}>
                                No progress recorded for this day.
                            </Text>
                        )}

                        <TouchableOpacity
                            className="bg-emerald-500 py-3 rounded-xl mt-6"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
