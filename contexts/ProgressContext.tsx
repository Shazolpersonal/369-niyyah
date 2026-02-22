import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef,
    useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyProgress, TimeSlot } from '../types';
import {
    getEffectiveDateKey,
    getEffectiveStartDateFromTime,
    getTodayEffectiveDateKey,
    calculateEffectiveElapsedDays,
    formatLocalDateKey,
} from '../utils/timeSlotManager';

const STORAGE_KEY = '@niyyah_369_progress';
const FIRST_LAUNCH_KEY = '@niyyah_369_first_launch';

interface ProgressContextType {
    startDate: string | null;
    dailyProgress: Record<string, DailyProgress>;
    completeTask: (slot: TimeSlot) => Promise<void>;
    getProgressForDate: (date: string) => DailyProgress | null;
    totalElapsedDays: number;
    trueStreak: number;
    isTodayComplete: boolean;
    isLoading: boolean;
    isFirstLaunch: boolean;
    completeOnboarding: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
    children: ReactNode;
}

interface PersistedData {
    startDate: string;
    dailyProgress: Record<string, DailyProgress>;
    startTimestamp?: number;
}

/**
 * Returns YYYY-MM-DD in local timezone
 */
const getLocalDateKey = (date?: Date): string => {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a date key (YYYY-MM-DD) to local midnight Date
 */
const parseToLocalDate = (dateStr: string): Date => {
    if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Calculate total elapsed days since start
 */
const calculateTotalElapsedDays = (startDate: string | null): number => {
    if (!startDate) return 1;
    return calculateEffectiveElapsedDays(startDate);
};

const MAX_STREAK_ITERATIONS = 1000;

/**
 * Calculate true streak: consecutive complete days going backwards from YESTERDAY
 */
const calculateTrueStreak = (
    dailyProgress: Record<string, DailyProgress>,
    startDate: string | null
): number => {
    if (!startDate) return 0;

    const startDateObj = parseToLocalDate(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    // Start from yesterday (effective)
    const effectiveToday = new Date();
    const hour = effectiveToday.getHours();
    if (hour < 5) {
        effectiveToday.setDate(effectiveToday.getDate() - 1);
    }
    effectiveToday.setHours(0, 0, 0, 0);

    // Yesterday in effective terms
    const checkDate = new Date(effectiveToday);
    checkDate.setDate(checkDate.getDate() - 1);

    let streak = 0;
    let iterations = 0;

    while (iterations < MAX_STREAK_ITERATIONS) {
        // Don't count before start date
        if (checkDate < startDateObj) break;

        const dateKey = getLocalDateKey(checkDate);
        const progress = dailyProgress[dateKey];

        if (progress && progress.morning && progress.noon && progress.night) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }

        iterations++;
    }

    // Check if today is also complete (add to streak display)
    const todayKey = getTodayEffectiveDateKey();
    const todayProgress = dailyProgress[todayKey];
    if (todayProgress && todayProgress.morning && todayProgress.noon && todayProgress.night) {
        streak++;
    }

    return streak;
};

export function ProgressProvider({ children }: ProgressProviderProps) {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [dailyProgress, setDailyProgress] = useState<Record<string, DailyProgress>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(true);

    // Derived values (memoized to avoid expensive recalculation on every render)
    const totalElapsedDays = useMemo(() => calculateTotalElapsedDays(startDate), [startDate]);
    const trueStreak = useMemo(() => calculateTrueStreak(dailyProgress, startDate), [dailyProgress, startDate]);

    const todayKey = getTodayEffectiveDateKey();
    const todayProgress = dailyProgress[todayKey];
    const isTodayComplete = todayProgress
        ? todayProgress.morning && todayProgress.noon && todayProgress.night
        : false;

    // Persist data
    const persistData = useCallback(async (data: PersistedData) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to persist progress:', error);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        const loadProgress = async () => {
            try {
                // Check first launch
                const firstLaunchValue = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
                const isFirst = firstLaunchValue === null;
                setIsFirstLaunch(isFirst);

                // Load saved progress
                const savedData = await AsyncStorage.getItem(STORAGE_KEY);

                if (savedData) {
                    const parsed: PersistedData = JSON.parse(savedData);

                    // Convert old ISO date format to YYYY-MM-DD if needed
                    let normalizedStartDate = parsed.startDate;
                    if (normalizedStartDate && normalizedStartDate.includes('T')) {
                        const d = new Date(normalizedStartDate);
                        normalizedStartDate = getLocalDateKey(d);
                    }

                    setStartDate(normalizedStartDate);
                    setDailyProgress(parsed.dailyProgress || {});
                } else if (!isFirst) {
                    // Not first launch but no data — initialize
                    const referenceTime = new Date();
                    const effectiveStart = getEffectiveStartDateFromTime(referenceTime);
                    setStartDate(effectiveStart);

                    const newData: PersistedData = {
                        startDate: effectiveStart,
                        dailyProgress: {},
                        startTimestamp: referenceTime.getTime(),
                    };
                    await persistData(newData);
                }
            } catch (error) {
                console.error('Failed to load progress:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProgress();
    }, [persistData]);

    const completeOnboarding = useCallback(async () => {
        try {
            await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
            setIsFirstLaunch(false);

            // Initialize start date
            const referenceTime = new Date();
            const effectiveStart = getEffectiveStartDateFromTime(referenceTime);
            setStartDate(effectiveStart);

            const newData: PersistedData = {
                startDate: effectiveStart,
                dailyProgress: {},
                startTimestamp: referenceTime.getTime(),
            };
            await persistData(newData);
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
        }
    }, [persistData]);

    const completeTask = useCallback(async (slot: TimeSlot) => {
        const dateKey = getEffectiveDateKey(slot);

        setDailyProgress(prev => {
            const updatedProgress = {
                ...prev,
                [dateKey]: {
                    ...(prev[dateKey] || { morning: false, noon: false, night: false }),
                    [slot]: true,
                },
            };

            // Persist asynchronously
            if (startDate) {
                persistData({
                    startDate,
                    dailyProgress: updatedProgress,
                });
            }

            return updatedProgress;
        });
    }, [startDate, persistData]);

    const getProgressForDate = useCallback((date: string): DailyProgress | null => {
        return dailyProgress[date] || null;
    }, [dailyProgress]);

    const value: ProgressContextType = useMemo(() => ({
        startDate,
        dailyProgress,
        completeTask,
        getProgressForDate,
        totalElapsedDays,
        trueStreak,
        isTodayComplete,
        isLoading,
        isFirstLaunch,
        completeOnboarding,
    }), [startDate, dailyProgress, completeTask, getProgressForDate, totalElapsedDays, trueStreak, isTodayComplete, isLoading, isFirstLaunch, completeOnboarding]);

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress(): ProgressContextType {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}
