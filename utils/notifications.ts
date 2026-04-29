import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types';
import { Language } from '../i18n';
import { LANGUAGE_STORAGE_KEY } from '../contexts/LanguageContext';
import { getDynamicNotificationMessage, getGentleNudgeMessage } from './notificationContent';
import { getNotificationInteractionStats } from './notificationAnalytics';
import { DAY_BOUNDARY_HOUR, getEffectiveTodayDate, SLOT_START_HOURS } from './timeSlotManager';

/**
 * Get saved language from AsyncStorage
 */
const getSavedLanguage = async (): Promise<Language> => {
    try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'bn' || saved === 'en') return saved;
    } catch {
        // ignore
    }
    return 'en';
};

/**
 * Request notification permissions and set up OS-specific channels/categories
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    // Configure Quick Actions (Categories)
    await Notifications.setNotificationCategoryAsync('niyyah_action', [
        {
            identifier: 'write_niyyah',
            buttonTitle: '✍️ Write Niyyah',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'snooze',
            buttonTitle: '🛌 Snooze (15m)',
            options: {
                opensAppToForeground: false,
            },
        },
    ]);

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('niyyah-reminders', {
            name: 'Niyyah Reminders',
            description: '3 daily reminders for Morning, Afternoon, and Evening slots.',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#10B981',
            sound: 'default', // Ideally custom sound file in raw folder later
        });

        await Notifications.setNotificationChannelAsync('niyyah-nudges', {
            name: 'Last Chance Nudges',
            description: 'Alerts you before you miss a time slot.',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F59E0B',
            sound: 'default',
        });
    }

    return true;
};

/**
 * Calculate optimal hour based on past interactions
 */
const calculateOptimalHour = (slot: TimeSlot, statsHour: number | null): number => {
    const baseHour = SLOT_START_HOURS[slot];
    if (statsHour === null) return baseHour;

    // Safety check ensuring we don't schedule outside valid boundaries for the slot
    if (slot === 'morning' && (statsHour < SLOT_START_HOURS.morning || statsHour >= SLOT_START_HOURS.noon)) return baseHour;
    if (slot === 'noon' && (statsHour < SLOT_START_HOURS.noon || statsHour >= SLOT_START_HOURS.night)) return baseHour;
    if (slot === 'night' && statsHour >= DAY_BOUNDARY_HOUR && statsHour < SLOT_START_HOURS.night) return baseHour;

    // Shift exactly to the hour the user recently interacted, ensuring maximum open rates
    return statsHour;
};

const getOptimalHourForSlot = (
    slot: TimeSlot,
    stats: Awaited<ReturnType<typeof getNotificationInteractionStats>>,
): number => {
    switch (slot) {
        case 'morning':
            return calculateOptimalHour(slot, stats.morningLastInteractHour);
        case 'noon':
            return calculateOptimalHour(slot, stats.noonLastInteractHour);
        case 'night':
            return calculateOptimalHour(slot, stats.nightLastInteractHour);
        default:
            return SLOT_START_HOURS[slot];
    }
};

const schedulePrimaryNotification = (
    slot: TimeSlot,
    language: Language,
    targetDate: Date,
    optimalHour: number,
    schedulingPromises: Promise<string>[],
) => {
    const { title, body } = getDynamicNotificationMessage(slot, language, targetDate);

    // Target scheduling date/time
    const scheduleTime = new Date(targetDate);

    // Architecture: Shift midnight hours to the next true calendar day
    if (slot === 'night' && optimalHour < DAY_BOUNDARY_HOUR) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    scheduleTime.setHours(optimalHour, 0, 0, 0);

    // Don't schedule in the past
    if (scheduleTime.getTime() > new Date().getTime()) {
        schedulingPromises.push(
            Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: 'default',
                    categoryIdentifier: 'niyyah_action',
                    data: { slot, type: 'primary' },
                    ...(Platform.OS === 'android' && { channelId: 'niyyah-reminders' }),
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: scheduleTime,
                },
            }),
        );
    }
};

const scheduleNudgeNotification = (
    slot: TimeSlot,
    language: Language,
    targetDate: Date,
    schedulingPromises: Promise<string>[],
) => {
    // Gentle Nudge (Last chance) scheduling - 1 hour before the slot ends
    let nudgeHour = SLOT_START_HOURS.noon - 1;
    if (slot === 'noon') nudgeHour = SLOT_START_HOURS.night - 1;
    if (slot === 'night') nudgeHour = DAY_BOUNDARY_HOUR - 1;

    const nudgeTime = new Date(targetDate);
    if (slot === 'night') nudgeTime.setDate(nudgeTime.getDate() + 1);
    nudgeTime.setHours(nudgeHour, 30, 0, 0); // Give 30 mins buffer

    if (nudgeTime.getTime() > new Date().getTime()) {
        const nudgeContent = getGentleNudgeMessage(slot, language);
        schedulingPromises.push(
            Notifications.scheduleNotificationAsync({
                content: {
                    title: nudgeContent.title,
                    body: nudgeContent.body,
                    sound: 'default',
                    data: { slot, type: 'nudge' },
                    ...(Platform.OS === 'android' && { channelId: 'niyyah-nudges' }),
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: nudgeTime,
                },
            }),
        );
    }
};

/**
 * Schedule dynamic notifications for the next `daysAhead` days
 * Defaulting to 14 days to stay well within iOS 64 scheduled notifications limit
 */
export const scheduleAllNotifications = async (daysAhead: number = 14): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const language = await getSavedLanguage();
    const stats = await getNotificationInteractionStats();

    const slots: TimeSlot[] = ['morning', 'noon', 'night'];
    const schedulingPromises: Promise<string>[] = [];

    for (let i = 0; i < daysAhead; i++) {
        const targetDate = getEffectiveTodayDate();
        targetDate.setDate(targetDate.getDate() + i);

        for (const slot of slots) {
            const optimalHour = getOptimalHourForSlot(slot, stats);

            schedulePrimaryNotification(
                slot,
                language,
                targetDate,
                optimalHour,
                schedulingPromises,
            );
            scheduleNudgeNotification(slot, language, targetDate, schedulingPromises);
        }
    }

    await Promise.all(schedulingPromises);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Configure notification handler setup for the app runtime
 */
export const configureNotificationHandler = (): void => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
};
