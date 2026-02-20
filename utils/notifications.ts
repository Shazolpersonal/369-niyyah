import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types';
import { translate, Language } from '../i18n';
import { LANGUAGE_STORAGE_KEY } from '../contexts/LanguageContext';

/**
 * Get the notification messages based on language
 */
const getNotificationMessages = (language: Language): Record<TimeSlot, { title: string; body: string }> => ({
    morning: {
        title: translate(language, 'notification.morning.title'),
        body: translate(language, 'notification.morning.body'),
    },
    noon: {
        title: translate(language, 'notification.noon.title'),
        body: translate(language, 'notification.noon.body'),
    },
    night: {
        title: translate(language, 'notification.night.title'),
        body: translate(language, 'notification.night.body'),
    },
});

/**
 * Notification trigger hours
 */
const NOTIFICATION_HOURS: Record<TimeSlot, number> = {
    morning: 8,
    noon: 13,
    night: 18,
};

/**
 * Get saved language from AsyncStorage (for use outside React context)
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
 * Request notification permissions
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

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('niyyah-reminders', {
            name: 'Niyyah Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10B981',
        });
    }

    return true;
};

/**
 * Schedule daily notifications for all three slots (language-aware)
 */
export const scheduleAllNotifications = async (): Promise<void> => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const language = await getSavedLanguage();
    const messages = getNotificationMessages(language);
    const slots: TimeSlot[] = ['morning', 'noon', 'night'];

    for (const slot of slots) {
        const { title, body } = messages[slot];
        const hour = NOTIFICATION_HOURS[slot];

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
                ...(Platform.OS === 'android' && { channelId: 'niyyah-reminders' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute: 0,
            },
        });
    }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Configure notification handler
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
