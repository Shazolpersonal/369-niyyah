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

    // Check if input is a valid prefix of target using native fast string methods
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

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

    let matchEndUnit = 0;
    let inputEndUnit = 0;
    let isMatching = true;

    let i = 0; // index for normalizedInput
    let j = 0; // index for normalizedTarget (and displayTarget)

    while (j < normalizedTarget.length && i < normalizedInput.length) {
        const charI = normalizedInput.charCodeAt(i);
        const charJ = normalizedTarget.charCodeAt(j);

        const isSurrogateI = charI >= 0xd800 && charI <= 0xdbff;
        const isSurrogateJ = charJ >= 0xd800 && charJ <= 0xdbff;

        if (isMatching) {
            if (charI !== charJ || isSurrogateI !== isSurrogateJ) {
                isMatching = false;
            } else if (isSurrogateI) {
                if (normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(j + 1)) {
                    isMatching = false;
                } else {
                    matchEndUnit = j + 2;
                }
            } else {
                matchEndUnit = j + 1;
            }
        }

        i += isSurrogateI ? 2 : 1;
        j += isSurrogateJ ? 2 : 1;
        inputEndUnit = j;
    }

    const correct = displayTarget.substring(0, matchEndUnit);
    const incorrect = displayTarget.substring(matchEndUnit, inputEndUnit);
    const remaining = displayTarget.substring(inputEndUnit);

    return { correct, incorrect, remaining };
};
