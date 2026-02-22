import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate, Language } from '../i18n';

const LANGUAGE_STORAGE_KEY = '@niyyah_369_language';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (saved === 'bn' || saved === 'en') {
                    setLanguageState(saved);
                }
            } catch (error) {
                console.error('Failed to load language preference:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = useCallback(async (lang: Language) => {
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch (error) {
            console.error('Failed to save language preference:', error);
        }
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            return translate(language, key, params);
        },
        [language]
    );

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    // Don't render until language preference is loaded
    // NOTE: useMemo must be BEFORE this return to comply with Rules of Hooks
    if (!isLoaded) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { LANGUAGE_STORAGE_KEY };
