import { describe, expect, test } from "bun:test";
import { getContentIndex } from "../../utils/contentCycler";

describe("getContentIndex", () => {
    test("handles edge cases and negative days", () => {
        expect(getContentIndex(-5)).toBe(0);
        expect(getContentIndex(0)).toBe(0);
    });

    test("returns correct index for the first cycle (days 1-41)", () => {
        expect(getContentIndex(1)).toBe(0);
        expect(getContentIndex(2)).toBe(1);
        expect(getContentIndex(20)).toBe(19);
        expect(getContentIndex(41)).toBe(40);
    });

    test("correctly wraps around after day 41", () => {
        expect(getContentIndex(42)).toBe(0);
        expect(getContentIndex(43)).toBe(1);
        expect(getContentIndex(82)).toBe(40);
    });

    test("handles very large day numbers", () => {
        expect(getContentIndex(83)).toBe(0);
        expect(getContentIndex(100)).toBe(17); // (100 - 1) % 41 = 99 % 41 = 17
    });
});
