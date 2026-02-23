import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { scheduleAllNotifications } from './notifications';

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Define the task out of the React lifecycle
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
        console.log(`[Background Fetch] Running '${BACKGROUND_NOTIFICATION_TASK}'...`);
        // Reschedule for the next 14 days dynamically
        await scheduleAllNotifications(14);
        console.log(`[Background Fetch] Rescheduled notifications successfully.`);
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
        console.log('[Background Fetch] Registered successfully.');
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
            console.log('[Background Fetch] Unregistered successfully.');
        }
    } catch (err) {
        console.warn('[Background Fetch] Unregistration failed:', err);
    }
}
