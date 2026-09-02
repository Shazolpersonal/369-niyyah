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

    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++; // Skip low surrogate
    }

    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        const inCode = normalizedInput.charCodeAt(i);

        if (isCorrectSoFar) {
            if (i >= normalizedTarget.length || inCode !== normalizedTarget.charCodeAt(i)) {
                isCorrectSoFar = false;
            }
        }

        if (inCode >= 0xd800 && inCode <= 0xdbff) {
            if (
                isCorrectSoFar &&
                normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)
            ) {
                isCorrectSoFar = false;
            }
            i++; // Skip low surrogate
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

    // Find how many normalized characters match without string spreading
    let matchedNormalizedCount = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        if (
            i >= normalizedTarget.length ||
            normalizedInput.charCodeAt(i) !== normalizedTarget.charCodeAt(i)
        ) {
            break;
        }
        matchedNormalizedCount++;

        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            if (normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(i + 1)) {
                matchedNormalizedCount--; // Rollback if lead surrogate matches but trail surrogate differs
                break;
            }
            i++; // Skip low surrogate
        }
    }

    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
    }

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLength, targetLength);

    let displayIdx = 0;
    let charCount = 0;
    let correctIdx = 0;

    // Find the correct and input end indices in the original displayTarget
    while (displayIdx < displayTarget.length && charCount < inputEnd) {
        if (charCount === correctEnd) correctIdx = displayIdx;

        const code = displayTarget.charCodeAt(displayIdx);
        if (code >= 0xd800 && code <= 0xdbff) displayIdx++;
        displayIdx++;
        charCount++;
    }

    if (charCount === correctEnd) correctIdx = displayIdx;
    const inputEndIdx = displayIdx;

    const correct = displayTarget.substring(0, correctIdx);
    const incorrect = displayTarget.substring(correctIdx, inputEndIdx);
    const remaining = displayTarget.substring(inputEndIdx);

    return { correct, incorrect, remaining };
};
