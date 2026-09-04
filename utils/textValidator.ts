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

    // Check if input is a valid prefix of target using native startsWith (faster than spreading)
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Calculate code points manually to avoid O(N) array allocation from spreading
    let inputLength = 0;
    let i = 0;
    while (i < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(i);
        // Skip trail surrogate
        if (code >= 0xD800 && code <= 0xDBFF) i++;
        inputLength++;
        i++;
    }

    let targetLength = 0;
    i = 0;
    while (i < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(i);
        // Skip trail surrogate
        if (code >= 0xD800 && code <= 0xDBFF) i++;
        targetLength++;
        i++;
    }

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

    let matchedCodePoints = 0;
    let i = 0;
    let j = 0;

    // Find how many normalized characters match without spreading
    while (i < normalizedInput.length && j < normalizedTarget.length) {
        const charInput = normalizedInput.charCodeAt(i);
        const charTarget = normalizedTarget.charCodeAt(j);

        if (charInput !== charTarget) {
            break;
        }

        // Handle Unicode surrogate pairs
        if (charInput >= 0xD800 && charInput <= 0xDBFF) {
            if (i + 1 < normalizedInput.length && j + 1 < normalizedTarget.length) {
                if (normalizedInput.charCodeAt(i + 1) === normalizedTarget.charCodeAt(j + 1)) {
                    i++;
                    j++;
                } else {
                    // Match failed on the trail surrogate
                    break;
                }
            } else {
                break;
            }
        }

        matchedCodePoints++;
        i++;
        j++;
    }

    // Calculate total input length (code points) continuing from matched index
    let inputLength = matchedCodePoints;
    let tempI = i;
    while (tempI < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(tempI);
        if (code >= 0xD800 && code <= 0xDBFF) tempI++;
        inputLength++;
        tempI++;
    }

    // Calculate total target length (code points) continuing from matched index
    let targetLength = matchedCodePoints;
    let tempJ = j;
    while (tempJ < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(tempJ);
        if (code >= 0xD800 && code <= 0xDBFF) tempJ++;
        targetLength++;
        tempJ++;
    }

    const correctEnd = matchedCodePoints;
    const inputEnd = Math.min(inputLength, targetLength);

    // Map code point counts to string indices in displayTarget without spreading
    let cpCount = 0;
    let idx = 0;

    let startIndex = 0;
    while (idx < displayTarget.length && cpCount < correctEnd) {
        const code = displayTarget.charCodeAt(idx);
        if (code >= 0xD800 && code <= 0xDBFF) idx++;
        cpCount++;
        idx++;
    }
    const correctStr = displayTarget.substring(0, idx);
    startIndex = idx;

    while (idx < displayTarget.length && cpCount < inputEnd) {
        const code = displayTarget.charCodeAt(idx);
        if (code >= 0xD800 && code <= 0xDBFF) idx++;
        cpCount++;
        idx++;
    }
    const incorrectStr = displayTarget.substring(startIndex, idx);
    const remainingStr = displayTarget.substring(idx);

    return { correct: correctStr, incorrect: incorrectStr, remaining: remainingStr };
};
