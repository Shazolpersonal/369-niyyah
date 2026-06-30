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

    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++;
        }
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++;
        }
    }

    let isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Safety check for Unicode surrogate pairs:
    // If the input ends with a high surrogate, startsWith will match it, but it's an incomplete character.
    if (isCorrectSoFar && normalizedInput.length > 0) {
        const lastCodeUnit = normalizedInput.charCodeAt(normalizedInput.length - 1);
        if (lastCodeUnit >= 0xD800 && lastCodeUnit <= 0xDBFF) {
            // The input ends in a high surrogate. We consider this incorrect because
            // it doesn't form a full matching character.
            isCorrectSoFar = false;
        }
    }

    const percent = targetLength > 0
        ? Math.min(100, Math.floor((inputLength / targetLength) * 100))
        : 0;

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

    let matchEnd = 0;
    const minLenCodeUnits = Math.min(normalizedInput.length, normalizedTarget.length);

    while (matchEnd < minLenCodeUnits) {
        if (normalizedInput.charCodeAt(matchEnd) !== normalizedTarget.charCodeAt(matchEnd)) {
            break;
        }
        matchEnd++;
    }

    // Safety rollback for Unicode surrogate pairs:
    if (matchEnd > 0) {
        const lastCodeUnit = normalizedInput.charCodeAt(matchEnd - 1);
        if (lastCodeUnit >= 0xD800 && lastCodeUnit <= 0xDBFF) {
            matchEnd--;
        }
    }

    // First, count actual characters in input
    let inputCharCount = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputCharCount++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    // Next, find the equivalent code unit index in the target string for that character count
    let sliceEnd = 0;
    let targetCharCount = 0;
    while (sliceEnd < normalizedTarget.length && targetCharCount < inputCharCount) {
        targetCharCount++;
        const code = normalizedTarget.charCodeAt(sliceEnd);
        sliceEnd++;
        if (code >= 0xD800 && code <= 0xDBFF) {
            if (sliceEnd < normalizedTarget.length) sliceEnd++;
        }
    }

    const correct = displayTarget.substring(0, matchEnd);
    const incorrect = displayTarget.substring(matchEnd, sliceEnd);
    const remaining = displayTarget.substring(sliceEnd);

    return { correct, incorrect, remaining };
};
