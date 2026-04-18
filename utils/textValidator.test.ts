import { describe, it, expect } from 'bun:test';
import { validate } from './textValidator';

describe('textValidator', () => {
    describe('validate', () => {
        it('returns true for exact match', () => {
            expect(validate('hello world', 'hello world')).toBe(true);
        });

        it('returns true for match with different cases', () => {
            expect(validate('Hello World', 'hello world')).toBe(true);
            expect(validate('hello world', 'HELLO WORLD')).toBe(true);
        });

        it('returns true when input has extra or missing punctuation', () => {
            expect(validate('hello, world!', 'hello world')).toBe(true);
            expect(validate('hello world', 'hello, world!')).toBe(true);
            expect(validate('hello "world"', 'hello world')).toBe(true);
        });

        it('returns true when spacing between words is different or has leading spaces', () => {
            expect(validate('hello   world', 'hello world')).toBe(true);
            expect(validate('  hello world', 'hello world')).toBe(true);
        });

        it('returns false when trailing spaces differ', () => {
             // textValidator's normalize function only trims leading whitespace, so trailing spaces affect validation
             expect(validate('hello world  ', 'hello world')).toBe(false);
             expect(validate('hello world', 'hello world ')).toBe(false);
        });

        it('returns false for non-matching text', () => {
            expect(validate('hello world', 'goodbye world')).toBe(false);
            expect(validate('hello', 'hello world')).toBe(false);
            expect(validate('hello world', 'hello')).toBe(false);
        });

        it('handles empty strings', () => {
            expect(validate('', '')).toBe(true);
            // Since normalize uses \s+ to replace multiple spaces with ' ' and then trims leading space.
            // If string is only spaces, it becomes ''
            expect(validate('   ', '')).toBe(true);
            expect(validate('', '   ')).toBe(true);
        });

        it('handles smart quotes and dashes', () => {
            expect(validate('hello—world', 'helloworld')).toBe(true);
            expect(validate('\u201chello\u201d \u2018world\u2019', 'hello world')).toBe(true);
        });
    });
});
