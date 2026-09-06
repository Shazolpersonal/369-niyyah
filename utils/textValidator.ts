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

    // ⚡ Bolt Optimization: Avoid O(N) array allocation from string spreading
    // Check if input is a valid prefix of target using native string methods
    let isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Count characters without spreading (to avoid O(N) allocation)
    let inputCharLen = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputCharLen++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    let targetCharLen = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetCharLen++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    // Calculate progress percentage
    const percent =
        targetCharLen > 0
            ? Math.min(100, Math.floor((inputCharLen / targetCharLen) * 100))
            : 0;

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && inputCharLen === targetCharLen;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength: inputCharLen,
        targetLength: targetCharLen,
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

    // ⚡ Bolt Optimization: Avoid O(N) array allocation from string spreading
    // Find how many normalized characters match
    let matchedNormalizedCount = 0;
    let i = 0;

    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const code1 = normalizedInput.charCodeAt(i);
        const code2 = normalizedTarget.charCodeAt(i);

        if (code1 !== code2) break;

        if (code1 >= 0xD800 && code1 <= 0xDBFF) {
            if (normalizedInput.charCodeAt(i + 1) === normalizedTarget.charCodeAt(i + 1)) {
                i++;
            } else {
                i--;
                break;
            }
        }
        matchedNormalizedCount++;
        i++;
    }

    let inputCharLen = 0;
    for (let k = 0; k < normalizedInput.length; k++) {
        inputCharLen++;
        const code = normalizedInput.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) k++;
    }

    let targetCharLen = 0;
    for (let k = 0; k < normalizedTarget.length; k++) {
        targetCharLen++;
        const code = normalizedTarget.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) k++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    const correctEndChar = matchedNormalizedCount;
    const inputEndChar = Math.min(inputCharLen, targetCharLen);

    let charCount = 0;
    let correctEndIndex = 0;
    let inputEndIndex = 0;

    for (let k = 0; k < displayTarget.length; k++) {
        if (charCount === correctEndChar) correctEndIndex = k;
        if (charCount === inputEndChar) inputEndIndex = k;

        charCount++;
        const code = displayTarget.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) k++;
    }

    if (charCount === correctEndChar) correctEndIndex = displayTarget.length;
    if (charCount === inputEndChar) inputEndIndex = displayTarget.length;

    const correct = displayTarget.substring(0, correctEndIndex);
    const incorrect = displayTarget.substring(correctEndIndex, inputEndIndex);
    const remaining = displayTarget.substring(inputEndIndex);

    return { correct, incorrect, remaining };
};
