import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { quotes } from '../data/quotes';
import { quotes_bn } from '../data/quotes_bn';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';
import { COLORS } from '../utils/theme';
import { SPRING_CONFIG_BOUNCY } from '../utils/animations';

export function DailyQuote() {
    const { language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const quoteList = language === 'bn' ? quotes_bn : quotes;
    const quote = quoteList[dayOfYear % quoteList.length];

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
        translateY.value = withSpring(0, SPRING_CONFIG_BOUNCY);
    }, []);

    const rStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <Animated.View style={[styles.container, rStyle]}>
            {/* Gold quote icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.quoteIcon}>❝</Text>
            </View>
            <Text style={[styles.quoteText, { fontFamily: f('medium') }]}>
                "{quote.text}"
            </Text>
            <Text style={[styles.sourceText, { fontFamily: f('semibold') }]}>
                — {quote.source}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0F172A',
        borderRadius: 20,
        padding: 24,
        paddingTop: 32,
        marginHorizontal: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.2)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        position: 'absolute',
        top: -16,
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 71, 0.2)',
    },
    quoteIcon: {
        fontSize: 24,
        color: '#D4A847',
    },
    quoteText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 14,
    },
    sourceText: {
        fontSize: 12,
        color: '#D4A847',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
