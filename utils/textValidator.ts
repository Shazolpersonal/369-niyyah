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
 * Helper to count true codepoints (handling surrogate pairs) without allocating arrays.
 */
const countCodepoints = (str: string): number => {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        length++;
        const code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }
    return length;
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
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    const inputLength = countCodepoints(normalizedInput);
    const targetLength = countCodepoints(normalizedTarget);

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

    // Find how many normalized characters match
    let matchedNormalizedCount = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        if (normalizedInput.charCodeAt(i) === normalizedTarget.charCodeAt(i)) {
            const code = normalizedInput.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDBFF) {
                i++;
                if (i < normalizedInput.length && i < normalizedTarget.length) {
                    if (normalizedInput.charCodeAt(i) === normalizedTarget.charCodeAt(i)) {
                        matchedNormalizedCount++;
                        i++;
                    } else {
                        i--;
                        break;
                    }
                } else {
                    matchedNormalizedCount++;
                    i++;
                }
            } else {
                matchedNormalizedCount++;
                i++;
            }
        } else {
            break;
        }
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;

    const inputLength = countCodepoints(normalizedInput);
    const targetLength = countCodepoints(normalizedTarget);

    const inputEnd = Math.min(inputLength, targetLength);

    let correctUnitIndex = 0;
    let inputUnitIndex = 0;
    let currentCodepoint = 0;
    let unitIndex = 0;

    while (unitIndex < displayTarget.length) {
        if (currentCodepoint === correctEnd) {
            correctUnitIndex = unitIndex;
        }
        if (currentCodepoint === inputEnd) {
            inputUnitIndex = unitIndex;
            break;
        }

        const code = displayTarget.charCodeAt(unitIndex);
        if (code >= 0xD800 && code <= 0xDBFF) {
            unitIndex += 2;
        } else {
            unitIndex++;
        }
        currentCodepoint++;
    }

    if (currentCodepoint === correctEnd) correctUnitIndex = unitIndex;
    if (currentCodepoint === inputEnd) inputUnitIndex = unitIndex;

    const correct = displayTarget.substring(0, correctUnitIndex);
    const incorrect = displayTarget.substring(correctUnitIndex, inputUnitIndex);
    const remaining = displayTarget.substring(inputUnitIndex);

    return { correct, incorrect, remaining };
};
