import { test, expect, describe, setSystemTime, afterEach } from 'bun:test';
import { getSlotStatus, getCurrentSlot, getEffectiveDateKey } from './timeSlotManager';

describe('timeSlotManager', () => {
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

    describe('getEffectiveDateKey', () => {
        test('should return the current date for daytime hours (e.g., 12:00 PM)', () => {
            setSystemTime(new Date('2023-10-15T12:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-15');
        });

        test('should return the current date for early morning after the boundary (e.g., 5:00 AM)', () => {
            setSystemTime(new Date('2023-10-15T05:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-15');
        });

        test('should return the previous date during the midnight crossover (e.g., 2:00 AM)', () => {
            setSystemTime(new Date('2023-10-15T02:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-14');
        });

        test('should return the previous date just before the boundary (e.g., 4:59 AM)', () => {
            setSystemTime(new Date('2023-10-15T04:59:59'));
            expect(getEffectiveDateKey()).toBe('2023-10-14');
        });

        test('should handle month boundaries correctly (e.g., March 1st 3:00 AM in a leap year)', () => {
            setSystemTime(new Date('2024-03-01T03:00:00'));
            expect(getEffectiveDateKey()).toBe('2024-02-29');
        });

        test('should handle month boundaries correctly (e.g., March 1st 3:00 AM in a non-leap year)', () => {
            setSystemTime(new Date('2023-03-01T03:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-02-28');
        });

        test('should handle year boundaries correctly (e.g., January 1st 2:00 AM)', () => {
            setSystemTime(new Date('2024-01-01T02:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-12-31');
        });
    });
});
