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

    // ⚡ Bolt: Avoid O(N) array allocation from spreading strings [...str].
    // Use native startsWith for prefix checking and manual loops for accurate length counting.
    const isCorrectSoFar = normalizedTarget.startsWith(normalizedInput);

    let inputLen = 0;
    for (let i = 0; i < normalizedInput.length; i++) {
        inputLen++;
        if (normalizedInput.charCodeAt(i) >= 0xd800 && normalizedInput.charCodeAt(i) <= 0xdbff) i++;
    }

    let targetLen = 0;
    for (let i = 0; i < normalizedTarget.length; i++) {
        targetLen++;
        if (normalizedTarget.charCodeAt(i) >= 0xd800 && normalizedTarget.charCodeAt(i) <= 0xdbff)
            i++;
    }

    // Calculate progress percentage
    const percent = targetLen > 0 ? Math.min(100, Math.floor((inputLen / targetLen) * 100)) : 0;

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

    // ⚡ Bolt: Avoid O(N) array allocation from spreading strings [...str].
    // Count exact character lengths matching unicode surrogate pairs,
    // and extract substrings directly.
    let matchedNormalizedCount = 0;
    let i = 0,
        j = 0;

    while (i < normalizedInput.length && j < normalizedTarget.length) {
        let charI = normalizedInput[i];
        let charJ = normalizedTarget[j];
        let stepI = 1,
            stepJ = 1;

        if (normalizedInput.charCodeAt(i) >= 0xd800 && normalizedInput.charCodeAt(i) <= 0xdbff) {
            stepI = 2;
            charI += normalizedInput[i + 1];
        }
        if (normalizedTarget.charCodeAt(j) >= 0xd800 && normalizedTarget.charCodeAt(j) <= 0xdbff) {
            stepJ = 2;
            charJ += normalizedTarget[j + 1];
        }

        if (charI !== charJ) break;

        matchedNormalizedCount++;
        i += stepI;
        j += stepJ;
    }

    // Continue counting true lengths for correct truncation boundaries
    let inputLen = matchedNormalizedCount;
    while (i < normalizedInput.length) {
        inputLen++;
        if (normalizedInput.charCodeAt(i) >= 0xd800 && normalizedInput.charCodeAt(i) <= 0xdbff)
            i += 2;
        else i++;
    }

    let targetLen = matchedNormalizedCount;
    while (j < normalizedTarget.length) {
        targetLen++;
        if (normalizedTarget.charCodeAt(j) >= 0xd800 && normalizedTarget.charCodeAt(j) <= 0xdbff)
            j += 2;
        else j++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputLen, targetLen);

    // Iterate through displayTarget counting true character length to find slice indices
    let displayCorrectIdx = 0;
    let count = 0;
    while (displayCorrectIdx < displayTarget.length && count < correctEnd) {
        count++;
        if (
            displayTarget.charCodeAt(displayCorrectIdx) >= 0xd800 &&
            displayTarget.charCodeAt(displayCorrectIdx) <= 0xdbff
        ) {
            displayCorrectIdx += 2;
        } else {
            displayCorrectIdx++;
        }
    }

    let displayInputIdx = displayCorrectIdx;
    while (displayInputIdx < displayTarget.length && count < inputEnd) {
        count++;
        if (
            displayTarget.charCodeAt(displayInputIdx) >= 0xd800 &&
            displayTarget.charCodeAt(displayInputIdx) <= 0xdbff
        ) {
            displayInputIdx += 2;
        } else {
            displayInputIdx++;
        }
    }

    const correct = displayTarget.substring(0, displayCorrectIdx);
    const incorrect = displayTarget.substring(displayCorrectIdx, displayInputIdx);
    const remaining = displayTarget.substring(displayInputIdx);

    return { correct, incorrect, remaining };
};
