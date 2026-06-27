/**
 * Text Validator Utility for 369 Niyyah
 * Handles normalization and validation of user input against target affirmation text.
 * Simplified for English text (no grapheme-splitter needed).
 */

// Pre-compiled regexes for performance
const PUNCTUATION_REGEX = /[.,;:!?'"()\-—–\u201c\u201d\u2018\u2019]/g;
const MULTI_SPACE_REGEX = /\s+/g;

/**
 * Normalizes text for comparison:
 * - Lowercase
 * - Remove punctuation (periods, commas, dashes, quotes, etc.)
 * - Trim whitespace
 * - Replace multiple spaces with single space
 */
export const normalize = (text: string): string => {
    return text
        .toLowerCase()
        .replace(PUNCTUATION_REGEX, '')
        .replace(MULTI_SPACE_REGEX, ' ')
        .trimStart(); // Only trim leading whitespace, preserve trailing
};

/**
 * Creates display-ready text by removing punctuation but preserving case and spacing.
 */
export const getDisplayText = (text: string): string => {
    return text.replace(PUNCTUATION_REGEX, '').replace(MULTI_SPACE_REGEX, ' ').trimStart();
};

/**
 * Validates user input against a target affirmation string.
 */
export const validate = (input: string, target: string): boolean => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);
    return normalizedInput === normalizedTarget;
};

/**
 * Validation result interface
 */
export interface ValidationInfo {
    isCorrectSoFar: boolean;
    isCompleteMatch: boolean;
    percent: number;
    inputLength: number;
    targetLength: number;
}

/**
 * Performs character-aware validation of input against target.
 * This is the single source of truth for all validation states.
 */
/**
 * Count unicode characters manually to avoid spread allocation
 */
const countChars = (str: string): number => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
        count++;
    }
    return count;
};

export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    // ⚡ Bolt Optimization: Replace O(N) [...str] spreading with zero-allocation while loop and charCodeAt
    let isCorrectSoFar = true;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const c1 = normalizedInput.charCodeAt(i);
        const c2 = normalizedTarget.charCodeAt(i);
        if (c1 !== c2) {
            isCorrectSoFar = false;
            break;
        }
        // Handle unicode surrogate pairs
        if (c1 >= 0xD800 && c1 <= 0xDBFF) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                if (normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)) {
                    isCorrectSoFar = false;
                    break;
                }
                i++;
            } else {
                isCorrectSoFar = false;
                break;
            }
        }
        i++;
    }

    if (normalizedInput.length > normalizedTarget.length) {
        isCorrectSoFar = false;
    }

    const inputLength = countChars(normalizedInput);
    const targetLength = countChars(normalizedTarget);

    // Calculate progress percentage
    const percent =
        targetLength > 0
            ? Math.min(100, Math.floor((inputLength / targetLength) * 100))
            : 0;

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && inputLength === targetLength;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength,
        targetLength,
    };
};

/**
 * Highlight segments for target text display
 */
export interface HighlightSegments {
    correct: string;
    incorrect: string;
    remaining: string;
}

/**
 * Gets highlight segments for display text based on user input.
 *
 * Strategy: Normalize both input and displayTarget as full strings,
 * then compare character-by-character. Map the match count back
 * to the original displayTarget to determine highlight boundaries.
 */
/**
 * Advance N unicode characters in a string
 */
const advanceChars = (str: string, charCount: number): number => {
    let i = 0;
    let chars = 0;
    while (chars < charCount && i < str.length) {
        const code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
        i++;
        chars++;
    }
    return i;
};

export const getHighlightSegments = (input: string, displayTarget: string): HighlightSegments => {
    if (input.length === 0) {
        return { correct: '', incorrect: '', remaining: displayTarget };
    }

    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(displayTarget);

    // ⚡ Bolt Optimization: Avoid O(N) spreading with zero-allocation charCodeAt string matching
    let matchCount = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const code1 = normalizedInput.charCodeAt(i);
        const code2 = normalizedTarget.charCodeAt(i);

        if (code1 !== code2) break;

        matchCount++;
        if (code1 >= 0xD800 && code1 <= 0xDBFF) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                const trail1 = normalizedInput.charCodeAt(i + 1);
                const trail2 = normalizedTarget.charCodeAt(i + 1);
                if (trail1 === trail2) {
                    i++;
                } else {
                    matchCount--; // rollback
                    break;
                }
            }
        }
        i++;
    }

    // Map matched count back to position in the original displayTarget.
    const correctEnd = matchCount;
    const inputLen = countChars(normalizedInput);
    const targetLen = countChars(normalizedTarget);
    const inputEnd = Math.min(inputLen, targetLen);

    // Convert character counts to string index offsets for substring
    const correctEndCU = advanceChars(displayTarget, correctEnd);
    const inputEndCU = advanceChars(displayTarget, inputEnd);

    const correct = displayTarget.substring(0, correctEndCU);
    const incorrect = displayTarget.substring(correctEndCU, inputEndCU);
    const remaining = displayTarget.substring(inputEndCU);

    return { correct, incorrect, remaining };
};
