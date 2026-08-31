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
function countCharacters(str: string): number {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            i++;
        }
        count++;
    }
    return count;
}

export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    // native startsWith is heavily optimized in V8/JSC
    let isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Safety check: if matched but ends on a lead surrogate in the input,
    // ensure it's not a split pair mismatch.
    if (
        isCorrectSoFar &&
        normalizedInput.length > 0 &&
        normalizedInput.length < normalizedTarget.length
    ) {
        const lastChar = normalizedInput.charCodeAt(normalizedInput.length - 1);
        if (lastChar >= 0xd800 && lastChar <= 0xdbff) {
            isCorrectSoFar = false;
        }
    }

    const inputLength = countCharacters(normalizedInput);
    const targetLength = countCharacters(normalizedTarget);

    // Calculate progress percentage
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

    let matchCount = 0;
    const minLen = Math.min(normalizedInput.length, normalizedTarget.length);
    while (
        matchCount < minLen &&
        normalizedInput.charCodeAt(matchCount) === normalizedTarget.charCodeAt(matchCount)
    ) {
        matchCount++;
    }

    // Rollback if split surrogate at the end of match
    if (matchCount > 0 && matchCount < normalizedTarget.length) {
        const lastChar = normalizedInput.charCodeAt(matchCount - 1);
        if (lastChar >= 0xd800 && lastChar <= 0xdbff) {
            matchCount--;
        }
    }

    const correctEnd = matchCount;

    let charCount = 0;
    let inputLenChars = countCharacters(normalizedInput);
    let targetCharIndex = 0;

    while (targetCharIndex < normalizedTarget.length && charCount < inputLenChars) {
        const code = normalizedTarget.charCodeAt(targetCharIndex);
        if (code >= 0xd800 && code <= 0xdbff) {
            targetCharIndex += 2;
        } else {
            targetCharIndex += 1;
        }
        charCount++;
    }

    const inputEnd = targetCharIndex;

    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, inputEnd);
    const remaining = displayTarget.substring(inputEnd);

    return { correct, incorrect, remaining };
};
