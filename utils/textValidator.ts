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
export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    // Check if input is a valid prefix of target using primitive string operation
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Manually count actual characters, accounting for surrogate pairs
    let inputLen = 0;
    let i = 0;
    while (i < normalizedInput.length) {
        inputLen++;
        const code = normalizedInput.charCodeAt(i);
        i++;
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    let targetLen = 0;
    let j = 0;
    while (j < normalizedTarget.length) {
        targetLen++;
        const code = normalizedTarget.charCodeAt(j);
        j++;
        if (code >= 0xD800 && code <= 0xDBFF) j++;
    }

    // Calculate progress percentage
    const percent =
        targetLen > 0
            ? Math.min(100, Math.floor((inputLen / targetLen) * 100))
            : 0;

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && inputLen === targetLen;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength: inputLen,
        targetLength: targetLen,
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

    // Find how many normalized characters match, safely iterating code units
    let correctCodeUnitEnd = 0;
    while (
        correctCodeUnitEnd < normalizedInput.length &&
        correctCodeUnitEnd < normalizedTarget.length &&
        normalizedInput.charCodeAt(correctCodeUnitEnd) === normalizedTarget.charCodeAt(correctCodeUnitEnd)
    ) {
        const code = normalizedInput.charCodeAt(correctCodeUnitEnd);
        correctCodeUnitEnd++;
        if (code >= 0xD800 && code <= 0xDBFF) {
            if (
                correctCodeUnitEnd < normalizedInput.length &&
                correctCodeUnitEnd < normalizedTarget.length &&
                normalizedInput.charCodeAt(correctCodeUnitEnd) === normalizedTarget.charCodeAt(correctCodeUnitEnd)
            ) {
                correctCodeUnitEnd++;
            } else {
                correctCodeUnitEnd--; // Rollback lead surrogate match if trail surrogate differs
                break;
            }
        }
    }

    // Map matched length to actual character count
    let inputLen = 0;
    let idx = 0;
    while (idx < normalizedInput.length) {
        inputLen++;
        const code = normalizedInput.charCodeAt(idx);
        idx++;
        if (code >= 0xD800 && code <= 0xDBFF) idx++;
    }

    // Find corresponding code unit index in displayTarget that matches input character length
    let currentChars = 0;
    let targetCodeUnitIdx = 0;
    while (targetCodeUnitIdx < displayTarget.length && currentChars < inputLen) {
        currentChars++;
        const code = displayTarget.charCodeAt(targetCodeUnitIdx);
        targetCodeUnitIdx++;
        if (code >= 0xD800 && code <= 0xDBFF) targetCodeUnitIdx++;
    }

    // Safely extract substrings using calculated code unit indices
    const correct = displayTarget.substring(0, correctCodeUnitEnd);
    const incorrect = displayTarget.substring(correctCodeUnitEnd, targetCodeUnitIdx);
    const remaining = displayTarget.substring(targetCodeUnitIdx);

    return { correct, incorrect, remaining };
};
