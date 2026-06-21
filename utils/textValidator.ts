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

    // Check if input is a valid prefix of target
    let isCorrectSoFar = true;
    for (let i = 0; i < normalizedInput.length; i++) {
        if (
            i >= normalizedTarget.length ||
            normalizedInput.charAt(i) !== normalizedTarget.charAt(i)
        ) {
            isCorrectSoFar = false;
            break;
        }
    }

    // Calculate progress percentage
    const percent =
        normalizedTarget.length > 0
            ? Math.min(100, Math.floor((normalizedInput.length / normalizedTarget.length) * 100))
            : 0;

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && normalizedInput.length === normalizedTarget.length;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength: normalizedInput.length,
        targetLength: normalizedTarget.length,
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
    for (let i = 0; i < normalizedInput.length; i++) {
        if (
            i >= normalizedTarget.length ||
            normalizedInput.charAt(i) !== normalizedTarget.charAt(i)
        ) {
            break;
        }
        matchedNormalizedCount++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(normalizedInput.length, normalizedTarget.length);

    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, inputEnd);
    const remaining = displayTarget.substring(inputEnd);

    return { correct, incorrect, remaining };
};
