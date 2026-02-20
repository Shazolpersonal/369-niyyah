export interface AffirmationDay {
    day: number;
    morning: string;
    noon: string;
    night: string;
}

export type TimeSlot = 'morning' | 'noon' | 'night';

export interface DailyProgress {
    morning: boolean;
    noon: boolean;
    night: boolean;
}

export type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'pending';
