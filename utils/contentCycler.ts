import { affirmations } from '../data/affirmations';
import { affirmationsBn } from '../data/affirmations_bn';
import { TimeSlot } from '../types';
import { Language } from '../i18n';

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
const FALLBACK_AFFIRMATIONS: Record<Language, Record<TimeSlot, string>> = {
    en: {
        morning: "I begin this day with Bismillah, trusting that Allah has a beautiful plan for me.",
        noon: "Allah does not burden a soul beyond what it can bear. I am strong enough for today.",
        night: "Alhamdulillah for this day — for every breath, every blessing, every test.",
    },
    bn: {
        morning: "বিসমিল্লাহ বলে এই দিন শুরু করছি, বিশ্বাস রাখি আল্লাহ আমার জন্য সুন্দর পরিকল্পনা রেখেছেন।",
        noon: "আল্লাহ কোনো আত্মাকে তার সাধ্যের অতিরিক্ত বোঝা দেন না। আজকের জন্য আমি যথেষ্ট শক্তিশালী।",
        night: "আলহামদুলিল্লাহ আজকের দিনটির জন্য — প্রতিটি শ্বাস, প্রতিটি নিয়ামত, প্রতিটি পরীক্ষার জন্য।",
    },
};

/**
 * Retrieves the affirmation text for a given day and time slot.
 * Kept for backward compatibility — uses English.
 */
export const getAffirmation = (day: number, slot: TimeSlot): string => {
    return getAffirmationByLanguage(day, slot, 'en');
};

/**
 * Retrieves the affirmation text for a given day, time slot, and language.
 */
export const getAffirmationByLanguage = (day: number, slot: TimeSlot, language: Language): string => {
    if (day <= 0) return FALLBACK_AFFIRMATIONS[language][slot];

    const contentIndex = getContentIndex(day);
    const source = language === 'bn' ? affirmationsBn : affirmations;
    const dayContent = source[contentIndex];

    if (!dayContent) return FALLBACK_AFFIRMATIONS[language][slot];

    return dayContent[slot] || FALLBACK_AFFIRMATIONS[language][slot];
};
