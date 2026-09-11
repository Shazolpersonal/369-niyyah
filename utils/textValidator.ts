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

    let isCorrectSoFar = true;

    // Calculate accurate unicode character lengths without O(N) array allocation
    let inputLength = normalizedInput.length;
    for (let i = 0; i < normalizedInput.length - 1; i++) {
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            inputLength--; // Subtract one for each surrogate pair
            i++; // Skip low surrogate
        }
    }

    let targetLength = normalizedTarget.length;
    for (let i = 0; i < normalizedTarget.length - 1; i++) {
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            targetLength--;
            i++;
        }
    }

    let i = 0;
    while (i < normalizedInput.length) {
        if (
            i >= normalizedTarget.length ||
            normalizedInput.charCodeAt(i) !== normalizedTarget.charCodeAt(i)
        ) {
            isCorrectSoFar = false;
            break;
        }

        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            if (i + 1 < normalizedInput.length) {
                if (
                    i + 1 < normalizedTarget.length &&
                    normalizedInput.charCodeAt(i + 1) === normalizedTarget.charCodeAt(i + 1)
                ) {
                    i++; // Match on low surrogate
                } else {
                    isCorrectSoFar = false;
                    break;
                }
            } else {
                isCorrectSoFar = false; // Input ends with high surrogate missing trail
                break;
            }
        }
        i++;
    }

    const percent =
        targetLength > 0 ? Math.min(100, Math.floor((inputLength / targetLength) * 100)) : 0;

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

    // Find how many normalized characters match without string spread
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        if (normalizedInput.charCodeAt(i) !== normalizedTarget.charCodeAt(i)) break;

        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                if (normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)) break;
                i++; // Skip low surrogate
            } else {
                break;
            }
        }

        matchedNormalizedCount++;
        i++;
    }

    // Count accurate input length for slice bounds
    let inputCharsLength = normalizedInput.length;
    for (let k = 0; k < normalizedInput.length - 1; k++) {
        const code = normalizedInput.charCodeAt(k);
        if (code >= 0xd800 && code <= 0xdbff) {
            inputCharsLength--;
            k++;
        }
    }

    // Count accurate target length for slice bounds
    let targetCharsLength = normalizedTarget.length;
    for (let k = 0; k < normalizedTarget.length - 1; k++) {
        const code = normalizedTarget.charCodeAt(k);
        if (code >= 0xd800 && code <= 0xdbff) {
            targetCharsLength--;
            k++;
        }
    }

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputCharsLength, targetCharsLength);

    // Map matchedNormalizedCount back to position in the original displayTarget
    let correctStr = '';
    let incorrectStr = '';
    let remainingStr = '';

    let charIdx = 0;
    let displayIdx = 0;

    while (displayIdx < displayTarget.length) {
        const code = displayTarget.charCodeAt(displayIdx);
        let len = 1;
        if (code >= 0xd800 && code <= 0xdbff && displayIdx + 1 < displayTarget.length) {
            len = 2;
        }

        const ch = displayTarget.substring(displayIdx, displayIdx + len);

        if (charIdx < correctEnd) {
            correctStr += ch;
        } else if (charIdx < inputEnd) {
            incorrectStr += ch;
        } else {
            remainingStr += ch;
        }

        charIdx++;
        displayIdx += len;
    }

    return { correct: correctStr, incorrect: incorrectStr, remaining: remainingStr };
};
