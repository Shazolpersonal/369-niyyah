import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types';

const LAST_INTERACTION_KEY = '@niyyah_last_notification_interaction';

export interface NotificationInteractionStats {
    morningLastInteractHour: number | null;
    noonLastInteractHour: number | null;
    nightLastInteractHour: number | null;
}

/**
 * Record when a user interacted with a particular time slot's notification.
 * This is used for dynamic scheduling to adjust the exact delivery time based on habits.
 */
export const recordNotificationInteraction = async (slot: TimeSlot) => {
    try {
        const stats = await getNotificationInteractionStats();
        const hour = new Date().getHours();

        switch (slot) {
            case 'morning':
                stats.morningLastInteractHour = hour;
                break;
            case 'noon':
                stats.noonLastInteractHour = hour;
                break;
            case 'night':
                stats.nightLastInteractHour = hour;
                break;
        }

        await AsyncStorage.setItem(LAST_INTERACTION_KEY, JSON.stringify(stats));
    } catch (e) {
        console.warn("Failed to record notification interaction:", e);
    }
};

/**
 * Retrieve user's historical interaction hours per slot.
 */
export const getNotificationInteractionStats = async (): Promise<NotificationInteractionStats> => {
    try {
        const data = await AsyncStorage.getItem(LAST_INTERACTION_KEY);
        if (data) {
            return JSON.parse(data) as NotificationInteractionStats;
        }
    } catch (e) {
        console.warn("Failed to get notification interaction stats:", e);
    }

    return {
        morningLastInteractHour: null,
        noonLastInteractHour: null,
        nightLastInteractHour: null,
    };
};
