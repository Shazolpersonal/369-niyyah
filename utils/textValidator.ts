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
 * Helper to get length of string in code points (safely counting surrogate pairs like emojis as 1).
 */
const getCodePointLength = (str: string): number => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            i++; // Skip low surrogate
        }
        count++;
    }
    return count;
};

/**
 * Performs character-aware validation of input against target.
 * This is the single source of truth for all validation states.
 */
export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    // ⚡ Bolt: Using native string `startsWith` instead of allocating and iterating arrays O(N)
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // ⚡ Bolt: Getting code point lengths manually avoiding array spreading `[...str]`
    const inputLength = getCodePointLength(normalizedInput);
    const targetLength = getCodePointLength(normalizedTarget);

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
export const getHighlightSegments = (input: string, displayTarget: string): HighlightSegments => {
    if (input.length === 0) {
        return { correct: '', incorrect: '', remaining: displayTarget };
    }

    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(displayTarget);

    // ⚡ Bolt: Iterate through strings using native index to avoid O(N) array allocation via spreading
    // We must match full code points to avoid slicing an emoji in half!
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const codePointInput = normalizedInput.codePointAt(i);
        const codePointTarget = normalizedTarget.codePointAt(i);

        if (codePointInput !== codePointTarget) {
            break;
        }

        // Advance by 2 if it's a surrogate pair (code point > 0xFFFF), otherwise 1
        i += codePointInput! > 0xFFFF ? 2 : 1;
    }

    const correctEnd = i;

    // We need to find where the input ends in the target string.
    // Instead of using code unit length which fails when input and target have different
    // numbers of surrogate pairs in their remaining unmatched portions, we advance a pointer
    // in the target string by the number of code points remaining in the input.
    let remainingInputCodePoints = 0;
    let inputPtr = i;
    while (inputPtr < normalizedInput.length) {
        remainingInputCodePoints++;
        const code = normalizedInput.charCodeAt(inputPtr);
        inputPtr += (code >= 0xd800 && code <= 0xdbff) ? 2 : 1;
    }

    let targetPtr = i;
    let counted = 0;
    while (targetPtr < normalizedTarget.length && counted < remainingInputCodePoints) {
        counted++;
        const code = normalizedTarget.charCodeAt(targetPtr);
        targetPtr += (code >= 0xd800 && code <= 0xdbff) ? 2 : 1;
    }
    const inputEnd = targetPtr;

    // ⚡ Bolt: Use native `substring` to slice strings instead of mapping array back to string
    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, inputEnd);
    const remaining = displayTarget.substring(inputEnd);

    return { correct, incorrect, remaining };
};
