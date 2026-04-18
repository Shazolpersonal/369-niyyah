import { describe, it, expect } from "bun:test";
import { normalize } from "./textValidator";

describe("textValidator", () => {
    describe("normalize", () => {
        it("should lowercase all characters", () => {
            expect(normalize("HELLO")).toBe("hello");
            expect(normalize("Mixed Case Text")).toBe("mixed case text");
        });

        it("should remove common punctuation and smart quotes", () => {
            expect(normalize("Hello, World!")).toBe("hello world");
            expect(normalize("What's up?")).toBe("whats up");
            expect(normalize('She said: "No."')).toBe("she said no");
            expect(normalize("Dash-separated—text")).toBe("dashseparatedtext");
            expect(normalize("Smart \u201cquotes\u201d and \u2018apostrophes\u2019")).toBe("smart quotes and apostrophes");
            expect(normalize("A; B: C. D, E! F? G' H\" I( J) K- L— M–")).toBe("a b c d e f g h i j k l m");
        });

        it("should replace multiple spaces with a single space", () => {
            expect(normalize("hello    world")).toBe("hello world");
            expect(normalize("a  b   c    d")).toBe("a b c d");
        });

        it("should trim leading whitespace but preserve trailing whitespace", () => {
            expect(normalize("  hello")).toBe("hello");
            expect(normalize("hello  ")).toBe("hello "); // trailing whitespace becomes a single space
            expect(normalize("   hello   world   ")).toBe("hello world ");
            expect(normalize("   ")).toBe(""); // spaces reduce to one space then leading trimmed, or trimmed entirely depending on implementation
        });

        it("should handle empty strings", () => {
            expect(normalize("")).toBe("");
        });

        it("should handle strings with only punctuation", () => {
            expect(normalize(".,;:!?'\"()—–")).toBe("");
        });

        it("should handle combination of all cases", () => {
             expect(normalize("  Hello,   World!  How's   it going?  ")).toBe("hello world hows it going ");
        });
    });
});
