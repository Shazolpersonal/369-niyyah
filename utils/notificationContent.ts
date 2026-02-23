import { TimeSlot } from '../types';
import { Language } from '../i18n';

interface NotificationContent {
    title: string;
    body: string;
}

const MORNING_QUOTES = {
    en: [
        "A new day brings new mercy.",
        "Your morning intention sets the stage.",
        "Rise with purpose, shine with faith.",
        "Begin the day with Gratitude.",
        "Breathe in peace, exhale worries."
    ],
    bn: [
        "নতুন দিন, নতুন রহমত।",
        "আপনার সকালের নিয়ত আপনার দিন ঠিক করে দেয়।",
        "উদ্দেশ্য নিয়ে উঠুন, বিশ্বাসের সাথে উজ্জ্বল হোন।",
        "কৃতজ্ঞতার সাথে দিন শুরু করুন।",
        "শান্তি শ্বাস নিন, দুশ্চিন্তা ছাড়ুন।"
    ]
};

const NOON_QUOTES = {
    en: [
        "Pause and reconnect.",
        "Mid-day check: Are you on track?",
        "Take a breath. You're doing great.",
        "A moment of silence for a busy mind.",
        "Refresh your intention for the rest of the day."
    ],
    bn: [
        "একটু থামুন এবং নতুন করে ভাবুন।",
        "দুপুরের বিরতি: চলুন নিয়ত গুলো রিনিউ করি।",
        "একটি শ্বাস নিন। আপনি ভালো করছেন।",
        "ব্যস্ত দিনের মাঝে একটু নীরবতা।",
        "দিনের বাকি জন্য আপনার নিয়ত সতেজ করুন।"
    ]
};

const NIGHT_QUOTES = {
    en: [
        "Reflect on the day's blessings.",
        "Let go of today's burdens.",
        "End the day with a grateful heart.",
        "Rest peacefully, tomorrow is a new start.",
        "Your nighttime Niyyah brings clarity."
    ],
    bn: [
        "আজকের দিনের রহমত গুলো স্মরণ করুন।",
        "আজকের বোঝাগুলো ছেড়ে দিন।",
        "একটি কৃতজ্ঞ হৃদয় নিয়ে দিনটি শেষ করুন।",
        "শান্তিতে বিশ্রাম নিন, আগামীকাল একটি নতুন শুরু।",
        "রাতের বেলা নিয়ত করা আপনার মনে প্রশান্তি আনবে।"
    ]
};

/**
 * Get a dynamic message based on time slot, language, and the current day of the year
 */
export const getDynamicNotificationMessage = (slot: TimeSlot, language: Language): NotificationContent => {
    // Basic daily rotation index to ensure it cycles consistently per day
    const dayOfYear = Math.floor(
        (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );

    let quotesEn: string[];
    let quotesBn: string[];
    let titleBaseEn: string;
    let titleBaseBn: string;

    switch (slot) {
        case 'morning':
            quotesEn = MORNING_QUOTES.en;
            quotesBn = MORNING_QUOTES.bn;
            titleBaseEn = "🌅 Morning Niyyah";
            titleBaseBn = "🌅 সকালের নিয়ত";
            break;
        case 'noon':
            quotesEn = NOON_QUOTES.en;
            quotesBn = NOON_QUOTES.bn;
            titleBaseEn = "☀️ Afternoon Niyyah";
            titleBaseBn = "☀️ দুপুরের নিয়ত";
            break;
        case 'night':
            quotesEn = NIGHT_QUOTES.en;
            quotesBn = NIGHT_QUOTES.bn;
            titleBaseEn = "🌙 Evening Niyyah";
            titleBaseBn = "🌙 রাতের নিয়ত";
            break;
    }

    const index = dayOfYear % quotesEn.length;

    return {
        title: language === 'bn' ? titleBaseBn : titleBaseEn,
        body: language === 'bn' ? quotesBn[index] : quotesEn[index],
    };
};

/**
 * Get a specialized gentle nudge message
 */
export const getGentleNudgeMessage = (slot: TimeSlot, language: Language): NotificationContent => {
    if (language === 'bn') {
        return {
            title: `⏳ আপনার ${slot === 'morning' ? 'সকালের' : slot === 'noon' ? 'দুপুরের' : 'রাতের'} নিয়ত সম্পন্ন করুন`,
            body: "সময় প্রায় শেষ! এখনই আপনার স্ট্রিকটি ধরে রাখুন।"
        };
    }

    return {
        title: `⏳ Don't Miss Your ${slot === 'morning' ? 'Morning' : slot === 'noon' ? 'Afternoon' : 'Evening'} Niyyah`,
        body: "Time is almost up! Write your Niyyah now to keep your streak alive."
    };
};
