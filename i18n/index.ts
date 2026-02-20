import { en } from './en';
import { bn } from './bn';

export type Language = 'en' | 'bn';

const translations: Record<Language, Record<string, string>> = { en, bn };

/**
 * Get a translated string by key, with optional parameter interpolation.
 * Parameters use {{paramName}} syntax, e.g., t('task.needPercent', { n: 80 })
 */
export function translate(language: Language, key: string, params?: Record<string, string | number>): string {
    let text = translations[language]?.[key] ?? translations['en']?.[key] ?? key;

    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
        });
    }

    return text;
}

export { en, bn };
