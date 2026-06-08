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

    // Count true unicode characters (code points) without array allocation
    let inputLen = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLen++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++; // Skip low surrogate
    }

    let targetLen = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLen++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++; // Skip low surrogate
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

    let matchedCodeUnits = 0;
    let i = 0;

    // Find correct matches (in code units to map to displayTarget correctly)
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        if (normalizedInput.charCodeAt(i) !== normalizedTarget.charCodeAt(i)) {
            break;
        }

        const code = normalizedInput.charCodeAt(i);
        // If it's a high surrogate, we must also check the low surrogate to count it as a match
        if (code >= 0xD800 && code <= 0xDBFF) {
            if (i + 1 < normalizedInput.length && i + 1 < normalizedTarget.length) {
                if (normalizedInput.charCodeAt(i + 1) === normalizedTarget.charCodeAt(i + 1)) {
                    matchedCodeUnits += 2;
                    i += 2;
                    continue;
                } else {
                    break; // High surrogate matched, but low surrogate mismatched
                }
            } else {
                break; // Incomplete surrogate pair
            }
        }

        matchedCodeUnits++;
        i++;
    }

    // Determine how many actual characters (code points) the user has typed
    let inputCodePoints = 0;
    for (let k = 0; k < normalizedInput.length; k++) {
        inputCodePoints++;
        const code = normalizedInput.charCodeAt(k);
        if (code >= 0xD800 && code <= 0xDBFF) k++; // Skip low surrogate
    }

    // Now advance inputEnd through displayTarget until we have passed 'inputCodePoints' characters
    // OR we reach the end of the target string.
    let inputEnd = 0;
    let count = 0;
    while (count < inputCodePoints && inputEnd < displayTarget.length) {
        count++;
        const code = displayTarget.charCodeAt(inputEnd);
        inputEnd++;
        if (code >= 0xD800 && code <= 0xDBFF && inputEnd < displayTarget.length) {
            inputEnd++; // Skip low surrogate
        }
    }

    const correctEnd = matchedCodeUnits;

    // Safety check: if inputEnd < correctEnd (rare edge case of length mismatch due to case/punctuation), bound it
    const actualInputEnd = Math.max(inputEnd, correctEnd);

    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, actualInputEnd);
    const remaining = displayTarget.substring(actualInputEnd);

    return { correct, incorrect, remaining };
};
