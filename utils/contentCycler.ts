import { affirmations } from '../data/affirmations';
import { TimeSlot } from '../types';

/**
 * Content Cycler for 369 Niyyah
 * 
 * IMPORTANT: Always pass `totalElapsedDays` from ProgressContext, NOT `trueStreak`.
 * - `totalElapsedDays`: Days since journey started (ensures content progression continues even if streak breaks)
 * - `trueStreak`: Consecutive complete days (would reset content on streak break - NOT desired)
 */

/**
 * Calculates the content index for a given day.
 * The affirmations array is 0-indexed (0-40), but day starts at 1.
 * After day 41, the content cycles back to day 1.
 */
export const getContentIndex = (day: number): number => {
    if (day <= 0) return 0;
    return (day - 1) % 41;
};

// Fallback affirmations for edge cases
const FALLBACK_AFFIRMATIONS: Record<TimeSlot, string> = {
    morning: "I begin this day with Bismillah, trusting that Allah has a beautiful plan for me.",
    noon: "Allah does not burden a soul beyond what it can bear. I am strong enough for today.",
    night: "Alhamdulillah for this day — for every breath, every blessing, every test.",
};

/**
 * Retrieves the affirmation text for a given day and time slot.
 */
export const getAffirmation = (day: number, slot: TimeSlot): string => {
    if (day <= 0) return FALLBACK_AFFIRMATIONS[slot];

    const contentIndex = getContentIndex(day);
    const dayContent = affirmations[contentIndex];

    if (!dayContent) return FALLBACK_AFFIRMATIONS[slot];

    return dayContent[slot] || FALLBACK_AFFIRMATIONS[slot];
};
