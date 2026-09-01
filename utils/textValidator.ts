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
    // ⚡ Bolt Optimization: Replace O(N) array allocation [...str] with native startsWith
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        // ⚡ Bolt Optimization: explicit surrogate pair check avoids array spreading
        if (normalizedInput.charCodeAt(i) >= 0xd800 && normalizedInput.charCodeAt(i) <= 0xdbff) {
            i++;
        }
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        if (normalizedTarget.charCodeAt(i) >= 0xd800 && normalizedTarget.charCodeAt(i) <= 0xdbff) {
            i++;
        }
    }

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

    // ⚡ Bolt Optimization: Replace O(N) array allocations with charCodeAt while loop
    let matchedNormalizedCount = 0;
    let idx = 0;
    while (idx < normalizedInput.length) {
        if (
            idx >= normalizedTarget.length ||
            normalizedInput.charCodeAt(idx) !== normalizedTarget.charCodeAt(idx)
        ) {
            break;
        }
        // Explicitly handle surrogate pairs to match unicode behavior
        if (
            normalizedInput.charCodeAt(idx) >= 0xd800 &&
            normalizedInput.charCodeAt(idx) <= 0xdbff
        ) {
            idx++;
            if (normalizedInput.charCodeAt(idx) !== normalizedTarget.charCodeAt(idx)) {
                idx--;
                break;
            }
        }
        idx++;
        matchedNormalizedCount++;
    }

    let inputLen = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLen++;
        if (normalizedInput.charCodeAt(i) >= 0xd800 && normalizedInput.charCodeAt(i) <= 0xdbff) i++;
    }

    let targetLen = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLen++;
        if (normalizedTarget.charCodeAt(i) >= 0xd800 && normalizedTarget.charCodeAt(i) <= 0xdbff)
            i++;
    }

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLen, targetLen);

    let correctIdx = 0;
    let charCount = 0;
    while (charCount < correctEnd && correctIdx < displayTarget.length) {
        if (
            displayTarget.charCodeAt(correctIdx) >= 0xd800 &&
            displayTarget.charCodeAt(correctIdx) <= 0xdbff
        )
            correctIdx++;
        correctIdx++;
        charCount++;
    }

    let inputEndIdx = correctIdx;
    while (charCount < inputEnd && inputEndIdx < displayTarget.length) {
        if (
            displayTarget.charCodeAt(inputEndIdx) >= 0xd800 &&
            displayTarget.charCodeAt(inputEndIdx) <= 0xdbff
        )
            inputEndIdx++;
        inputEndIdx++;
        charCount++;
    }

    const correct = displayTarget.substring(0, correctIdx);
    const incorrect = displayTarget.substring(correctIdx, inputEndIdx);
    const remaining = displayTarget.substring(inputEndIdx);

    return { correct, incorrect, remaining };
};
