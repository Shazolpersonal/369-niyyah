import { describe, it, expect } from 'bun:test';

describe('Environment Check', () => {
    it('should have crypto.getRandomValues available', () => {
        expect(typeof crypto).not.toBe('undefined');
        expect(typeof crypto.getRandomValues).toBe('function');
    });
});
