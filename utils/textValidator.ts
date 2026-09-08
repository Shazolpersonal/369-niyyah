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
 * Helper to count unicode code points in a string without array spreading
 */
const countCodePoints = (str: string): number => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            i++;
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

    // Check if input is a valid prefix of target
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

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

    let matchedNormalizedCount = 0;
    let i = 0;
    let j = 0;

    // Find how many normalized characters match without spreading
    while (i < normalizedInput.length && j < normalizedTarget.length) {
        const inputCode = normalizedInput.charCodeAt(i);
        const targetCode = normalizedTarget.charCodeAt(j);

        const isInputSurrogate = inputCode >= 0xd800 && inputCode <= 0xdbff;
        const isTargetSurrogate = targetCode >= 0xd800 && targetCode <= 0xdbff;

        if (inputCode !== targetCode) {
            break;
        }

        if (isInputSurrogate && isTargetSurrogate) {
            if (
                i + 1 < normalizedInput.length &&
                j + 1 < normalizedTarget.length &&
                normalizedInput.charCodeAt(i + 1) === normalizedTarget.charCodeAt(j + 1)
            ) {
                i += 2;
                j += 2;
                matchedNormalizedCount++;
                continue;
            }
            break;
        }

        i++;
        j++;
        matchedNormalizedCount++;
    }

    const correctEnd = matchedNormalizedCount;
    const inputCharsLen = countCodePoints(normalizedInput);
    const targetCharsLen = countCodePoints(normalizedTarget);
    const inputEnd = Math.min(inputCharsLen, targetCharsLen);

    let currentCodePointCount = 0;
    let correctStrIdx = 0;
    let incorrectStrIdx = 0;

    for (let k = 0; k < displayTarget.length; k++) {
        const code = displayTarget.charCodeAt(k);
        if (code >= 0xd800 && code <= 0xdbff) {
            k++;
        }

        if (currentCodePointCount < correctEnd) {
            correctStrIdx = k + 1;
        }
        if (currentCodePointCount < inputEnd) {
            incorrectStrIdx = k + 1;
        }

        currentCodePointCount++;
    }

    if (correctStrIdx === 0 && correctEnd > 0) correctStrIdx = displayTarget.length;
    if (incorrectStrIdx === 0 && inputEnd > 0) incorrectStrIdx = displayTarget.length;

    return {
        correct: displayTarget.substring(0, correctStrIdx),
        incorrect: displayTarget.substring(correctStrIdx, incorrectStrIdx),
        remaining: displayTarget.substring(incorrectStrIdx),
    };
};
