import { TimeSlot } from '../types';
import { Language } from '../i18n';

interface NotificationContent {
    title: string;
    body: string;
}

const MORNING_QUOTES = {
    en: [
        "A profound new day has begun; what intention will you set today?",
        "Breathe. Awaken your heart. Your morning Niyyah awaits.",
        "Today is a blank canvas. Let your faith guide the first stroke.",
        "Step into the morning with gratitude and unbreakable trust in Allah.",
        "Release yesterday's worries. Anchor your soul with today's affirmation."
    ],
    bn: [
        "এক চমৎকার নতুন দিনের শুরু; আজ আপনার নিয়ত কী হবে?",
        "একটি দীর্ঘ শ্বাস নিন। আপনার হৃদয়কে জাগ্রত করুন। সকালের নিয়ত আপনার অপেক্ষায়।",
        "আজকের দিনটি একটি শূন্য ক্যানভাস। আপনার বিশ্বাস দিয়ে প্রথম আঁচড়টি কাটুন।",
        "কৃতজ্ঞতা এবং আল্লাহর ওপর অবিচল বিশ্বাস নিয়ে আজকের দিনটি শুরু করুন।",
        "অতীতের সকল দুশ্চিন্তা মুছে ফেলুন। আজকের নিয়তের মাধ্যমে আত্মাকে প্রশান্ত করুন।"
    ]
};

const NOON_QUOTES = {
    en: [
        "Pause the noise of the world. Reconnect with your Creator.",
        "Mid-day reflections: Are your actions aligned with your morning intention?",
        "Take a moment of stillness. Your soul needs nourishment too.",
        "In the midst of chaos, let your Niyyah be your anchor.",
        "Renew your focus. There is immense power in remembering Allah right now."
    ],
    bn: [
        "দুনিয়ার কোলাহল থেকে একটু বিরতি নিন। আপনার রবের সাথে পুনরায় সংযোগ স্থাপন করুন।",
        "দুপুরের আত্মজিজ্ঞাসা: আপনার কাজগুলো কি সকালের নিয়তের সাথে সামঞ্জস্যপূর্ণ?",
        "একটু নীরবতার সুযোগ নিন। আপনার আত্মারও প্রশান্তির প্রয়োজন।",
        "দিনের ব্যস্ততার মাঝে, অন্তরের নিয়তই হোক আপনার সবচেয়ে বড় আশ্রয়।",
        "আপনার মনোযোগ নতুন করে স্থির করুন। ঠিক এই মুহূর্তে আল্লাহকে স্মরণের মাঝে বিপুল শক্তি রয়েছে।"
    ]
};

const NIGHT_QUOTES = {
    en: [
        "As the day closes, forgive yourself and surrender to His mercy.",
        "Leave the burdens of today behind. End your night in peaceful gratitude.",
        "Reflect on the invisible protections Allah wrapped you in today.",
        "The day is done. Cleanse your heart with your evening Niyyah.",
        "Rest your body, calm your mind, and let your faith cradle you tonight."
    ],
    bn: [
        "দিন শেষে নিজেকে ক্ষমা করুন এবং পরম করুণাময়ের কাছে সমর্পণ করুন।",
        "আজকের যত ভার, সব নামিয়ে রাখুন। এক প্রশান্ত কৃতজ্ঞতায় রাতটি শেষ করুন।",
        "আজ সারাদিন আল্লাহ আপনাকে যে অদৃশ্য সুরক্ষায় ঢেকে রেখেছিলেন, তা স্মরণ করুন।",
        "দিনের কর্মব্যস্ততা শেষ। রাতের নিয়তের মাধ্যমে আপনার অন্তর পরিষ্কার করুন।",
        "শরীরকে বিশ্রাম দিন, মন শান্ত করুন; আজকের রাতে আপনার ঈমানই হোক আপনার প্রশান্তির কোল।"
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
