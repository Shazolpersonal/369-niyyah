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

// ⚡ Bolt: Utility to safely count code points (handles surrogate pairs)
const countCodePoints = (str: string): number => {
    let count = 0;
    let i = 0;
    while (i < str.length) {
        count++;
        const code = str.charCodeAt(i);
        // If high surrogate, skip the low surrogate as well
        if (code >= 0xd800 && code <= 0xdbff) i += 2;
        else i += 1;
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

    // ⚡ Bolt Optimization: Use native startsWith instead of O(N) array spreading + manual iteration
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // ⚡ Bolt Optimization: Use zero-allocation code point counter instead of spreading [...str]
    const inputLength = countCodePoints(normalizedInput);
    const targetLength = countCodePoints(normalizedTarget);

    // Calculate progress percentage
    const percent =
        targetLength > 0 ? Math.min(100, Math.floor((inputLength / targetLength) * 100)) : 0;

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

    // ⚡ Bolt Optimization: Use manual charCodeAt loop to handle surrogate pairs
    // without the overhead of O(N) array allocation via [...str]
    let matchedNormalizedCount = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const inputCode = normalizedInput.charCodeAt(i);
        const targetCode = normalizedTarget.charCodeAt(i);

        if (inputCode !== targetCode) break;

        const isSurrogate = inputCode >= 0xd800 && inputCode <= 0xdbff;
        if (isSurrogate) {
            // Check if the low surrogate also matches
            if (normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)) break;
            i += 2;
        } else {
            i += 1;
        }
        matchedNormalizedCount++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    const correctEnd = matchedNormalizedCount;

    // Calculate length in code points for the input string to bound the incorrect segment
    const inputLength = countCodePoints(normalizedInput);
    const targetLength = countCodePoints(normalizedTarget);
    const inputEnd = Math.min(inputLength, targetLength);

    // Map code point indices back to string string byte/char indices
    let cpCount = 0;
    let idx = 0;
    let correctIdx = 0;
    let incorrectIdx = 0;

    while (idx < displayTarget.length) {
        if (cpCount === correctEnd) correctIdx = idx;
        if (cpCount === inputEnd) incorrectIdx = idx;

        const code = displayTarget.charCodeAt(idx);
        if (code >= 0xd800 && code <= 0xdbff) idx += 2;
        else idx += 1;
        cpCount++;
    }

    if (cpCount === correctEnd) correctIdx = displayTarget.length;
    if (cpCount === inputEnd) incorrectIdx = displayTarget.length;

    // ⚡ Bolt Optimization: Use fast native substring instead of Array.slice().join('')
    const correct = displayTarget.substring(0, correctIdx);
    const incorrect = displayTarget.substring(correctIdx, incorrectIdx);
    const remaining = displayTarget.substring(incorrectIdx);

    return { correct, incorrect, remaining };
};
