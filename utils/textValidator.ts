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
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    let inputLength = 0;
    let idx = 0;
    while (idx < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(idx);
        idx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        inputLength++;
    }

    let targetLength = 0;
    idx = 0;
    while (idx < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(idx);
        idx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        targetLength++;
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

    let matchedNormalizedCount = 0;
    let inputIdx = 0;
    let targetIdx = 0;

    while (inputIdx < normalizedInput.length && targetIdx < normalizedTarget.length) {
        const inputCode = normalizedInput.charCodeAt(inputIdx);
        const inputCharLen = inputCode >= 0xd800 && inputCode <= 0xdbff ? 2 : 1;
        const inputChar = normalizedInput.substring(inputIdx, inputIdx + inputCharLen);

        const targetCode = normalizedTarget.charCodeAt(targetIdx);
        const targetCharLen = targetCode >= 0xd800 && targetCode <= 0xdbff ? 2 : 1;
        const targetChar = normalizedTarget.substring(targetIdx, targetIdx + targetCharLen);

        if (inputChar !== targetChar) {
            break;
        }

        matchedNormalizedCount++;
        inputIdx += inputCharLen;
        targetIdx += targetCharLen;
    }

    let inputLogicalLength = 0;
    let tempIdx = 0;
    while (tempIdx < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(tempIdx);
        tempIdx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        inputLogicalLength++;
    }

    let targetLogicalLength = 0;
    tempIdx = 0;
    while (tempIdx < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(tempIdx);
        tempIdx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        targetLogicalLength++;
    }

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLogicalLength, targetLogicalLength);

    let displayIdx = 0;
    let logicalCount = 0;
    let correctStrIdx = displayTarget.length;
    let inputStrIdx = displayTarget.length;

    while (displayIdx < displayTarget.length) {
        if (logicalCount === correctEnd) correctStrIdx = displayIdx;
        if (logicalCount === inputEnd) inputStrIdx = displayIdx;

        const code = displayTarget.charCodeAt(displayIdx);
        displayIdx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        logicalCount++;
    }
    if (logicalCount === correctEnd) correctStrIdx = displayTarget.length;
    if (logicalCount === inputEnd) inputStrIdx = displayTarget.length;

    const correct = displayTarget.substring(0, correctStrIdx);
    const incorrect = displayTarget.substring(correctStrIdx, inputStrIdx);
    const remaining = displayTarget.substring(inputStrIdx);

    return { correct, incorrect, remaining };
};
