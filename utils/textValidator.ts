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
    let inputLength = 0;
    let targetLength = 0;

    // Optimization: avoid O(N) array allocation from spreading strings
    let i = 0;
    while (i < normalizedTarget.length) {
        if (normalizedTarget.charCodeAt(i) >= 0xd800 && normalizedTarget.charCodeAt(i) <= 0xdbff)
            i++;
        targetLength++;
        i++;
    }

    i = 0;
    while (i < normalizedInput.length) {
        const inCode = normalizedInput.charCodeAt(i);
        const isSurrogate = inCode >= 0xd800 && inCode <= 0xdbff;

        if (isCorrectSoFar) {
            if (i >= normalizedTarget.length || inCode !== normalizedTarget.charCodeAt(i)) {
                isCorrectSoFar = false;
            } else if (isSurrogate) {
                if (
                    i + 1 >= normalizedTarget.length ||
                    normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)
                ) {
                    isCorrectSoFar = false;
                }
            }
        }

        inputLength++;
        i += isSurrogate ? 2 : 1;
    }

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
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const inCode = normalizedInput.charCodeAt(i);
        if (inCode !== normalizedTarget.charCodeAt(i)) {
            break;
        }

        const isSurrogate = inCode >= 0xd800 && inCode <= 0xdbff;
        if (isSurrogate) {
            if (
                i + 1 >= normalizedTarget.length ||
                normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)
            ) {
                break;
            }
        }

        matchedNormalizedCount++;
        i += isSurrogate ? 2 : 1;
    }

    let correctEndStrIndex = 0;
    let charsCount = 0;
    while (correctEndStrIndex < displayTarget.length && charsCount < matchedNormalizedCount) {
        if (
            displayTarget.charCodeAt(correctEndStrIndex) >= 0xd800 &&
            displayTarget.charCodeAt(correctEndStrIndex) <= 0xdbff
        )
            correctEndStrIndex++;
        correctEndStrIndex++;
        charsCount++;
    }

    let inputLogicalLength = 0;
    let j = 0;
    while (j < normalizedInput.length) {
        if (normalizedInput.charCodeAt(j) >= 0xd800 && normalizedInput.charCodeAt(j) <= 0xdbff) j++;
        j++;
        inputLogicalLength++;
    }

    let inputEndStrIndex = correctEndStrIndex;
    while (inputEndStrIndex < displayTarget.length && charsCount < inputLogicalLength) {
        if (
            displayTarget.charCodeAt(inputEndStrIndex) >= 0xd800 &&
            displayTarget.charCodeAt(inputEndStrIndex) <= 0xdbff
        )
            inputEndStrIndex++;
        inputEndStrIndex++;
        charsCount++;
    }

    const correct = displayTarget.substring(0, correctEndStrIndex);
    const incorrect = displayTarget.substring(correctEndStrIndex, inputEndStrIndex);
    const remaining = displayTarget.substring(inputEndStrIndex);

    return { correct, incorrect, remaining };
};
