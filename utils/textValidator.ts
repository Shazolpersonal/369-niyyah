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

    // ⚡ Bolt Optimization: Use startsWith instead of array spreading [...str]
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    let inputLength = 0;
    let i = 0;
    while (i < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(i);
        i += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        inputLength++;
    }

    let targetLength = 0;
    i = 0;
    while (i < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(i);
        i += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        targetLength++;
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

    // Find how many normalized characters match
    let matchedNormalizedCount = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const codeI = normalizedInput.charCodeAt(i);
        const step = (codeI >= 0xD800 && codeI <= 0xDBFF) ? 2 : 1;

        if (normalizedInput.substring(i, i + step) !== normalizedTarget.substring(i, i + step)) {
            break;
        }

        i += step;
        matchedNormalizedCount++;
    }

    let inputCharsLength = 0;
    let idx = 0;
    while (idx < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(idx);
        idx += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        inputCharsLength++;
    }

    let targetCharsLength = 0;
    idx = 0;
    while (idx < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(idx);
        idx += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        targetCharsLength++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputCharsLength, targetCharsLength);

    let correctCodeUnitIdx = 0;
    let charCount = 0;
    while (correctCodeUnitIdx < displayTarget.length && charCount < correctEnd) {
        const code = displayTarget.charCodeAt(correctCodeUnitIdx);
        correctCodeUnitIdx += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        charCount++;
    }

    let inputEndCodeUnitIdx = correctCodeUnitIdx;
    while (inputEndCodeUnitIdx < displayTarget.length && charCount < inputEnd) {
        const code = displayTarget.charCodeAt(inputEndCodeUnitIdx);
        inputEndCodeUnitIdx += (code >= 0xD800 && code <= 0xDBFF) ? 2 : 1;
        charCount++;
    }

    const correct = displayTarget.substring(0, correctCodeUnitIdx);
    const incorrect = displayTarget.substring(correctCodeUnitIdx, inputEndCodeUnitIdx);
    const remaining = displayTarget.substring(inputEndCodeUnitIdx);

    return { correct, incorrect, remaining };
};
