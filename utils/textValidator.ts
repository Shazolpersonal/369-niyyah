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

    // ⚡ Bolt Optimization: Use native startsWith and manual while loops with charCodeAt
    // to avoid O(N) array allocations caused by string spreading [...str] in hot validation paths.
    // Explicitly handles Unicode surrogate pairs (e.g. emojis) for accurate length counts.
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

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

    // ⚡ Bolt Optimization: Replace [...str] spreading and array slicing with native string operations
    // and manual while loops using charCodeAt to avoid O(N) array allocations.
    // Handles Unicode surrogate pairs natively for accurate index mappings.
    let matchedCount = 0;
    let i = 0;
    let j = 0;

    while (i < normalizedInput.length && j < normalizedTarget.length) {
        const code1 = normalizedInput.charCodeAt(i);
        const code2 = normalizedTarget.charCodeAt(j);

        const len1 = code1 >= 0xd800 && code1 <= 0xdbff ? 2 : 1;
        const len2 = code2 >= 0xd800 && code2 <= 0xdbff ? 2 : 1;

        if (len1 !== len2) break;
        if (len1 === 2) {
            if (
                code1 !== code2 ||
                normalizedInput.charCodeAt(i + 1) !== normalizedTarget.charCodeAt(j + 1)
            )
                break;
        } else {
            if (code1 !== code2) break;
        }

        matchedCount++;
        i += len1;
        j += len2;
    }

    let inputLength = matchedCount;
    while (i < normalizedInput.length) {
        const code = normalizedInput.charCodeAt(i);
        i += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        inputLength++;
    }

    let targetLength = matchedCount;
    let k = j;
    while (k < normalizedTarget.length) {
        const code = normalizedTarget.charCodeAt(k);
        k += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        targetLength++;
    }

    const inputEnd = Math.min(inputLength, targetLength);

    let displayIdx = 0;
    let charIdx = 0;
    let correctEndIdx = 0;
    let inputEndIdx = 0;

    while (displayIdx < displayTarget.length && charIdx < inputEnd) {
        if (charIdx === matchedCount) correctEndIdx = displayIdx;
        const code = displayTarget.charCodeAt(displayIdx);
        displayIdx += code >= 0xd800 && code <= 0xdbff ? 2 : 1;
        charIdx++;
    }

    if (charIdx === matchedCount) correctEndIdx = displayIdx;
    inputEndIdx = displayIdx;

    const correct = displayTarget.substring(0, correctEndIdx);
    const incorrect = displayTarget.substring(correctEndIdx, inputEndIdx);
    const remaining = displayTarget.substring(inputEndIdx);

    return { correct, incorrect, remaining };
};
