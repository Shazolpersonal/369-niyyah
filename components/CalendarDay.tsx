import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DayStatus } from '../types';

interface CalendarDayProps {
    day: number;
    status: DayStatus;
    isToday: boolean;
    onPress?: () => void;
}

const STATUS_STYLES: Record<DayStatus, { bg: string; text: string }> = {
    complete: { bg: 'bg-emerald-500', text: 'text-white' },
    partial: { bg: 'bg-amber-400', text: 'text-white' },
    missed: { bg: 'bg-red-400', text: 'text-white' },
    future: { bg: 'bg-slate-100', text: 'text-slate-300' },
    pending: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export function CalendarDay({ day, status, isToday, onPress }: CalendarDayProps) {
    const { bg, text } = STATUS_STYLES[status];
    const todayBorder = isToday ? 'border-2 border-emerald-500' : '';

    const content = (
        <View className={`w-10 h-10 rounded-full items-center justify-center ${bg} ${todayBorder}`}>
            <Text className={`text-sm font-semibold ${text}`}>{day}</Text>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}
