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

    // ⚡ Bolt Optimization: Use startsWith for O(1) prefix check without allocations
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // ⚡ Bolt Optimization: Calculate lengths by safely traversing Unicode surrogates
    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        if (normalizedInput.charCodeAt(i) >= 0xD800 && normalizedInput.charCodeAt(i) <= 0xDBFF) i++;
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        if (normalizedTarget.charCodeAt(i) >= 0xD800 && normalizedTarget.charCodeAt(i) <= 0xDBFF) i++;
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

    // ⚡ Bolt Optimization: Find match without O(N) array allocations
    let matchIndex = 0;
    while (matchIndex < normalizedInput.length && matchIndex < normalizedTarget.length) {
        const codeIn = normalizedInput.charCodeAt(matchIndex);
        const codeTarget = normalizedTarget.charCodeAt(matchIndex);
        if (codeIn !== codeTarget) break;

        if (codeIn >= 0xD800 && codeIn <= 0xDBFF) {
            const lowIn = normalizedInput.charCodeAt(matchIndex + 1);
            const lowTarget = normalizedTarget.charCodeAt(matchIndex + 1);
            if (lowIn !== lowTarget) break;
            matchIndex += 2;
        } else {
            matchIndex++;
        }
    }

    // Calculate total characters in input correctly resolving unicode surrogates
    let inputCharsCount = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputCharsCount++;
        if (normalizedInput.charCodeAt(i) >= 0xD800 && normalizedInput.charCodeAt(i) <= 0xDBFF) i++;
    }

    let inputEndIndex = 0;
    let charCount = 0;
    while (charCount < inputCharsCount && inputEndIndex < displayTarget.length) {
        charCount++;
        if (displayTarget.charCodeAt(inputEndIndex) >= 0xD800 && displayTarget.charCodeAt(inputEndIndex) <= 0xDBFF) {
            inputEndIndex += 2;
        } else {
            inputEndIndex++;
        }
    }

    const correct = displayTarget.substring(0, matchIndex);
    const incorrect = displayTarget.substring(matchIndex, inputEndIndex);
    const remaining = displayTarget.substring(inputEndIndex);

    return { correct, incorrect, remaining };
};
