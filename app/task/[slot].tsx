import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence,
    interpolateColor, FadeIn, SlideInDown, Easing, runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useProgress } from '../../contexts/ProgressContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RepetitionCounter } from '../../components/RepetitionCounter';
import { ConfettiBurst } from '../../components/ConfettiBurst';
import { getAffirmationByLanguage } from '../../utils/contentCycler';
import { getDisplayText, getValidationInfo, getHighlightSegments } from '../../utils/textValidator';
import { getSlotEmoji, getRepetitionTarget } from '../../utils/timeSlotManager';
import { TimeSlot } from '../../types';
import { getFontFamily } from '../../utils/fonts';
import { useInterstitialAd } from '../../utils/useInterstitialAd';
import { COLORS, GRADIENTS, SHADOWS } from '../../utils/theme';
import { SPRING_CONFIG } from '../../utils/animations';

const SLOT_TITLE_KEYS: Record<TimeSlot, string> = {
    morning: 'task.morningNiyyah', noon: 'task.afternoonNiyyah', night: 'task.eveningNiyyah',
};
const MIN_ACCURACY_PERCENT = 80;

export default function TaskInputScreen() {
    const { slot: slotParam } = useLocalSearchParams<{ slot: string }>();
    const slot = slotParam as TimeSlot;
    const router = useRouter();
    const { completeTask, totalElapsedDays } = useProgress();
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    const [input, setInput] = useState('');
    const [repetitionsCompleted, setRepetitionsCompleted] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [allDone, setAllDone] = useState(false);
    const { showAd } = useInterstitialAd();

    const successOpacity = useSharedValue(0);
    const successScale = useSharedValue(0.5);
    const buttonScale = useSharedValue(1);
    const borderTransition = useSharedValue(0);

    const repetitionTarget = getRepetitionTarget(slot);
    const affirmation = getAffirmationByLanguage(totalElapsedDays, slot, language);
    const displayText = useMemo(() => getDisplayText(affirmation), [affirmation]);
    const validationInfo = useMemo(() => getValidationInfo(input, affirmation), [input, affirmation]);
    const highlightSegments = useMemo(() => getHighlightSegments(input, displayText), [input, displayText]);

    useEffect(() => {
        let target = 0;
        if (input.length > 0) target = validationInfo.isCorrectSoFar ? 1 : 2;
        borderTransition.value = withTiming(target, { duration: 200, easing: Easing.out(Easing.ease) });
    }, [input, validationInfo.isCorrectSoFar]);

    const handleRepetitionComplete = useCallback(async () => {
        const newCount = repetitionsCompleted + 1;
        setRepetitionsCompleted(newCount);
        setInput('');
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { }

        if (newCount >= repetitionTarget) {
            setAllDone(true);
            completeTask(slot);
            Keyboard.dismiss();
            showAd();
            setShowSuccess(true);
            successOpacity.value = withTiming(1, { duration: 400 });
            successScale.value = withSpring(1, SPRING_CONFIG);
        } else {
            setShowSuccess(true);
            successOpacity.value = 1;
            successScale.value = 1;
            setTimeout(() => {
                successOpacity.value = withTiming(0, { duration: 300 });
                successScale.value = withTiming(0.5, { duration: 300 }, (finished) => {
                    if (finished) runOnJS(setShowSuccess)(false);
                });
            }, 1000);
        }
    }, [repetitionsCompleted, repetitionTarget, slot, completeTask, showAd]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (validationInfo.isCompleteMatch && input.length > 0 && !showSuccess && !allDone) {
            timeout = setTimeout(() => { handleRepetitionComplete(); }, 300);
        }
        return () => { if (timeout) clearTimeout(timeout); };
    }, [validationInfo.isCompleteMatch, input, showSuccess, allDone, handleRepetitionComplete]);

    const handleManualSubmit = useCallback(() => {
        if (validationInfo.percent >= MIN_ACCURACY_PERCENT) handleRepetitionComplete();
    }, [validationInfo.percent, handleRepetitionComplete]);

    const handlePressIn = useCallback(() => { buttonScale.value = withSpring(0.95, SPRING_CONFIG); }, []);
    const handlePressOut = useCallback(() => { buttonScale.value = withSpring(1, SPRING_CONFIG); }, []);

    const rBorderStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(borderTransition.value, [0, 1, 2], ['#334155', '#10B981', '#F43F5E']),
    }));
    const rSuccessStyle = useAnimatedStyle(() => ({ opacity: successOpacity.value, transform: [{ scale: successScale.value }] }));
    const rButtonStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

    const canSubmit = validationInfo.percent >= MIN_ACCURACY_PERCENT && !showSuccess;
    const accentGradient = GRADIENTS[slot] as readonly [string, string, ...string[]];

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#064E3B', '#134E4A', '#1E293B', '#0F172A'] as any} locations={[0, 0.15, 0.35, 0.6]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={s.header}>
                        <Pressable onPress={() => router.back()} style={s.backBtn}>
                            <ArrowLeft size={22} color="#D4A847" />
                        </Pressable>
                        <Text style={[s.headerTitle, { fontFamily: f('bold') }]}>
                            {getSlotEmoji(slot)} {t(SLOT_TITLE_KEYS[slot])}
                        </Text>
                        <View style={s.counterBadge}>
                            <Text style={[s.counterText, { fontFamily: f('bold') }]}>
                                {repetitionsCompleted}/{repetitionTarget}
                            </Text>
                        </View>
                    </View>

                    {!allDone && (
                        <Animated.View entering={FadeIn.duration(400)}>
                            <RepetitionCounter total={repetitionTarget} completed={repetitionsCompleted} />
                        </Animated.View>
                    )}

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1, justifyContent: allDone ? 'center' : 'flex-start' }} keyboardShouldPersistTaps="handled">
                        {/* All Done Success */}
                        {allDone && showSuccess && (
                            <Animated.View style={[rSuccessStyle, { alignItems: 'center', paddingVertical: 40, zIndex: 20 }]}>
                                <ConfettiBurst count={60} duration={3000} />
                                <LinearGradient colors={GRADIENTS.emerald as any} style={s.successIcon}>
                                    <CheckCircle size={50} color="#FFFFFF" strokeWidth={2.5} />
                                </LinearGradient>
                                <Text style={[s.successTitle, { fontFamily: f('bold') }]}>{t('task.alhamdulillahComplete')}</Text>
                                <Text style={[s.successSub, { fontFamily: f('medium') }]}>{t('task.completeDua')}</Text>
                                <Pressable onPress={() => router.back()} style={{ marginTop: 48, width: '100%' }}>
                                    <View style={s.backDashBtn}>
                                        <LinearGradient colors={GRADIENTS.emerald as any} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
                                        <Text style={[{ color: '#FFF', fontSize: 16 }, { fontFamily: f('bold') }]}>{t('task.backToDashboard')}</Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        )}

                        {/* Brief Success Flash */}
                        {!allDone && showSuccess && (
                            <Animated.View style={[rSuccessStyle, { position: 'absolute', top: '30%', alignSelf: 'center', zIndex: 10 }]}>
                                <ConfettiBurst count={30} duration={1500} />
                                <View style={s.flashCard}>
                                    <Text style={{ fontSize: 44, marginBottom: 12 }}>✨</Text>
                                    <Text style={[s.flashTitle, { fontFamily: f('bold') }]}>{t('task.mashaAllah')}</Text>
                                    <Text style={[s.flashSub, { fontFamily: f('semibold') }]}>
                                        {repetitionsCompleted}/{repetitionTarget} {t('dashboard.completedNiyyah')}
                                    </Text>
                                </View>
                            </Animated.View>
                        )}

                        {/* Input Area */}
                        {!allDone && !showSuccess && (
                            <Animated.View entering={SlideInDown.duration(500).springify()}>
                                {/* Affirmation Display */}
                                <View style={s.affirmationCard}>
                                    <LinearGradient colors={accentGradient} style={s.affirmationAccent} />
                                    <Text style={[s.affirmationLabel, { fontFamily: f('bold') }]}>{t('task.todaysNiyyah')}</Text>
                                    <Text style={[{ fontSize: 18, lineHeight: 30, marginLeft: 8 }, { fontFamily: f('medium') }]}>
                                        <Text style={{ color: '#10B981' }}>{highlightSegments.correct}</Text>
                                        <Text style={{ color: '#F43F5E', textDecorationLine: 'underline' }}>{highlightSegments.incorrect}</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.35)' }}>{highlightSegments.remaining}</Text>
                                    </Text>
                                </View>

                                {/* Text Input */}
                                <Animated.View style={[s.inputCard, rBorderStyle]}>
                                    <TextInput
                                        value={input}
                                        onChangeText={setInput}
                                        placeholder={t('task.placeholder')}
                                        placeholderTextColor="#475569"
                                        multiline
                                        autoFocus
                                        style={[s.textInput, { fontFamily: f('regular') }]}
                                    />
                                </Animated.View>

                                {/* Submit Area */}
                                <View style={s.submitRow}>
                                    <View>
                                        <Text style={[s.accuracyText, { fontFamily: f('bold'), color: validationInfo.percent >= MIN_ACCURACY_PERCENT ? '#10B981' : '#94A3B8' }]}>
                                            {t('task.accuracy')} {validationInfo.percent}%
                                        </Text>
                                        <Text style={[s.accuracyHint, { fontFamily: f('medium') }]}>
                                            {validationInfo.percent >= 100 ? t('task.autoSubmitting')
                                                : validationInfo.percent >= MIN_ACCURACY_PERCENT ? t('task.readyToSubmit')
                                                    : t('task.needPercent', { n: MIN_ACCURACY_PERCENT })}
                                        </Text>
                                    </View>
                                    <Animated.View style={rButtonStyle}>
                                        <Pressable onPress={handleManualSubmit} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={!canSubmit}>
                                            <View style={[s.submitBtn, { backgroundColor: canSubmit ? COLORS.primary : '#1E293B' }]}>
                                                {canSubmit && <LinearGradient colors={GRADIENTS.emerald as any} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />}
                                                <Text style={[{ fontSize: 16, textAlign: 'center' }, { fontFamily: f('bold'), color: canSubmit ? '#FFF' : '#475569' }]}>
                                                    {t('task.submit')}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    </Animated.View>
                                </View>
                            </Animated.View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { padding: 8, marginRight: 12, backgroundColor: 'rgba(212,168,71,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,168,71,0.15)' },
    headerTitle: { fontSize: 18, color: '#FFFFFF', flex: 1 },
    counterBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    counterText: { fontSize: 14, color: '#D4A847' },
    affirmationCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
    affirmationAccent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 5 },
    affirmationLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, marginLeft: 8, color: '#D4A847' },
    inputCard: { backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 20, borderWidth: 2 },
    textInput: { fontSize: 17, color: '#FFFFFF', minHeight: 130, padding: 20, textAlignVertical: 'top' },
    submitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    accuracyText: { fontSize: 14 },
    accuracyHint: { fontSize: 12, marginTop: 3, color: '#64748B' },
    submitBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, overflow: 'hidden' },
    successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    successTitle: { fontSize: 28, color: '#FFFFFF', textAlign: 'center' },
    successSub: { marginTop: 12, textAlign: 'center', fontSize: 17, color: 'rgba(255,255,255,0.6)', paddingHorizontal: 16 },
    backDashBtn: { padding: 16, borderRadius: 16, alignItems: 'center', overflow: 'hidden' },
    flashCard: { backgroundColor: 'rgba(15,23,42,0.95)', padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,168,71,0.2)' },
    flashTitle: { fontSize: 24, color: '#D4A847', textAlign: 'center' },
    flashSub: { fontSize: 17, marginTop: 8, color: '#10B981', textAlign: 'center' },
});
