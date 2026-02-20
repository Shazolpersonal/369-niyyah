import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Lock, ChevronRight } from 'lucide-react-native';
import { TimeSlot } from '../types';
import { getSlotEmoji, getRepetitionTarget } from '../utils/timeSlotManager';
import { useLanguage } from '../contexts/LanguageContext';

const SLOT_LABEL_KEYS: Record<TimeSlot, string> = {
    morning: 'slot.morning.label',
    noon: 'slot.noon.label',
    night: 'slot.night.label',
};

const SLOT_TIME_KEYS: Record<TimeSlot, string> = {
    morning: 'slot.morning.timeRange',
    noon: 'slot.noon.timeRange',
    night: 'slot.night.timeRange',
};

/** Returns the correct font family based on language and weight */
const getFontFamily = (language: string, weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
    const fonts: Record<string, Record<string, string>> = {
        en: {
            regular: 'Inter_400Regular',
            medium: 'Inter_500Medium',
            semibold: 'Inter_600SemiBold',
            bold: 'Inter_700Bold',
        },
        bn: {
            regular: 'NotoSansBengali_400Regular',
            medium: 'NotoSansBengali_500Medium',
            semibold: 'NotoSansBengali_600SemiBold',
            bold: 'NotoSansBengali_700Bold',
        },
    };
    return fonts[language]?.[weight] || fonts['en'][weight];
};

interface TaskCardProps {
    slot: TimeSlot;
    isActive: boolean;
    isCompleted: boolean;
    onPress: () => void;
}

export function TaskCard({ slot, isActive, isCompleted, onPress }: TaskCardProps) {
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const label = t(SLOT_LABEL_KEYS[slot]);
    const emoji = getSlotEmoji(slot);
    const timeRange = t(SLOT_TIME_KEYS[slot]);
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
                    <Text className="text-emerald-700 font-bold text-lg" style={{ fontFamily: f('bold') }}>
                        {emoji} {label}
                    </Text>
                    <Text className="text-emerald-600 text-sm mt-1" style={{ fontFamily: f('regular') }}>
                        {t('taskCard.completedTapToView')}
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
                    <Text className="text-slate-800 font-bold text-lg" style={{ fontFamily: f('bold') }}>
                        {label}
                    </Text>
                    <Text className="text-slate-500 text-sm mt-1" style={{ fontFamily: f('regular') }}>
                        {timeRange} · {t('taskCard.write')} ×{count}
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
                <Text className="text-slate-400 font-bold text-lg" style={{ fontFamily: f('bold') }}>
                    {label}
                </Text>
                <Text className="text-slate-400 text-sm mt-1" style={{ fontFamily: f('regular') }}>
                    {timeRange} · {t('taskCard.write')} ×{count}
                </Text>
            </View>
        </View>
    );
}
