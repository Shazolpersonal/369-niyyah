import { DailyProgress } from '../types';

export interface Badge {
    id: string;
    icon: string;
    titleKey: string;
    descriptionKey: string;
    isUnlocked: boolean;
}

export function getAchievements(
    dailyProgress: Record<string, DailyProgress>,
    trueStreak: number,
    totalElapsedDays: number,
): Badge[] {
    let hasAnyProgress = false;
    let hasMorning = false;
    let hasNight = false;

    // ⚡ Bolt: Replaced multiple Object.values().some() calls with a single loop
    // Impact: Avoids unnecessary array allocations and evaluates conditions in one pass with early exit
    for (const key in dailyProgress) {
        hasAnyProgress = true;
        const p = dailyProgress[key];
        if (p.morning) hasMorning = true;
        if (p.night) hasNight = true;
        if (hasMorning && hasNight) break;
    }

    return [
        {
            id: 'first_step',
            icon: '🌱',
            titleKey: 'achievements.firstStep.title',
            descriptionKey: 'achievements.firstStep.desc',
            isUnlocked: hasAnyProgress,
        },
        {
            id: 'early_bird',
            icon: '🌅',
            titleKey: 'achievements.earlyBird.title',
            descriptionKey: 'achievements.earlyBird.desc',
            isUnlocked: hasMorning,
        },
        {
            id: 'night_owl',
            icon: '🦉',
            titleKey: 'achievements.nightOwl.title',
            descriptionKey: 'achievements.nightOwl.desc',
            isUnlocked: hasNight,
        },
        {
            id: 'streak_3',
            icon: '🔥',
            titleKey: 'achievements.streak3.title',
            descriptionKey: 'achievements.streak3.desc',
            isUnlocked: trueStreak >= 3,
        },
        {
            id: 'streak_7',
            icon: '🌟',
            titleKey: 'achievements.streak7.title',
            descriptionKey: 'achievements.streak7.desc',
            isUnlocked: trueStreak >= 7,
        },
        {
            id: 'habit_21',
            icon: '🧠',
            titleKey: 'achievements.habit21.title',
            descriptionKey: 'achievements.habit21.desc',
            isUnlocked: trueStreak >= 21,
        },
        {
            id: 'master_33',
            icon: '👑',
            titleKey: 'achievements.master33.title',
            descriptionKey: 'achievements.master33.desc',
            isUnlocked: trueStreak >= 33 || totalElapsedDays >= 33, // Slightly simplified criteria for journey complete
        },
    ];
}
