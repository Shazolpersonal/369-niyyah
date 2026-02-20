/**
 * Text Validator Utility for 369 Niyyah
 * Handles normalization and validation of user input against target affirmation text.
 * Simplified for English text (no grapheme-splitter needed).
 */

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
        .replace(/[.,;:!?'"()\-—–\u201c\u201d\u2018\u2019]/g, '') // Remove common punctuation + smart quotes
        .replace(/\s+/g, ' ')
        .replace(/^\s+/, ''); // Only trim leading whitespace, preserve trailing
};

/**
 * Creates display-ready text by removing punctuation but preserving case and spacing.
 */
export const getDisplayText = (text: string): string => {
    return text
        .replace(/[.,;:!?'"()\-—–\u201c\u201d\u2018\u2019]/g, '') // Include smart quotes
        .replace(/\s+/g, ' ')
        .replace(/^\s+/, ''); // Only trim leading whitespace
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
    const inputChars = [...normalizedInput];
    const targetChars = [...normalizedTarget];

    for (let i = 0; i < inputChars.length; i++) {
        if (i >= targetChars.length || inputChars[i] !== targetChars[i]) {
            isCorrectSoFar = false;
            break;
        }
    }

    // Calculate progress percentage
    const percent = targetChars.length > 0
        ? Math.min(100, Math.floor((inputChars.length / targetChars.length) * 100))
        : 0;

    // Complete match requires correct prefix AND same length
    const isCompleteMatch = isCorrectSoFar && inputChars.length === targetChars.length;

    return {
        isCorrectSoFar,
        isCompleteMatch,
        percent,
        inputLength: inputChars.length,
        targetLength: targetChars.length,
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

    const inputChars = [...normalizedInput];
    const targetChars = [...normalizedTarget];

    // Find how many normalized characters match
    let matchedNormalizedCount = 0;
    for (let i = 0; i < inputChars.length; i++) {
        if (i >= targetChars.length || inputChars[i] !== targetChars[i]) {
            break;
        }
        matchedNormalizedCount++;
    }

    // Map matchedNormalizedCount back to position in the original displayTarget.
    // normalizedTarget was produced by: lowercase → remove punctuation → collapse spaces → trim
    // displayTarget was produced by: remove punctuation → collapse spaces → trim (preserves case)
    // So they differ only in case — same length, same character positions!
    // Thus matchedNormalizedCount maps directly to displayTarget positions.
    const correctEnd = matchedNormalizedCount;
    const inputEnd = Math.min(inputChars.length, targetChars.length);

    const displayChars = [...displayTarget];
    const correct = displayChars.slice(0, correctEnd).join('');
    const incorrect = displayChars.slice(correctEnd, inputEnd).join('');
    const remaining = displayChars.slice(inputEnd).join('');

    return { correct, incorrect, remaining };
};
