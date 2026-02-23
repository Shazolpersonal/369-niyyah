import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types';
import { Language } from '../i18n';
import { LANGUAGE_STORAGE_KEY } from '../contexts/LanguageContext';
import { getDynamicNotificationMessage, getGentleNudgeMessage } from './notificationContent';
import { getNotificationInteractionStats } from './notificationAnalytics';

// Base static hours
const BASE_NOTIFICATION_HOURS: Record<TimeSlot, number> = {
    morning: 8,
    noon: 13,
    night: 18,
};

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
        }
    ]);

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('niyyah-reminders', {
            name: 'Niyyah Reminders',
            description: 'Daily spiritual nudges for your 369 journey.',
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
    const baseHour = BASE_NOTIFICATION_HOURS[slot];
    if (statsHour === null) return baseHour;

    // Safety check ensuring we don't schedule outside valid boundaries for the slot
    if (slot === 'morning' && (statsHour < 8 || statsHour >= 13)) return baseHour;
    if (slot === 'noon' && (statsHour < 13 || statsHour >= 18)) return baseHour;
    if (slot === 'night' && (statsHour >= 5 && statsHour < 18)) return baseHour;

    // Shift exactly to the hour the user recently interacted, ensuring maximum open rates
    return statsHour;
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

    for (let i = 0; i < daysAhead; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);

        for (const slot of slots) {
            const { title, body } = getDynamicNotificationMessage(slot, language);

            let optimalHour = BASE_NOTIFICATION_HOURS[slot];
            switch (slot) {
                case 'morning': optimalHour = calculateOptimalHour(slot, stats.morningLastInteractHour); break;
                case 'noon': optimalHour = calculateOptimalHour(slot, stats.noonLastInteractHour); break;
                case 'night': optimalHour = calculateOptimalHour(slot, stats.nightLastInteractHour); break;
            }

            // Target scheduling date/time
            const scheduleTime = new Date(targetDate);
            scheduleTime.setHours(optimalHour, 0, 0, 0);

            // Don't schedule in the past
            if (scheduleTime.getTime() > new Date().getTime()) {
                await Notifications.scheduleNotificationAsync({
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
                });
            }

            // Gentle Nudge (Last chance) scheduling - 1 hour before the slot ends
            let nudgeHour = 12; // Morning ends at 13
            if (slot === 'noon') nudgeHour = 17; // Noon ends at 18
            if (slot === 'night') nudgeHour = 4; // Night ends at 5 next day

            const nudgeTime = new Date(targetDate);
            if (slot === 'night') nudgeTime.setDate(nudgeTime.getDate() + 1);
            nudgeTime.setHours(nudgeHour, 30, 0, 0); // Give 30 mins buffer

            if (nudgeTime.getTime() > new Date().getTime()) {
                const nudgeContent = getGentleNudgeMessage(slot, language);
                await Notifications.scheduleNotificationAsync({
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
                });
            }
        }
    }
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
