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

/**
 * Calculates the true Unicode character length of a string in O(1) memory
 * without O(N) array allocations.
 */
const getUnicodeLength = (str: string): number => {
    let len = str.length;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            len--;
            i++;
        }
    }
    return len;
};

export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    let isCorrectSoFar = true;
    let inputIndex = 0;
    let targetIndex = 0;

    const inputLength = getUnicodeLength(normalizedInput);
    const targetLength = getUnicodeLength(normalizedTarget);

    while (inputIndex < normalizedInput.length) {
        if (targetIndex >= normalizedTarget.length) {
            isCorrectSoFar = false;
            break;
        }

        const inputCode = normalizedInput.charCodeAt(inputIndex);
        const targetCode = normalizedTarget.charCodeAt(targetIndex);

        if (inputCode !== targetCode) {
            isCorrectSoFar = false;
            break;
        }

        if (inputCode >= 0xd800 && inputCode <= 0xdbff) {
            const nextInput = normalizedInput.charCodeAt(inputIndex + 1);
            const nextTarget = normalizedTarget.charCodeAt(targetIndex + 1);
            if (nextInput !== nextTarget) {
                isCorrectSoFar = false;
                break;
            }
            inputIndex += 2;
            targetIndex += 2;
        } else {
            inputIndex++;
            targetIndex++;
        }
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
    let inputIndex = 0;
    let targetIndex = 0;

    while (inputIndex < normalizedInput.length && targetIndex < normalizedTarget.length) {
        const inputCode = normalizedInput.charCodeAt(inputIndex);
        const targetCode = normalizedTarget.charCodeAt(targetIndex);

        if (inputCode !== targetCode) {
            break;
        }

        if (inputCode >= 0xd800 && inputCode <= 0xdbff) {
            const nextInput = normalizedInput.charCodeAt(inputIndex + 1);
            const nextTarget = normalizedTarget.charCodeAt(targetIndex + 1);
            if (nextInput !== nextTarget) {
                break;
            }
            inputIndex += 2;
            targetIndex += 2;
        } else {
            inputIndex++;
            targetIndex++;
        }
        matchedNormalizedCount++;
    }

    const inputCharsLength = getUnicodeLength(normalizedInput);
    const targetCharsLength = getUnicodeLength(normalizedTarget);

    const correctEndCharCount = matchedNormalizedCount;
    const inputEndCharCount = Math.min(inputCharsLength, targetCharsLength);

    // Helper to map character count back to string index safely
    const getStringIndex = (str: string, charCount: number): number => {
        let index = 0;
        let count = 0;
        while (count < charCount && index < str.length) {
            const code = str.charCodeAt(index);
            if (code >= 0xd800 && code <= 0xdbff) {
                index += 2;
            } else {
                index++;
            }
            count++;
        }
        return index;
    };

    const correctEndStrIndex = getStringIndex(displayTarget, correctEndCharCount);
    const inputEndStrIndex = getStringIndex(displayTarget, inputEndCharCount);

    const correct = displayTarget.substring(0, correctEndStrIndex);
    const incorrect = displayTarget.substring(correctEndStrIndex, inputEndStrIndex);
    const remaining = displayTarget.substring(inputEndStrIndex);

    return { correct, incorrect, remaining };
};
