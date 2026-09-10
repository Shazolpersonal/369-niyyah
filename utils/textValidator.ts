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
    let isCorrectSoFar = true;
    let inputLength = 0;
    let targetLength = 0;
    let i = 0;
    let j = 0;

    // Count visual length of target (handling surrogate pairs)
    for (let k = 0; k < normalizedTarget.length; k++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) {
            k++; // Skip low surrogate
        }
    }

    while (i < normalizedInput.length) {
        inputLength++;
        const inputCode = normalizedInput.charCodeAt(i);
        const isSurrogate = inputCode >= 0xD800 && inputCode <= 0xDBFF;

        if (isCorrectSoFar) {
            if (j >= normalizedTarget.length) {
                isCorrectSoFar = false;
            } else {
                const targetCode = normalizedTarget.charCodeAt(j);
                if (inputCode !== targetCode) {
                    isCorrectSoFar = false;
                } else if (isSurrogate) {
                    const inputLow = normalizedInput.charCodeAt(i + 1);
                    const targetLow = normalizedTarget.charCodeAt(j + 1);
                    if (inputLow !== targetLow) {
                        isCorrectSoFar = false;
                    }
                }
            }
        }

        i += isSurrogate ? 2 : 1;
        if (j < normalizedTarget.length) {
            const targetCode = normalizedTarget.charCodeAt(j);
            j += (targetCode >= 0xD800 && targetCode <= 0xDBFF) ? 2 : 1;
        }
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
    let inputLength = 0;
    let targetLength = 0;
    let i = 0;
    let j = 0;

    for (let k = 0; k < normalizedTarget.length; k++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) k++;
    }

    let isMatching = true;
    while (i < normalizedInput.length) {
        inputLength++;
        const inputCode = normalizedInput.charCodeAt(i);
        const isSurrogate = inputCode >= 0xD800 && inputCode <= 0xDBFF;

        if (isMatching && j < normalizedTarget.length) {
            const targetCode = normalizedTarget.charCodeAt(j);
            if (inputCode === targetCode) {
                if (isSurrogate) {
                    const inputLow = normalizedInput.charCodeAt(i + 1);
                    const targetLow = normalizedTarget.charCodeAt(j + 1);
                    if (inputLow === targetLow) {
                        matchedNormalizedCount++;
                    } else {
                        isMatching = false;
                    }
                } else {
                    matchedNormalizedCount++;
                }
            } else {
                isMatching = false;
            }
        }

        i += isSurrogate ? 2 : 1;
        if (j < normalizedTarget.length) {
            const targetCode = normalizedTarget.charCodeAt(j);
            j += (targetCode >= 0xD800 && targetCode <= 0xDBFF) ? 2 : 1;
        }
    }

    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLength, targetLength);

    let correct = '';
    let incorrect = '';
    let remaining = '';
    let displayIndex = 0;
    let visualCount = 0;

    while (displayIndex < displayTarget.length) {
        let charStr = displayTarget[displayIndex];
        const code = displayTarget.charCodeAt(displayIndex);

        if (code >= 0xD800 && code <= 0xDBFF) {
            if (displayIndex + 1 < displayTarget.length) {
                charStr += displayTarget[displayIndex + 1];
                displayIndex++;
            }
        }
        displayIndex++;

        if (visualCount < correctEnd) {
            correct += charStr;
        } else if (visualCount < inputEnd) {
            incorrect += charStr;
        } else {
            remaining += charStr;
        }
        visualCount++;
    }

    return { correct, incorrect, remaining };
};
