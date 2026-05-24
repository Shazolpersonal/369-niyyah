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
 * Helper to get the actual character length of a string, accounting for surrogate pairs (e.g., emojis).
 */
const getUnicodeLength = (str: string): number => {
    let chars = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) {
            i++; // Skip the low surrogate part of the pair
        }
        chars++;
    }
    return chars;
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

    // ⚡ Bolt Optimization: Use startsWith instead of array spreading and character-by-character comparison
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && normalizedInput.length === normalizedTarget.length;

    // We must use unicode length here to accurately calculate percentage for non-ASCII text
    const inputLength = getUnicodeLength(normalizedInput);
    const targetLength = getUnicodeLength(normalizedTarget);

    // Calculate progress percentage
    const percent = targetLength > 0
        ? Math.min(100, Math.floor((inputLength / targetLength) * 100))
        : 0;

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

    // ⚡ Bolt Optimization: Avoid array allocations via spread [...str] and use a simple index loop,
    // carefully checking surrogate pairs to prevent splitting them when finding match length.
    let i1 = 0;
    let i2 = 0;

    while (i1 < normalizedInput.length && i2 < normalizedTarget.length) {
        const c1 = normalizedInput.charCodeAt(i1);
        const c2 = normalizedTarget.charCodeAt(i2);

        if (c1 !== c2) break;

        if (c1 >= 0xD800 && c1 <= 0xDBFF) {
            // Check low surrogate
            if (i1 + 1 < normalizedInput.length && i2 + 1 < normalizedTarget.length) {
                if (normalizedInput.charCodeAt(i1 + 1) === normalizedTarget.charCodeAt(i2 + 1)) {
                    i1 += 2;
                    i2 += 2;
                    continue;
                }
            }
            break;
        }

        i1++;
        i2++;
    }

    // Now figure out how many Unicode characters remain in the input
    // to highlight as 'incorrect' in the target
    let incorrectCharsToConsume = 0;
    let tempI1 = i1;
    while (tempI1 < normalizedInput.length) {
        const c = normalizedInput.charCodeAt(tempI1);
        if (c >= 0xD800 && c <= 0xDBFF) tempI1 += 2;
        else tempI1++;
        incorrectCharsToConsume++;
    }

    // Slice that same number of Unicode characters from the target
    let targetSliceEnd = i2;
    while (incorrectCharsToConsume > 0 && targetSliceEnd < displayTarget.length) {
        const c = displayTarget.charCodeAt(targetSliceEnd);
        if (c >= 0xD800 && c <= 0xDBFF) targetSliceEnd += 2;
        else targetSliceEnd++;
        incorrectCharsToConsume--;
    }

    // ⚡ Bolt Optimization: Use substring instead of array mapping and joining
    const correctEnd = i2;
    const correct = displayTarget.substring(0, correctEnd);
    const incorrect = displayTarget.substring(correctEnd, targetSliceEnd);
    const remaining = displayTarget.substring(targetSliceEnd);

    return { correct, incorrect, remaining };
};
