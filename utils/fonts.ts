/**
 * Shared font family utility for 369 Niyyah
 * Centralizes font selection logic based on language.
 */

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const FONT_MAP: Record<string, Record<FontWeight, string>> = {
    en: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
    },
    bn: {
        regular: 'NotoSansBengali_400Regular',
        medium: 'NotoSansBengali_500Medium',
        semibold: 'NotoSansBengali_600SemiBold',
        bold: 'NotoSansBengali_700Bold',
    },
};

/** Returns the correct font family based on language and weight */
export const getFontFamily = (language: string, weight: FontWeight): string => {
    return FONT_MAP[language]?.[weight] || FONT_MAP['en'][weight];
};
