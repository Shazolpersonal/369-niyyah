import React from 'react';
import { View } from 'react-native';

interface RepetitionCounterProps {
    total: number;
    completed: number;
}

export function RepetitionCounter({ total, completed }: RepetitionCounterProps) {
    return (
        <View className="flex-row items-center justify-center gap-2 py-3">
            {Array.from({ length: total }, (_, i) => (
                <View
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < completed ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                />
            ))}
        </View>
    );
}
