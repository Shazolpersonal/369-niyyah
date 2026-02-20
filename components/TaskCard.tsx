import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Lock, ChevronRight } from 'lucide-react-native';
import { TimeSlot } from '../types';
import { getSlotLabel, getSlotEmoji, getSlotTimeRange, getRepetitionTarget } from '../utils/timeSlotManager';

interface TaskCardProps {
    slot: TimeSlot;
    isActive: boolean;
    isCompleted: boolean;
    onPress: () => void;
}

export function TaskCard({ slot, isActive, isCompleted, onPress }: TaskCardProps) {
    const label = getSlotLabel(slot);
    const emoji = getSlotEmoji(slot);
    const timeRange = getSlotTimeRange(slot);
    const count = getRepetitionTarget(slot);

    if (isCompleted) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex-row items-center"
            >
                <View className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center mr-4">
                    <Check size={24} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View className="flex-1">
                    <Text className="text-emerald-700 font-bold text-lg">
                        {emoji} {label}
                    </Text>
                    <Text className="text-emerald-600 text-sm mt-1">
                        Completed — Tap to view
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (isActive) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="bg-white border-2 border-emerald-500 rounded-2xl p-5 flex-row items-center shadow-sm"
            >
                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-2xl">{emoji}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-slate-800 font-bold text-lg">
                        {label}
                    </Text>
                    <Text className="text-slate-500 text-sm mt-1">
                        {timeRange} · Write ×{count}
                    </Text>
                </View>
                <ChevronRight size={24} color="#10B981" />
            </TouchableOpacity>
        );
    }

    // Locked / inactive
    return (
        <View className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-5 flex-row items-center opacity-60">
            <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mr-4">
                <Lock size={20} color="#94A3B8" />
            </View>
            <View className="flex-1">
                <Text className="text-slate-400 font-bold text-lg">
                    {label}
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                    {timeRange} · Write ×{count}
                </Text>
            </View>
        </View>
    );
}
