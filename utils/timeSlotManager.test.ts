import { describe, expect, it, afterEach, setSystemTime } from 'bun:test';
import { getEffectiveDateKey } from './timeSlotManager';

describe('timeSlotManager', () => {
    describe('getEffectiveDateKey', () => {
        afterEach(() => {
            setSystemTime(); // Reset system time after each test
        });

        it('should return the current date for daytime hours (e.g., 12:00 PM)', () => {
            setSystemTime(new Date('2023-10-15T12:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-15');
        });

        it('should return the current date for early morning after the boundary (e.g., 5:00 AM)', () => {
            setSystemTime(new Date('2023-10-15T05:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-15');
        });

        it('should return the previous date during the midnight crossover (e.g., 2:00 AM)', () => {
            setSystemTime(new Date('2023-10-15T02:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-10-14');
        });

        it('should return the previous date just before the boundary (e.g., 4:59 AM)', () => {
            setSystemTime(new Date('2023-10-15T04:59:59'));
            expect(getEffectiveDateKey()).toBe('2023-10-14');
        });

        it('should handle month boundaries correctly (e.g., March 1st 3:00 AM in a leap year)', () => {
            setSystemTime(new Date('2024-03-01T03:00:00'));
            expect(getEffectiveDateKey()).toBe('2024-02-29');
        });

        it('should handle month boundaries correctly (e.g., March 1st 3:00 AM in a non-leap year)', () => {
            setSystemTime(new Date('2023-03-01T03:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-02-28');
        });

        it('should handle year boundaries correctly (e.g., January 1st 2:00 AM)', () => {
            setSystemTime(new Date('2024-01-01T02:00:00'));
            expect(getEffectiveDateKey()).toBe('2023-12-31');
        });
    });
});
