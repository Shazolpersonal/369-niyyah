import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { scheduleAllNotifications } from './notifications';

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Define the task out of the React lifecycle
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
        // Reschedule for the next 14 days dynamically
        await scheduleAllNotifications(14);
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error(`[Background Fetch] Error:`, error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

/**
 * Register the background fetch task to run periodically
 */
export async function registerBackgroundFetchAsync() {
    try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
            minimumInterval: 60 * 60 * 24, // Once a day
            stopOnTerminate: false, // Android only: Keep running after app close
            startOnBoot: true,     // Android only: Restart on device boot
        });
    } catch (err) {
        console.warn('[Background Fetch] Registration failed:', err);
    }
}

/**
 * Unregister the background fetch task
 */
export async function unregisterBackgroundFetchAsync() {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
        if (isRegistered) {
            await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
        }
    } catch (err) {
        console.warn('[Background Fetch] Unregistration failed:', err);
    }
}
//
