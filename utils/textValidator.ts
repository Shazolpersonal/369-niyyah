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
    let inputLength = normalizedInput.length;
    let targetLength = normalizedTarget.length;

    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        let code1 = normalizedInput.charCodeAt(i);
        let code2 = normalizedTarget.charCodeAt(i);

        if (code1 !== code2) {
            isCorrectSoFar = false;
            break;
        }

        if (code1 >= 0xd800 && code1 <= 0xdbff) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                let low1 = normalizedInput.charCodeAt(i + 1);
                let low2 = normalizedTarget.charCodeAt(i + 1);
                if (low1 !== low2) {
                    isCorrectSoFar = false;
                    break;
                }
                i++; // Advance over low surrogate
                inputLength--;
                targetLength--;
            } else {
                isCorrectSoFar = false;
                break;
            }
        }
        i++;
    }

    if (i < normalizedInput.length) {
        isCorrectSoFar = false;
    }

    for (let k = i; k < normalizedInput.length; k++) {
        let code = normalizedInput.charCodeAt(k);
        if (code >= 0xd800 && code <= 0xdbff) {
            inputLength--;
            k++;
        }
    }

    for (let k = i; k < normalizedTarget.length; k++) {
        let code = normalizedTarget.charCodeAt(k);
        if (code >= 0xd800 && code <= 0xdbff) {
            targetLength--;
            k++;
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

    let inputIdx = 0;
    let targetIdx = 0;
    let matchCount = 0;

    while (inputIdx < normalizedInput.length && targetIdx < normalizedTarget.length) {
        let code1 = normalizedInput.charCodeAt(inputIdx);
        let code2 = normalizedTarget.charCodeAt(targetIdx);

        if (code1 !== code2) break;

        if (code1 >= 0xd800 && code1 <= 0xdbff) {
            if (inputIdx + 1 < normalizedInput.length && targetIdx + 1 < normalizedTarget.length) {
                let low1 = normalizedInput.charCodeAt(inputIdx + 1);
                let low2 = normalizedTarget.charCodeAt(targetIdx + 1);
                if (low1 !== low2) break;
                inputIdx++;
                targetIdx++;
            } else {
                break;
            }
        }
        matchCount++;
        inputIdx++;
        targetIdx++;
    }

    let inputCharsLen = normalizedInput.length;
    for (let i = 0; i < normalizedInput.length; i++) {
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            inputCharsLen--;
            i++;
        }
    }

    let targetCharsLen = normalizedTarget.length;
    for (let i = 0; i < normalizedTarget.length; i++) {
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            targetCharsLen--;
            i++;
        }
    }

    const inputEndChars = Math.min(inputCharsLen, targetCharsLen);

    let charIdx = 0;
    let codeUnitIdx = 0;
    let correctEndUnitIdx = -1;
    let inputEndUnitIdx = -1;

    while (codeUnitIdx < displayTarget.length) {
        if (charIdx === matchCount) correctEndUnitIdx = codeUnitIdx;
        if (charIdx === inputEndChars) {
            inputEndUnitIdx = codeUnitIdx;
            break;
        }
        let c = displayTarget.charCodeAt(codeUnitIdx);
        if (c >= 0xd800 && c <= 0xdbff) codeUnitIdx++;
        codeUnitIdx++;
        charIdx++;
    }

    if (correctEndUnitIdx === -1) correctEndUnitIdx = displayTarget.length;
    if (inputEndUnitIdx === -1) inputEndUnitIdx = displayTarget.length;

    const correct = displayTarget.substring(0, correctEndUnitIdx);
    const incorrect = displayTarget.substring(correctEndUnitIdx, inputEndUnitIdx);
    const remaining = displayTarget.substring(inputEndUnitIdx);

    return { correct, incorrect, remaining };
};
