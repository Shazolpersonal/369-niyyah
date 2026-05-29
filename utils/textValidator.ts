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
 * Helper to get actual length of a string in code points (handling surrogate pairs like emojis).
 */
function getCodePointCount(str: string): number {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
        count++;
    }
    return count;
}

/**
 * Helper to find the string index corresponding to a specific code point count.
 */
function getCodePointIndex(str: string, codePointIndex: number): number {
    let currentCodePoint = 0;
    for (let i = 0; i < str.length; i++) {
        if (currentCodePoint === codePointIndex) return i;
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
        currentCodePoint++;
    }
    return str.length;
}

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
export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    // Check if input is a valid prefix of target
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Length calculation handling emojis (surrogate pairs) without array allocation
    const inputLength = getCodePointCount(normalizedInput);
    const targetLength = getCodePointCount(normalizedTarget);

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

    // Find how many normalized characters match
    let matchedNormalizedCount = 0;
    let i = 0;
    let j = 0;

    // Direct iteration of code points
    while (i < normalizedInput.length && j < normalizedTarget.length) {
        const c1 = normalizedInput.codePointAt(i);
        const c2 = normalizedTarget.codePointAt(j);

        if (c1 !== c2) break;

        matchedNormalizedCount++;
        i += c1! > 0xffff ? 2 : 1;
        j += c2! > 0xffff ? 2 : 1;
    }

    const inputLen = getCodePointCount(normalizedInput);
    const targetLen = getCodePointCount(normalizedTarget);

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLen, targetLen);

    // Map the matched counts back to string indices on the original target text
    const displayCorrectEndIndex = getCodePointIndex(displayTarget, correctEnd);
    const displayInputEndIndex = getCodePointIndex(displayTarget, inputEnd);

    const correct = displayTarget.substring(0, displayCorrectEndIndex);
    const incorrect = displayTarget.substring(displayCorrectEndIndex, displayInputEndIndex);
    const remaining = displayTarget.substring(displayInputEndIndex);

    return { correct, incorrect, remaining };
};
