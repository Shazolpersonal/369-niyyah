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

    it("should remove all specified punctuation marks", () => {
        // Individual punctuation from regex: [.,;:!?'"()\-—–\u201c\u201d\u2018\u2019]
        expect(normalize("period.")).toBe("period");
        expect(normalize("comma,")).toBe("comma");
        expect(normalize("semicolon;")).toBe("semicolon");
        expect(normalize("colon:")).toBe("colon");
        expect(normalize("exclamation!")).toBe("exclamation");
        expect(normalize("question?")).toBe("question");
        expect(normalize("single'quote")).toBe("singlequote");
        expect(normalize('double"quote')).toBe("doublequote");
        expect(normalize("(parentheses)")).toBe("parentheses");
        expect(normalize("hyphen-ated")).toBe("hyphenated");
        expect(normalize("em—dash")).toBe("emdash");
        expect(normalize("en–dash")).toBe("endash");
        expect(normalize("“smart double quotes”")).toBe("smart double quotes");
        expect(normalize("‘smart single quotes’")).toBe("smart single quotes");
    });

    it("should handle mixed punctuation and alphanumeric characters", () => {
        expect(normalize("Hello, World! (123)-456...")).toBe("hello world 123456");
    });

    it("should collapse multiple spaces into one", () => {
        expect(normalize("hello   world")).toBe("hello world");
        expect(normalize("too    many      spaces")).toBe("too many spaces");
    });

    it("should handle various whitespace characters (tabs, newlines)", () => {
        expect(normalize("hello\tworld")).toBe("hello world");
        expect(normalize("hello\nworld")).toBe("hello world");
        expect(normalize("hello  \t  \n  world")).toBe("hello world");
    });

    it("should trim leading but preserve trailing whitespace (collapsed to single space)", () => {
        expect(normalize("  hello ")).toBe("hello ");
        expect(normalize("\t\n  padded  ")).toBe("padded ");
    });

    it("should handle empty strings", () => {
        expect(normalize("")).toBe("");
    });

    it("should handle strings with only whitespace", () => {
        expect(normalize("   ")).toBe("");
        expect(normalize("\t\n ")).toBe("");
    });

    it("should handle strings with only punctuation", () => {
        expect(normalize(".,;:!?")).toBe("");
        expect(normalize("()---")).toBe("");
    });
});

describe("getDisplayText", () => {
    it("should remove punctuation but preserve case", () => {
        expect(getDisplayText("Hello, World!")).toBe("Hello World");
        expect(getDisplayText("I'm Happy")).toBe("Im Happy");
    });

    it("should remove all specified punctuation marks", () => {
        expect(getDisplayText("period.")).toBe("period");
        expect(getDisplayText("comma,")).toBe("comma");
        expect(getDisplayText("“smart quotes”")).toBe("smart quotes");
        expect(getDisplayText("(parentheses) and dashes —–")).toBe("parentheses and dashes ");
    });

    it("should collapse spaces and trim leading whitespace", () => {
        expect(getDisplayText("  Hello   World ")).toBe("Hello World ");
        expect(getDisplayText("\t\tTabs  and\nNewlines")).toBe("Tabs and Newlines");
    });

    it("should handle empty strings and whitespace-only strings", () => {
        expect(getDisplayText("")).toBe("");
        expect(getDisplayText("   ")).toBe("");
    });
});

describe("validate", () => {
    it("should return true for identical strings after normalization", () => {
        expect(validate("Hello world!", "hello world")).toBe(true);
        expect(validate("It's working", "its working")).toBe(true);
    });

    it("should return false for different strings", () => {
        expect(validate("hello", "world")).toBe(false);
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
