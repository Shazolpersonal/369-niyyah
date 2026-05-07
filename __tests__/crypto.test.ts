import { describe, it, expect } from 'bun:test';
import { secureRandom, getSecureRandomInt } from '../utils/crypto';

describe('secureRandom', () => {
    it('should return a number between 0 and 1', () => {
        for (let i = 0; i < 100; i++) {
            const val = secureRandom();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    it('should return different values', () => {
        const val1 = secureRandom();
        const val2 = secureRandom();
        expect(val1).not.toBe(val2);
    });

    it('should throw an error if crypto.getRandomValues is unavailable', () => {
        // Backup original crypto
        const originalCrypto = global.crypto;

        // Mock crypto to be undefined
        Object.defineProperty(global, 'crypto', {
            value: undefined,
            writable: true,
        });

        try {
            expect(() => secureRandom()).toThrow('Web Crypto API is not available in this environment.');
        } finally {
            // Restore original crypto
            Object.defineProperty(global, 'crypto', {
                value: originalCrypto,
                writable: true,
            });
        }
    });
});

describe('getSecureRandomInt', () => {
    it('should return an integer between min and max', () => {
        const min = 5;
        const max = 10;
        for (let i = 0; i < 100; i++) {
            const val = getSecureRandomInt(min, max);
            expect(Number.isInteger(val)).toBe(true);
            expect(val).toBeGreaterThanOrEqual(min);
            expect(val).toBeLessThan(max);
        }
    });
});
