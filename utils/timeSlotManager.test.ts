import { describe, expect, it } from 'bun:test';
import { formatLocalDateKey } from './timeSlotManager';

describe('formatLocalDateKey', () => {
    it('should format a regular date correctly', () => {
        const date = new Date(2023, 9, 15); // October 15, 2023
        expect(formatLocalDateKey(date)).toBe('2023-10-15');
    });

    it('should pad single digit months with zero', () => {
        const date = new Date(2023, 2, 15); // March 15, 2023
        expect(formatLocalDateKey(date)).toBe('2023-03-15');
    });

    it('should pad single digit days with zero', () => {
        const date = new Date(2023, 10, 5); // November 5, 2023
        expect(formatLocalDateKey(date)).toBe('2023-11-05');
    });

    it('should pad single digit months and days with zero', () => {
        const date = new Date(2023, 0, 1); // January 1, 2023
        expect(formatLocalDateKey(date)).toBe('2023-01-01');
    });

    it('should handle leap years correctly', () => {
        const date = new Date(2024, 1, 29); // February 29, 2024
        expect(formatLocalDateKey(date)).toBe('2024-02-29');
    });

    it('should handle end of year correctly', () => {
        const date = new Date(2023, 11, 31); // December 31, 2023
        expect(formatLocalDateKey(date)).toBe('2023-12-31');
    });
});
