import { TimeSlot } from '../types';

/**
 * Time Slot Manager for 369 Niyyah
 * 
 * Manages time slots based on the 369 methodology:
 * - Morning: 08:00 (8 AM) to 12:59
 * - Noon (Afternoon): 13:00 (1 PM) to 17:59
 * - Night (Evening): 18:00 (6 PM) to 04:59 (next day)
 * 
 * Note: 05:00 - 07:59 is a rest period (returns null)
 */

/**
 * Format a Date object as YYYY-MM-DD using local timezone
 */
export const formatLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Slot start hours for reference
const SLOT_START_HOURS: Record<TimeSlot, number> = {
    morning: 8,
    noon: 13,
    night: 18,
};

/**
 * Get the current active time slot based on system time
 */
export const getCurrentSlot = (): TimeSlot | null => {
    const now = new Date();
    const hour = now.getHours();

    // 05:00 - 07:59: rest period
    if (hour >= 5 && hour < 8) return null;
    // 08:00 - 12:59: morning
    if (hour >= 8 && hour < 13) return 'morning';
    // 13:00 - 17:59: noon (afternoon)
    if (hour >= 13 && hour < 18) return 'noon';
    // 18:00 - 23:59 or 00:00 - 04:59: night (evening)
    return 'night';
};

export type SlotStatus = 'active' | 'upcoming' | 'passed';

/**
 * Get the status of a slot for today
 */
export const getSlotStatus = (slot: TimeSlot): SlotStatus => {
    const now = new Date();
    const hour = now.getHours();
    const currentSlot = getCurrentSlot();

    if (currentSlot === slot) return 'active';

    const slotStart = SLOT_START_HOURS[slot];

    // Handle night slot (18:00 - 04:59)
    if (slot === 'night') {
        // During rest period (05:00-07:59), night has passed
        if (hour >= 5 && hour < 8) return 'passed';
        // Before 18:00, night is upcoming
        if (hour >= 8 && hour < 18) return 'upcoming';
        return 'active';
    }

    // Handle morning/noon during night hours (00:00-04:59)
    if (hour < 5) {
        // During night slot, morning and noon have passed (for this effective day)
        return 'passed';
    }

    // Normal daytime comparison
    if (hour < slotStart) return 'upcoming';
    return 'passed';
};

/**
 * Check if a specific slot is currently active
 */
export const isSlotActive = (slot: TimeSlot): boolean => {
    return getCurrentSlot() === slot;
};

/**
 * Slot display configuration
 */
const SLOT_CONFIG: Record<TimeSlot, { label: string; emoji: string; timeRange: string; count: number }> = {
    morning: {
        label: 'Morning Niyyah',
        emoji: '🌅',
        timeRange: '8:00 AM – 1:00 PM',
        count: 3,
    },
    noon: {
        label: 'Afternoon Niyyah',
        emoji: '☀️',
        timeRange: '1:00 PM – 6:00 PM',
        count: 6,
    },
    night: {
        label: 'Evening Niyyah',
        emoji: '🌙',
        timeRange: '6:00 PM – 5:00 AM',
        count: 9,
    },
};

export const getSlotLabel = (slot: TimeSlot): string => SLOT_CONFIG[slot].label;
export const getSlotEmoji = (slot: TimeSlot): string => SLOT_CONFIG[slot].emoji;
export const getSlotTimeRange = (slot: TimeSlot): string => SLOT_CONFIG[slot].timeRange;
export const getRepetitionTarget = (slot: TimeSlot): number => SLOT_CONFIG[slot].count;

/**
 * Get the effective date key for progress tracking
 * Handles midnight crossover for night slot (00:00-04:59 belongs to previous day)
 */
export const getEffectiveDateKey = (slot?: TimeSlot): string => {
    const now = new Date();
    const hour = now.getHours();

    // During midnight crossover (00:00-04:59), this belongs to previous day's night slot
    if (hour < 5) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDateKey(yesterday);
    }

    return formatLocalDateKey(now);
};

/**
 * Get today's effective date key for dashboard display
 * If current time is 00:00-04:59, we're still in "yesterday's" night slot context
 */
export const getTodayEffectiveDateKey = (): string => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 5) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDateKey(yesterday);
    }

    return formatLocalDateKey(now);
};

/**
 * Get today's effective Date object for calendar/history views
 */
export const getEffectiveTodayDate = (): Date => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 5) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return yesterday;
    }

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return today;
};

/**
 * Get the effective start date for first-time app initialization
 */
export const getEffectiveStartDate = (): string => {
    return getEffectiveStartDateFromTime(new Date());
};

/**
 * Get the effective start date from a specific reference time
 */
export const getEffectiveStartDateFromTime = (referenceTime: Date): string => {
    const hour = referenceTime.getHours();

    if (hour < 5) {
        const yesterday = new Date(referenceTime);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDateKey(yesterday);
    }

    return formatLocalDateKey(referenceTime);
};

/**
 * DAY_BOUNDARY_HOUR defines when a new "effective day" begins.
 * Days transition at 5:00 AM local time, not midnight.
 */
export const DAY_BOUNDARY_HOUR = 5;

/**
 * Get the effective day boundary timestamp for a given date key
 */
export const getNextDayBoundaryTimestamp = (dateKey: string): number => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const boundaryDate = new Date(year, month - 1, day);
    // Next day at 5:00 AM
    boundaryDate.setDate(boundaryDate.getDate() + 1);
    boundaryDate.setHours(DAY_BOUNDARY_HOUR, 0, 0, 0);
    return boundaryDate.getTime();
};

/**
 * Calculate elapsed effective days since start date
 */
export const calculateEffectiveElapsedDays = (startDateKey: string): number => {
    const now = new Date();
    const currentHour = now.getHours();

    const [startYear, startMonth, startDay] = startDateKey.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);
    startDate.setHours(0, 0, 0, 0);

    // Get effective "today" date
    let effectiveToday: Date;
    if (currentHour < DAY_BOUNDARY_HOUR) {
        effectiveToday = new Date(now);
        effectiveToday.setDate(effectiveToday.getDate() - 1);
        effectiveToday.setHours(0, 0, 0, 0);
    } else {
        effectiveToday = new Date(now);
        effectiveToday.setHours(0, 0, 0, 0);
    }

    const diffMs = effectiveToday.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Day 1 = install day, so elapsed = diff + 1
    return Math.max(1, diffDays + 1);
};

/**
 * Maximum day number for display.
 * After this day, the display caps while internal tracking continues.
 */
export const MAX_DISPLAY_DAY = 369;

/**
 * Get display day (capped at MAX_DISPLAY_DAY)
 */
export const getDisplayDay = (totalElapsedDays: number): number => {
    return Math.min(totalElapsedDays, MAX_DISPLAY_DAY);
};

/**
 * Check if the 369-day journey is complete
 */
export const isJourneyComplete = (totalElapsedDays: number): boolean => {
    return totalElapsedDays > MAX_DISPLAY_DAY;
};
