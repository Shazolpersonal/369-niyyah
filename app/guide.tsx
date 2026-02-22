import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';
import { Accordion } from '../components/Accordion';
import { useStaggeredEntry } from '../utils/useStaggeredEntry';

function StaggeredView({ children, index, delay = 0 }: { children: React.ReactNode, index: number, delay?: number }) {
    const { animatedStyle } = useStaggeredEntry(index, delay, 100, 20);
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const METHOD_ITEMS = [
    { emoji: '🌅', titleKey: 'guide.method.morning.title', descKey: 'guide.method.morning.desc' },
    { emoji: '☀️', titleKey: 'guide.method.noon.title', descKey: 'guide.method.noon.desc' },
    { emoji: '🌙', titleKey: 'guide.method.night.title', descKey: 'guide.method.night.desc' },
];

export default function GuideScreen() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#064E3B', '#0F766E', '#134E4A', '#1E293B', '#0F172A'] as any}
                locations={[0, 0.15, 0.25, 0.45, 0.7]}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <Animated.View entering={FadeIn} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={22} color="#D4A847" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: f('bold') }]}>
                        {t('guide.title')}
                    </Text>
                </Animated.View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <StaggeredView index={0}>
                        <Accordion title={t('guide.whatIs.title')} initiallyExpanded={true}>
                            <Text style={[styles.bodyText, { fontFamily: f('regular') }]}>{t('guide.whatIs.body')}</Text>
                        </Accordion>
                    </StaggeredView>

                    <StaggeredView index={1}>
                        <Accordion title={t('guide.method.title')}>
                            <Text style={[styles.bodyText, { fontFamily: f('regular'), marginBottom: 16 }]}>{t('guide.method.intro')}</Text>
                            <View style={{ gap: 16 }}>
                                {METHOD_ITEMS.map((item, i) => (
                                    <View key={i} style={styles.methodRow}>
                                        <View style={styles.methodEmojiWrap}>
                                            <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.methodTitle, { fontFamily: f('semibold') }]}>{t(item.titleKey)}</Text>
                                            <Text style={[styles.methodDesc, { fontFamily: f('regular') }]}>{t(item.descKey)}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </Accordion>
                    </StaggeredView>

                    <StaggeredView index={2}>
                        <Accordion title={t('guide.howToWrite.title')}>
                            <Text style={[styles.bodyText, { fontFamily: f('regular') }]}>{t('guide.howToWrite.body')}</Text>
                        </Accordion>
                    </StaggeredView>

                    <StaggeredView index={3}>
                        <Accordion title={t('guide.themes.title')}>
                            <Text style={[styles.bodyText, { fontFamily: f('regular') }]}>{t('guide.themes.body')}</Text>
                        </Accordion>
                    </StaggeredView>

                    <StaggeredView index={4}>
                        <Accordion title={t('guide.streaks.title')}>
                            <Text style={[styles.bodyText, { fontFamily: f('regular') }]}>{t('guide.streaks.body')}</Text>
                        </Accordion>
                    </StaggeredView>

                    <StaggeredView index={5}>
                        <View style={styles.duaCard}>
                            <Text style={styles.duaEmoji}>🤲</Text>
                            <Text style={[styles.duaText, { fontFamily: f('medium') }]}>{t('guide.dua')}</Text>
                        </View>
                    </StaggeredView>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: {
        padding: 8, marginRight: 12, backgroundColor: 'rgba(212,168,71,0.1)',
        borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,168,71,0.15)',
    },
    headerTitle: { fontSize: 20, color: '#FFFFFF', letterSpacing: 0.3 },
    scrollContent: { padding: 20, paddingBottom: 48 },
    bodyText: { fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 28 },
    methodRow: { flexDirection: 'row', alignItems: 'flex-start' },
    methodEmojiWrap: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    methodTitle: { fontSize: 16, color: '#FFFFFF' },
    methodDesc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 22 },
    duaCard: {
        backgroundColor: '#0F172A', borderRadius: 20, padding: 28, alignItems: 'center',
        marginTop: 8, borderWidth: 1, borderColor: 'rgba(212,168,71,0.2)',
    },
    duaEmoji: { fontSize: 40, marginBottom: 16 },
    duaText: { fontSize: 16, color: '#D4A847', textAlign: 'center', lineHeight: 28 },
});
