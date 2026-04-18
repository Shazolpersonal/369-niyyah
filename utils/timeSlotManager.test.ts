import { test, expect, describe, setSystemTime, afterEach } from 'bun:test';
import { getSlotStatus, getCurrentSlot, formatLocalDateKey } from './timeSlotManager';

describe('timeSlotManager', () => {
    describe('formatLocalDateKey', () => {
        test('should format a regular date correctly', () => {
            const date = new Date(2023, 9, 15); // October 15, 2023
            expect(formatLocalDateKey(date)).toBe('2023-10-15');
        });

        test('should pad single digit months with zero', () => {
            const date = new Date(2023, 2, 15); // March 15, 2023
            expect(formatLocalDateKey(date)).toBe('2023-03-15');
        });

        test('should pad single digit days with zero', () => {
            const date = new Date(2023, 10, 5); // November 5, 2023
            expect(formatLocalDateKey(date)).toBe('2023-11-05');
        });

        test('should pad single digit months and days with zero', () => {
            const date = new Date(2023, 0, 1); // January 1, 2023
            expect(formatLocalDateKey(date)).toBe('2023-01-01');
        });

        test('should handle leap years correctly', () => {
            const date = new Date(2024, 1, 29); // February 29, 2024
            expect(formatLocalDateKey(date)).toBe('2024-02-29');
        });

        test('should handle end of year correctly', () => {
            const date = new Date(2023, 11, 31); // December 31, 2023
            expect(formatLocalDateKey(date)).toBe('2023-12-31');
        });
    });

    afterEach(() => {
        // Reset system time after each test
        setSystemTime();
    });

    const mockTime = (hours: number, minutes: number = 0) => {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        setSystemTime(date);
    };

    describe('getCurrentSlot', () => {
        test('should return null during rest period (05:00 - 07:59)', () => {
            mockTime(5, 0);
            expect(getCurrentSlot()).toBeNull();
            mockTime(7, 59);
            expect(getCurrentSlot()).toBeNull();
        });

        test("should return 'morning' between 08:00 and 12:59", () => {
            mockTime(8, 0);
            expect(getCurrentSlot()).toBe('morning');
            mockTime(12, 59);
            expect(getCurrentSlot()).toBe('morning');
        });

        test("should return 'noon' between 13:00 and 17:59", () => {
            mockTime(13, 0);
            expect(getCurrentSlot()).toBe('noon');
            mockTime(17, 59);
            expect(getCurrentSlot()).toBe('noon');
        });

        test("should return 'night' between 18:00 and 04:59", () => {
            mockTime(18, 0);
            expect(getCurrentSlot()).toBe('night');
            mockTime(23, 59);
            expect(getCurrentSlot()).toBe('night');
            mockTime(0, 0);
            expect(getCurrentSlot()).toBe('night');
            mockTime(4, 59);
            expect(getCurrentSlot()).toBe('night');
        });
    });

    describe('getSlotStatus', () => {
        describe('morning slot (08:00 - 12:59)', () => {
            test('should be upcoming before 08:00', () => {
                mockTime(7, 59);
                expect(getSlotStatus('morning')).toBe('upcoming');
                mockTime(4, 0); // Night slot
                expect(getSlotStatus('morning')).toBe('passed');
            });

            test('should be active between 08:00 and 12:59', () => {
                mockTime(8, 0);
                expect(getSlotStatus('morning')).toBe('active');
                mockTime(10, 30);
                expect(getSlotStatus('morning')).toBe('active');
                mockTime(12, 59);
                expect(getSlotStatus('morning')).toBe('active');
            });

            test('should be passed after 12:59', () => {
                mockTime(13, 0);
                expect(getSlotStatus('morning')).toBe('passed');
                mockTime(18, 0);
                expect(getSlotStatus('morning')).toBe('passed');
                mockTime(23, 59);
                expect(getSlotStatus('morning')).toBe('passed');
            });

            test('should be passed during night crossover (00:00 - 04:59)', () => {
                mockTime(0, 0);
                expect(getSlotStatus('morning')).toBe('passed');
                mockTime(4, 59);
                expect(getSlotStatus('morning')).toBe('passed');
            });
        });

        describe('noon slot (13:00 - 17:59)', () => {
            test('should be upcoming before 13:00', () => {
                mockTime(8, 0);
                expect(getSlotStatus('noon')).toBe('upcoming');
                mockTime(12, 59);
                expect(getSlotStatus('noon')).toBe('upcoming');
            });

            test('should be active between 13:00 and 17:59', () => {
                mockTime(13, 0);
                expect(getSlotStatus('noon')).toBe('active');
                mockTime(15, 30);
                expect(getSlotStatus('noon')).toBe('active');
                mockTime(17, 59);
                expect(getSlotStatus('noon')).toBe('active');
            });

            test('should be passed after 17:59', () => {
                mockTime(18, 0);
                expect(getSlotStatus('noon')).toBe('passed');
                mockTime(23, 59);
                expect(getSlotStatus('noon')).toBe('passed');
            });

            test('should be passed during night crossover (00:00 - 04:59)', () => {
                mockTime(0, 0);
                expect(getSlotStatus('noon')).toBe('passed');
                mockTime(4, 59);
                expect(getSlotStatus('noon')).toBe('passed');
            });
        });

        describe('night slot (18:00 - 04:59)', () => {
            test('should be upcoming before 18:00 (after rest period)', () => {
                mockTime(8, 0);
                expect(getSlotStatus('night')).toBe('upcoming');
                mockTime(17, 59);
                expect(getSlotStatus('night')).toBe('upcoming');
            });

            test('should be active between 18:00 and 04:59', () => {
                mockTime(18, 0);
                expect(getSlotStatus('night')).toBe('active');
                mockTime(23, 59);
                expect(getSlotStatus('night')).toBe('active');
                mockTime(0, 0);
                expect(getSlotStatus('night')).toBe('active');
                mockTime(4, 59);
                expect(getSlotStatus('night')).toBe('active');
            });

            test('should be passed during rest period (05:00 - 07:59)', () => {
                mockTime(5, 0);
                expect(getSlotStatus('night')).toBe('passed');
                mockTime(7, 59);
                expect(getSlotStatus('night')).toBe('passed');
            });
        });
    });
});
