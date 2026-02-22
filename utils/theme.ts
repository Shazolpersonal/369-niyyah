import { Platform } from 'react-native';

/**
 * 369 Niyyah Core Theme System
 * Contains constants, gradients, and semantic colors
 */

export const COLORS = {
    // Primary
    primary: '#064E3B', // Deep Emerald
    primaryLight: '#059669',

    // Accents
    gold: '#C4A35A',     // Crescent Gold
    goldLight: '#D4A847',

    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Theme Accents
    dawn: '#FBC4AB',
    midnight: '#1E1B4B',
    mosqueTeal: '#0D9488',

    // Neutrals
    stone50: '#FAFAF9',
    stone100: '#F5F5F4',
    stone800: '#292524',

    // Specific
    overlay: 'rgba(0,0,0,0.5)',
    glass: 'rgba(255,255,255,0.85)',
};

/**
 * Gradients for specific times of day
 * Array format for Expo LinearGradient
 */
export const GRADIENTS = {
    morning: ['#FFF7ED', '#FBBF24', '#F59E0B'] as const,
    noon: ['#ECFDF5', '#10B981', '#059669'] as const,
    night: ['#1E1B4B', '#312E81', '#4338CA'] as const,

    // App-wide accents
    gold: ['#D4A847', '#C4A35A'] as const,
    emerald: ['#059669', '#064E3B'] as const,
};

/**
 * Cross-platform Shadow Presets
 */
export const SHADOWS = {
    sm: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
        android: { elevation: 2 },
        web: { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    }),
    md: Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
        android: { elevation: 4 },
        web: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    }),
    glow: Platform.select({
        ios: { shadowColor: COLORS.goldLight, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 },
        android: { elevation: 8, shadowColor: COLORS.goldLight },
        web: { boxShadow: '0 0 15px rgba(212, 168, 71, 0.3)' },
    }),
};
