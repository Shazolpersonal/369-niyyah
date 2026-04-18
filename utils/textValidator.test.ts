import { describe, expect, it } from "bun:test";
import {
    normalize,
    getDisplayText,
    validate,
    getValidationInfo,
    getHighlightSegments
} from "./textValidator";

describe("normalize", () => {
    it("should lowercase text", () => {
        expect(normalize("HELLO")).toBe("hello");
    });

    it("should remove punctuation", () => {
        expect(normalize("hello, world!")).toBe("hello world");
        expect(normalize("it's a test-case.")).toBe("its a testcase");
        expect(normalize("“smart quotes”")).toBe("smart quotes");
    });

    it("should collapse multiple spaces", () => {
        expect(normalize("hello   world")).toBe("hello world");
    });

    it("should trim leading but preserve trailing whitespace", () => {
        expect(normalize("  hello ")).toBe("hello ");
    });
});

describe("getDisplayText", () => {
    it("should remove punctuation but preserve case", () => {
        expect(getDisplayText("Hello, World!")).toBe("Hello World");
    });

    it("should collapse spaces and trim leading whitespace", () => {
        expect(getDisplayText("  Hello   World ")).toBe("Hello World ");
    });
});

describe("validate", () => {
    it("returns true for exact match", () => {
        expect(validate("hello world", "hello world")).toBe(true);
    });

    it("returns true for match with different cases", () => {
        expect(validate("Hello World", "hello world")).toBe(true);
        expect(validate("hello world", "HELLO WORLD")).toBe(true);
    });

    it("returns true when input has extra or missing punctuation", () => {
        expect(validate("hello, world!", "hello world")).toBe(true);
        expect(validate("hello world", "hello, world!")).toBe(true);
        expect(validate('hello "world"', "hello world")).toBe(true);
    });

    it("returns true when spacing between words is different or has leading spaces", () => {
        expect(validate("hello   world", "hello world")).toBe(true);
        expect(validate("  hello world", "hello world")).toBe(true);
    });

    it("returns false when trailing spaces differ", () => {
         // textValidator's normalize function only trims leading whitespace, so trailing spaces affect validation
         expect(validate("hello world  ", "hello world")).toBe(false);
         expect(validate("hello world", "hello world ")).toBe(false);
    });

    it("returns false for non-matching text", () => {
        expect(validate("hello world", "goodbye world")).toBe(false);
        expect(validate("hello", "hello world")).toBe(false);
        expect(validate("hello world", "hello")).toBe(false);
    });

    it("handles empty strings", () => {
        expect(validate("", "")).toBe(true);
        // Since normalize uses \s+ to replace multiple spaces with ' ' and then trims leading space.
        // If string is only spaces, it becomes ''
        expect(validate("   ", "")).toBe(true);
        expect(validate("", "   ")).toBe(true);
    });

    it("handles smart quotes and dashes", () => {
        expect(validate("hello—world", "helloworld")).toBe(true);
        expect(validate("“hello” ‘world’", "hello world")).toBe(true);
    });
});

describe("getValidationInfo", () => {
    const target = "I am successful";

    it("should handle exact match", () => {
        const result = getValidationInfo("I am successful", target);
        expect(result.isCorrectSoFar).toBe(true);
        expect(result.isCompleteMatch).toBe(true);
        expect(result.percent).toBe(100);
        expect(result.inputLength).toBe(15);
        expect(result.targetLength).toBe(15);
    });

    it("should handle partial match (prefix)", () => {
        const result = getValidationInfo("I am", target);
        expect(result.isCorrectSoFar).toBe(true);
        expect(result.isCompleteMatch).toBe(false);
        expect(result.percent).toBe(Math.floor((4 / 15) * 100));
    });

    it("should handle incorrect match", () => {
        const result = getValidationInfo("I an", target);
        expect(result.isCorrectSoFar).toBe(false);
        expect(result.isCompleteMatch).toBe(false);
    });

    it("should handle match with different case and punctuation", () => {
        const result = getValidationInfo("i am successful!", target);
        expect(result.isCorrectSoFar).toBe(true);
        expect(result.isCompleteMatch).toBe(true);
    });

    it("should handle input longer than target", () => {
        const result = getValidationInfo("I am successful and more", target);
        expect(result.isCorrectSoFar).toBe(false);
        expect(result.isCompleteMatch).toBe(false);
        expect(result.percent).toBe(100); // Because it takes Math.min(100, ...)
    });

    it("should handle empty target", () => {
        const result = getValidationInfo("test", "");
        expect(result.isCorrectSoFar).toBe(false);
        expect(result.isCompleteMatch).toBe(false);
        expect(result.percent).toBe(0);
    });

    it("should handle empty input", () => {
        const result = getValidationInfo("", target);
        expect(result.isCorrectSoFar).toBe(true);
        expect(result.isCompleteMatch).toBe(false);
        expect(result.percent).toBe(0);
    });
});

describe("getHighlightSegments", () => {
    const displayTarget = "Hello World";

    it("should return correct segments for partial correct input", () => {
        const result = getHighlightSegments("Hel", displayTarget);
        expect(result.correct).toBe("Hel");
        expect(result.incorrect).toBe("");
        expect(result.remaining).toBe("lo World");
    });

    it("should return correct segments for input with errors", () => {
        const result = getHighlightSegments("Hex", displayTarget);
        expect(result.correct).toBe("He");
        expect(result.incorrect).toBe("l");
        expect(result.remaining).toBe("lo World");
    });

    it("should handle empty input", () => {
        const result = getHighlightSegments("", displayTarget);
        expect(result.correct).toBe("");
        expect(result.incorrect).toBe("");
        expect(result.remaining).toBe(displayTarget);
    });

    it("should handle fully correct input", () => {
        const result = getHighlightSegments("Hello World", displayTarget);
        expect(result.correct).toBe("Hello World");
        expect(result.incorrect).toBe("");
        expect(result.remaining).toBe("");
    });

    it("should handle case differences in matching", () => {
        const result = getHighlightSegments("hello", displayTarget);
        expect(result.correct).toBe("Hello");
        expect(result.incorrect).toBe("");
        expect(result.remaining).toBe(" World");
    });
});
