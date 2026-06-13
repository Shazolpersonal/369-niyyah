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

    // ⚡ Bolt Optimization: Use fast native string methods instead of O(N) array spreading
    const isCorrectSoFar =
        normalizedInput.length > 0 ? normalizedTarget.startsWith(normalizedInput) : true;

    // Fast O(N) traversal without array allocation to count code points (handles Unicode emojis properly)
    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
        inputLength++;
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) i++;
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

    // ⚡ Bolt Optimization: Use fast native string methods instead of O(N) array spreading
    let matchUnitEnd = 0;
    let i = 0;
    while (i < normalizedInput.length && i < normalizedTarget.length) {
        const codeIn = normalizedInput.charCodeAt(i);
        const codeTgt = normalizedTarget.charCodeAt(i);
        if (codeIn !== codeTgt) break;
        i++;
        if (codeIn >= 0xd800 && codeIn <= 0xdbff) {
            if (
                i < normalizedInput.length &&
                i < normalizedTarget.length &&
                normalizedInput.charCodeAt(i) === normalizedTarget.charCodeAt(i)
            ) {
                i++;
            } else {
                break;
            }
        }
        matchUnitEnd = i;
    }

    // Count code points in input to determine how much of target should be considered "incorrect"
    let inputCodePoints = 0;
    for (let j = 0; j < normalizedInput.length; j++) {
        const code = normalizedInput.charCodeAt(j);
        if (code >= 0xd800 && code <= 0xdbff) j++;
        inputCodePoints++;
    }

    let targetCodePoints = 0;
    let inputUnitEnd = 0;
    while (inputUnitEnd < displayTarget.length && targetCodePoints < inputCodePoints) {
        const code = displayTarget.charCodeAt(inputUnitEnd);
        inputUnitEnd++;
        if (code >= 0xd800 && code <= 0xdbff) inputUnitEnd++;
        targetCodePoints++;
    }

    const correct = displayTarget.substring(0, matchUnitEnd);
    const incorrect = displayTarget.substring(matchUnitEnd, inputUnitEnd);
    const remaining = displayTarget.substring(inputUnitEnd);

    return { correct, incorrect, remaining };
};
