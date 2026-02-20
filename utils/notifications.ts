import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TimeSlot } from '../types';

/**
 * Notification messages with Islamic tone
 */
const NOTIFICATION_MESSAGES: Record<TimeSlot, { title: string; body: string }> = {
    morning: {
        title: '🌅 Morning Niyyah',
        body: "Time for your Morning Niyyah. Start your day with faith and intention. Bismillah!",
    },
    noon: {
        title: '☀️ Afternoon Niyyah',
        body: "Afternoon Niyyah awaits. Pause, remember Allah, and write your affirmation.",
    },
    night: {
        title: '🌙 Evening Niyyah',
        body: "Evening Niyyah time. End your day with gratitude and peace. Alhamdulillah.",
    },
};

/**
 * Notification trigger hours
 */
const NOTIFICATION_HOURS: Record<TimeSlot, number> = {
    morning: 8,
    noon: 13,
    night: 18,
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
 * Schedule daily notifications for all three slots
 */
export const scheduleAllNotifications = async (): Promise<void> => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const slots: TimeSlot[] = ['morning', 'noon', 'night'];

    for (const slot of slots) {
        const { title, body } = NOTIFICATION_MESSAGES[slot];
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
