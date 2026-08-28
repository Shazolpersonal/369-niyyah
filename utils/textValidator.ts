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

    // ⚡ Bolt Optimization: Use fast native string methods instead of O(N) array allocation via spreading [...str]
    let i = 0;
    let inputLen = 0;
    let targetLen = 0;

    while (i < normalizedInput.length) {
        // Skip trailing surrogate if part of surrogate pair
        if (normalizedInput.charCodeAt(i) >= 0xD800 && normalizedInput.charCodeAt(i) <= 0xDBFF) {
            if (i >= normalizedTarget.length || normalizedInput.substring(i, i + 2) !== normalizedTarget.substring(i, i + 2)) {
                isCorrectSoFar = false;
                break;
            }
            i += 2;
        } else {
            if (i >= normalizedTarget.length || normalizedInput[i] !== normalizedTarget[i]) {
                isCorrectSoFar = false;
                break;
            }
            i++;
        }
    }

    // Measure correct code point lengths instead of code unit lengths
    let j = 0;
    while (j < normalizedInput.length) {
        if (normalizedInput.charCodeAt(j) >= 0xD800 && normalizedInput.charCodeAt(j) <= 0xDBFF) {
            j += 2;
        } else {
            j++;
        }
        inputLen++;
    }

    let k = 0;
    while (k < normalizedTarget.length) {
        if (normalizedTarget.charCodeAt(k) >= 0xD800 && normalizedTarget.charCodeAt(k) <= 0xDBFF) {
            k += 2;
        } else {
            k++;
        }
        targetLen++;
    }

    // Calculate progress percentage
    const percent =
        targetLen > 0
            ? Math.min(100, Math.floor((inputLen / targetLen) * 100))
            : 0;

    // Complete match requires correct prefix AND same length
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


    // ⚡ Bolt Optimization: Use fast native string comparison over O(N) array allocation via spreading [...str]
    // Crucially, we must return character slices safely. We map matched code points back to their actual code unit indices.
    let matchedCodeUnitIndex = 0; // Where the correct match ends in code units
    let inputCodeUnitIndex = 0;   // Where the input ends in code units inside the target

    let i = 0; // Input code unit index
    let j = 0; // Target code unit index
    let isCorrectSoFar = true;

    while (i < normalizedInput.length && j < normalizedTarget.length) {
        let inLen = 1;
        let tarLen = 1;

        if (normalizedInput.charCodeAt(i) >= 0xD800 && normalizedInput.charCodeAt(i) <= 0xDBFF && i + 1 < normalizedInput.length) {
            inLen = 2;
        }
        if (normalizedTarget.charCodeAt(j) >= 0xD800 && normalizedTarget.charCodeAt(j) <= 0xDBFF && j + 1 < normalizedTarget.length) {
            tarLen = 2;
        }

        if (normalizedInput.substring(i, i + inLen) !== normalizedTarget.substring(j, j + tarLen)) {
            break;
        }

        i += inLen;
        j += tarLen;
        matchedCodeUnitIndex = j;
    }

    // Now figure out the code unit index where the input length ends in the target
    let k = 0; // index in input
    inputCodeUnitIndex = 0; // index in target
    while (k < normalizedInput.length && inputCodeUnitIndex < normalizedTarget.length) {
        let inLen = 1;
        let tarLen = 1;

        if (normalizedInput.charCodeAt(k) >= 0xD800 && normalizedInput.charCodeAt(k) <= 0xDBFF && k + 1 < normalizedInput.length) {
            inLen = 2;
        }
        if (normalizedTarget.charCodeAt(inputCodeUnitIndex) >= 0xD800 && normalizedTarget.charCodeAt(inputCodeUnitIndex) <= 0xDBFF && inputCodeUnitIndex + 1 < normalizedTarget.length) {
            tarLen = 2;
        }
        k += inLen;
        inputCodeUnitIndex += tarLen;
    }

    // Map the code unit indices directly to the display string
    // This is safe because normalizedTarget and displayTarget have the exact same characters in the exact same positions
    const correct = displayTarget.substring(0, matchedCodeUnitIndex);
    const incorrect = displayTarget.substring(matchedCodeUnitIndex, inputCodeUnitIndex);
    const remaining = displayTarget.substring(inputCodeUnitIndex);

    return { correct, incorrect, remaining };
};
