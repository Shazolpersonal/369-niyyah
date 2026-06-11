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

    // Optimized validation avoiding array spread for unicode characters.
    // Since normalizedInput/Target only use basic strings and potentially emojis,
    // we can use standard string functions directly without O(N) array allocation.
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    // We still need the code point length (not just string length, due to emojis)
    // for progress percentage and exact matching.
    let inputLength = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLength++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++; // Skip low surrogate
    }

    let targetLength = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLength++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
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

    // Match code points sequentially without allocating arrays
    let correctCodePoints = 0;
    let iInput = 0;
    let iTarget = 0;

    while (iInput < normalizedInput.length && iTarget < normalizedTarget.length) {
        const codeInput = normalizedInput.charCodeAt(iInput);
        const codeTarget = normalizedTarget.charCodeAt(iTarget);

        const isInputHigh = codeInput >= 0xD800 && codeInput <= 0xDBFF;
        const isTargetHigh = codeTarget >= 0xD800 && codeTarget <= 0xDBFF;

        const nextCodeInput = isInputHigh ? normalizedInput.charCodeAt(iInput + 1) : null;
        const nextCodeTarget = isTargetHigh ? normalizedTarget.charCodeAt(iTarget + 1) : null;

        if (codeInput !== codeTarget || nextCodeInput !== nextCodeTarget) {
            break;
        }

        correctCodePoints++;
        iInput += isInputHigh ? 2 : 1;
        iTarget += isTargetHigh ? 2 : 1;
    }

    // Count code points for input
    let inputCodePoints = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputCodePoints++;
        const code = normalizedInput.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    // Count code points for target
    let targetCodePoints = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetCodePoints++;
        const code = normalizedTarget.charCodeAt(i);
        if (code >= 0xD800 && code <= 0xDBFF) i++;
    }

    const inputEndPoints = Math.min(inputCodePoints, targetCodePoints);

    // Map code point offsets to string indices for displayTarget
    let displayIndex = 0;
    let currentCodePoint = 0;
    let correctStrIndex = 0;
    let inputStrIndex = 0;

    while (displayIndex < displayTarget.length && currentCodePoint < Math.max(correctCodePoints, inputEndPoints)) {
        if (currentCodePoint === correctCodePoints) correctStrIndex = displayIndex;
        if (currentCodePoint === inputEndPoints) inputStrIndex = displayIndex;

        currentCodePoint++;
        const code = displayTarget.charCodeAt(displayIndex);
        if (code >= 0xD800 && code <= 0xDBFF) {
            displayIndex += 2;
        } else {
            displayIndex += 1;
        }
    }

    if (currentCodePoint === correctCodePoints) correctStrIndex = displayIndex;
    if (currentCodePoint === inputEndPoints) inputStrIndex = displayIndex;

    return {
        correct: displayTarget.substring(0, correctStrIndex),
        incorrect: displayTarget.substring(correctStrIndex, inputStrIndex),
        remaining: displayTarget.substring(inputStrIndex)
    };
};
