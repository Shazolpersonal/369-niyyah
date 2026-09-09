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

    // ⚡ Bolt Optimization: Replace O(N) [...string] spread allocations with manual while loops
    // using charCodeAt to safely navigate surrogate pairs without GC overhead in hot typing paths.
    let i = 0;
    let inputLen = 0;
    while (i < normalizedInput.length) {
        if (isCorrectSoFar) {
            if (i >= normalizedTarget.length || normalizedInput[i] !== normalizedTarget[i]) {
                isCorrectSoFar = false;
            }
        }

        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            if (isCorrectSoFar) {
                if (i + 1 >= normalizedTarget.length || normalizedInput[i + 1] !== normalizedTarget[i + 1]) {
                    isCorrectSoFar = false;
                }
            }
            i += 2;
        } else {
            i++;
        }
        inputLen++;
    }

    let targetLen = 0;
    let j = 0;
    while (j < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(j);
        if (code >= 0xD800 && code <= 0xDBFF) {
            j += 2;
        } else {
            j++;
        }
        targetLen++;
    }

    const percent = targetLen > 0
        ? Math.min(100, Math.floor((inputLen / targetLen) * 100))
        : 0;

    const isCompleteMatch = isCorrectSoFar && inputLen === targetLen;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength: inputLen,
        targetLength: targetLen,
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

    // ⚡ Bolt Optimization: Avoid O(N) array allocation via [...string] spread
    // by using a manual while loop that checks code units.
    let matchedNormalizedCount = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        if (normalizedInput[i] !== normalizedTarget[i]) {
            break;
        }
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                 if (normalizedInput[i+1] !== normalizedTarget[i+1]) {
                     break;
                 }
                 i += 2;
            } else {
                break;
            }
        } else {
            i++;
        }
        matchedNormalizedCount++;
    }

    // Since matchedNormalizedCount maps to actual character count
    // we need to translate that back into a code unit offset for string.slice
    let correctEnd = 0;
    let charsSeen = 0;
    while (correctEnd < displayTarget.length && charsSeen < matchedNormalizedCount) {
        const code = displayTarget.charCodeAt(correctEnd);
        if (code >= 0xD800 && code <= 0xDBFF) {
             correctEnd += 2;
        } else {
             correctEnd++;
        }
        charsSeen++;
    }

    let inputLen = 0;
    let k = 0;
    while (k < normalizedInput.length) {
         const code = normalizedInput.charCodeAt(k);
         if (code >= 0xD800 && code <= 0xDBFF) k += 2;
         else k++;
         inputLen++;
    }

    let targetLen = 0;
    let m = 0;
    while (m < normalizedTarget.length) {
         const code = normalizedTarget.charCodeAt(m);
         if (code >= 0xD800 && code <= 0xDBFF) m += 2;
         else m++;
         targetLen++;
    }

    let inputEnd = correctEnd;
    let remainingChars = Math.min(inputLen, targetLen) - matchedNormalizedCount;
    while (inputEnd < displayTarget.length && remainingChars > 0) {
         const code = displayTarget.charCodeAt(inputEnd);
         if (code >= 0xD800 && code <= 0xDBFF) inputEnd += 2;
         else inputEnd++;
         remainingChars--;
    }

    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, inputEnd);
    const remaining = displayTarget.substring(inputEnd);

    return { correct, incorrect, remaining };
};
