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
function getUnicodeLength(str: string): number {
    let len = str.length;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            len--;
            i++; // skip low surrogate
        }
    }
    return len;
}

export const getValidationInfo = (input: string, target: string): ValidationInfo => {
    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(target);

    let isCorrectSoFar = true;
    let i = 0;

    while (i < normalizedInput.length) {
        if (i >= normalizedTarget.length) {
            isCorrectSoFar = false;
            break;
        }

        const code1 = normalizedInput.charCodeAt(i);
        const code2 = normalizedTarget.charCodeAt(i);

        if (code1 !== code2) {
            isCorrectSoFar = false;
            break;
        }

        if (code1 >= 0xD800 && code1 <= 0xDBFF) {
            const low1 = normalizedInput.charCodeAt(i + 1);
            const low2 = normalizedTarget.charCodeAt(i + 1);
            if (low1 !== low2) {
                isCorrectSoFar = false;
                break;
            }
            i += 2;
        } else {
            i++;
        }
    }

    const inputCharLen = getUnicodeLength(normalizedInput);
    const targetCharLen = getUnicodeLength(normalizedTarget);

    const percent =
        targetCharLen > 0
            ? Math.min(100, Math.floor((inputCharLen / targetCharLen) * 100))
            : 0;

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

    let i = 0;
    while (i < normalizedInput.length) {
        if (i >= normalizedTarget.length) {
            break;
        }

        const code1 = normalizedInput.charCodeAt(i);
        const code2 = normalizedTarget.charCodeAt(i);

        if (code1 !== code2) {
            break;
        }

        if (code1 >= 0xD800 && code1 <= 0xDBFF) {
            const low1 = normalizedInput.charCodeAt(i + 1);
            const low2 = normalizedTarget.charCodeAt(i + 1);
            if (low1 !== low2) {
                break;
            }
            i += 2;
        } else {
            i++;
        }
    }

    const correctEnd = i;

    let j = i;
    let k = i;

    while (j < normalizedInput.length && k < displayTarget.length) {
        const codeIn = normalizedInput.charCodeAt(j);
        if (codeIn >= 0xD800 && codeIn <= 0xDBFF) {
            j += 2;
        } else {
            j++;
        }

        const codeT = displayTarget.charCodeAt(k);
        if (codeT >= 0xD800 && codeT <= 0xDBFF) {
            k += 2;
        } else {
            k++;
        }
    }

    const inputEnd = k;

    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, inputEnd);
    const remaining = displayTarget.substring(inputEnd);

    return { correct, incorrect, remaining };
};
