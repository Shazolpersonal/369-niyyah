import { describe, expect, test } from "bun:test";
import { getHighlightSegments } from "./textValidator";

describe("getHighlightSegments", () => {
    test("should handle empty input correctly", () => {
        const result = getHighlightSegments("", "Hello world");
        expect(result).toEqual({ correct: "", incorrect: "", remaining: "Hello world" });
    });

    test("should handle fully correct input", () => {
        const result = getHighlightSegments("Hello world", "Hello world");
        expect(result).toEqual({ correct: "Hello world", incorrect: "", remaining: "" });
    });

    test("should handle partially correct input", () => {
        const result = getHighlightSegments("Hello", "Hello world");
        expect(result).toEqual({ correct: "Hello", incorrect: "", remaining: " world" });
    });

    test("should handle incorrect input early on", () => {
        const result = getHighlightSegments("Hxllo", "Hello world");
        expect(result).toEqual({ correct: "H", incorrect: "ello", remaining: " world" });
    });

    test("should handle correct input with mixed case", () => {
        const result = getHighlightSegments("hELLO WORLD", "Hello world");
        expect(result).toEqual({ correct: "Hello world", incorrect: "", remaining: "" });
    });

    test("should handle input longer than target", () => {
        const result = getHighlightSegments("Hello world extra", "Hello world");
        expect(result).toEqual({ correct: "Hello world", incorrect: "", remaining: "" });
    });

    test("should handle input with different spacing", () => {
        const result = getHighlightSegments("Hello   world", "Hello world");
        expect(result).toEqual({ correct: "Hello world", incorrect: "", remaining: "" });
    });
});
