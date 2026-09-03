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

    // Check if input is a valid prefix of target natively - avoids character by character loop
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Get input length in characters (handling surrogate pairs) without allocating an array
    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++; // skip low surrogate
    }

    // Get target length in characters (handling surrogate pairs) without allocating an array
    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++; // skip low surrogate
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

    let matchedNormalizedCount = 0;
    let index = 0;

    // Instead of allocating [...str] to check matches, we iterate character codes to find the match length.
    while (index < normalizedInput.length && index < normalizedTarget.length) {
        if (normalizedInput.charCodeAt(index) === normalizedTarget.charCodeAt(index)) {
            const isSurrogate = normalizedInput.charCodeAt(index) >= 0xD800 && normalizedInput.charCodeAt(index) <= 0xDBFF;
            matchedNormalizedCount++;
            index++;

            // If it's a high surrogate, verify the low surrogate matches too.
            // If it doesn't, we must rollback the match because the full complex character didn't match.
            if (isSurrogate) {
                 if (index < normalizedInput.length && index < normalizedTarget.length &&
                     normalizedInput.charCodeAt(index) === normalizedTarget.charCodeAt(index)) {
                     index++;
                 } else {
                     matchedNormalizedCount--;
                     index--;
                     break;
                 }
            }
        } else {
            break;
        }
    }

    // Calculate actual array-equivalent length without [...str] allocation
    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        if (normalizedInput.charCodeAt(i) >= 0xD800 && normalizedInput.charCodeAt(i) <= 0xDBFF) i++;
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        if (normalizedTarget.charCodeAt(i) >= 0xD800 && normalizedTarget.charCodeAt(i) <= 0xDBFF) i++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLength, targetLength);

    const displayChars = [...displayTarget];
    const correct = displayChars.slice(0, correctEnd).join('');
    const incorrect = displayChars.slice(correctEnd, inputEnd).join('');
    const remaining = displayChars.slice(inputEnd).join('');

    return { correct, incorrect, remaining };
};
