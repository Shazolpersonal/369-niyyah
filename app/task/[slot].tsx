import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
    Keyboard,
    Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useProgress } from '../../contexts/ProgressContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { RepetitionCounter } from '../../components/RepetitionCounter';
import { getAffirmationByLanguage } from '../../utils/contentCycler';
import { getDisplayText, getValidationInfo, getHighlightSegments } from '../../utils/textValidator';
import { getSlotEmoji, getRepetitionTarget } from '../../utils/timeSlotManager';
import { TimeSlot } from '../../types';

/** Returns the correct font family based on language and weight */
const getFontFamily = (language: string, weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
    const fonts: Record<string, Record<string, string>> = {
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
    return fonts[language]?.[weight] || fonts['en'][weight];
};

const SLOT_TITLE_KEYS: Record<TimeSlot, string> = {
    morning: 'task.morningNiyyah',
    noon: 'task.afternoonNiyyah',
    night: 'task.eveningNiyyah',
};

// Minimum accuracy percentage to enable submit button
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

    // Animation values
    const successOpacity = useRef(new RNAnimated.Value(0)).current;
    const successScale = useRef(new RNAnimated.Value(0.5)).current;
    const buttonScale = useRef(new RNAnimated.Value(1)).current;

    const repetitionTarget = getRepetitionTarget(slot);
    const affirmation = getAffirmationByLanguage(totalElapsedDays, slot, language);
    const displayText = useMemo(() => getDisplayText(affirmation), [affirmation]);

    // Real-time validation
    const validationInfo = useMemo(
        () => getValidationInfo(input, affirmation),
        [input, affirmation]
    );

    const highlightSegments = useMemo(
        () => getHighlightSegments(input, displayText),
        [input, displayText]
    );

    // Auto-submit when 100% match
    useEffect(() => {
        if (validationInfo.isCompleteMatch && input.length > 0 && !showSuccess) {
            handleRepetitionComplete();
        }
    }, [validationInfo.isCompleteMatch, input]);

    const handleRepetitionComplete = useCallback(() => {
        const newCount = repetitionsCompleted + 1;
        setRepetitionsCompleted(newCount);
        setInput('');
        Keyboard.dismiss();

        if (newCount >= repetitionTarget) {
            // All done!
            setAllDone(true);
            completeTask(slot);

            // Show success animation
            setShowSuccess(true);
            RNAnimated.parallel([
                RNAnimated.timing(successOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                RNAnimated.spring(successScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Brief flash for repetition complete
            setShowSuccess(true);
            successOpacity.setValue(1);
            successScale.setValue(1);

            setTimeout(() => {
                RNAnimated.timing(successOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setShowSuccess(false);
                    successScale.setValue(0.5);
                });
            }, 800);
        }
    }, [repetitionsCompleted, repetitionTarget, slot, completeTask]);

    // ===== MANUAL SUBMIT =====
    const handleManualSubmit = useCallback(() => {
        if (validationInfo.percent >= MIN_ACCURACY_PERCENT) {
            handleRepetitionComplete();
        }
    }, [validationInfo.percent, handleRepetitionComplete]);

    // ===== BUTTON ANIMATIONS =====
    const handlePressIn = useCallback(() => {
        RNAnimated.spring(buttonScale, {
            toValue: 0.95,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        RNAnimated.spring(buttonScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    // ===== UI RULES =====
    const getBorderColor = () => {
        if (input.length === 0) return '#E2E8F0'; // slate-200
        if (validationInfo.isCorrectSoFar) return '#10B981'; // emerald-500
        return '#EF4444'; // red-500
    };

    const canSubmit = validationInfo.percent >= MIN_ACCURACY_PERCENT && !showSuccess;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-3">
                    <Pressable onPress={() => router.back()} className="p-2 mr-2">
                        <ArrowLeft size={24} color="#334155" />
                    </Pressable>
                    <Text
                        className="text-lg font-semibold text-slate-800 flex-1"
                        style={{ fontFamily: f('semibold') }}
                    >
                        {getSlotEmoji(slot)} {t(SLOT_TITLE_KEYS[slot])}
                    </Text>
                    <Text
                        className="text-sm text-slate-500"
                        style={{ fontFamily: f('medium') }}
                    >
                        {repetitionsCompleted}/{repetitionTarget}
                    </Text>
                </View>

                {/* Repetition Counter Dots */}
                <RepetitionCounter total={repetitionTarget} completed={repetitionsCompleted} />

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Success State (All Done) */}
                    {allDone && showSuccess && (
                        <RNAnimated.View
                            style={{
                                opacity: successOpacity,
                                transform: [{ scale: successScale }],
                            }}
                            className="items-center justify-center py-20"
                        >
                            <CheckCircle size={80} color="#10B981" />
                            <Text
                                className="text-2xl font-bold text-emerald-600 mt-6 text-center"
                                style={{ fontFamily: f('bold') }}
                            >
                                {t('task.alhamdulillahComplete')}
                            </Text>
                            <Text
                                className="text-slate-500 mt-2 text-center text-base"
                                style={{ fontFamily: f('regular') }}
                            >
                                {t('task.completeDua')}
                            </Text>
                            <Pressable
                                onPress={() => router.back()}
                                className="bg-emerald-500 px-8 py-3 rounded-xl mt-8 active:bg-emerald-600"
                            >
                                <Text
                                    className="text-white font-semibold text-base"
                                    style={{ fontFamily: f('semibold') }}
                                >
                                    {t('task.backToDashboard')}
                                </Text>
                            </Pressable>
                        </RNAnimated.View>
                    )}

                    {/* Brief Success Flash (Between Reps) */}
                    {!allDone && showSuccess && (
                        <RNAnimated.View
                            style={{ opacity: successOpacity }}
                            className="items-center py-8"
                        >
                            <Text className="text-4xl">✅</Text>
                            <Text
                                className="text-emerald-600 font-semibold text-lg mt-2"
                                style={{ fontFamily: f('semibold') }}
                            >
                                {t('task.mashaAllah')} {repetitionsCompleted}/{repetitionTarget}
                            </Text>
                        </RNAnimated.View>
                    )}

                    {/* Input Area */}
                    {!allDone && !showSuccess && (
                        <>
                            {/* Target Affirmation Display */}
                            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
                                <Text
                                    className="text-xs text-slate-400 uppercase tracking-wider mb-3"
                                    style={{ fontFamily: f('semibold') }}
                                >
                                    {t('task.todaysNiyyah')}
                                </Text>
                                <Text className="text-lg leading-7" style={{ fontFamily: f('regular') }}>
                                    <Text className="text-emerald-600">{highlightSegments.correct}</Text>
                                    <Text className="text-red-500">{highlightSegments.incorrect}</Text>
                                    <Text className="text-slate-400">{highlightSegments.remaining}</Text>
                                </Text>
                            </View>

                            {/* Text Input */}
                            <View
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                                style={{ borderWidth: 2, borderColor: getBorderColor() }}
                            >
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder={t('task.placeholder')}
                                    placeholderTextColor="#CBD5E1"
                                    multiline
                                    autoFocus
                                    className="text-base text-slate-800 min-h-[100px]"
                                    style={{
                                        fontFamily: f('regular'),
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </View>

                            {/* Progress Indicator */}
                            <View className="flex-row items-center justify-between mb-4">
                                <Text
                                    className="text-sm text-slate-500"
                                    style={{ fontFamily: f('medium') }}
                                >
                                    {t('task.accuracy')} {validationInfo.percent}%
                                </Text>
                                <Text
                                    className="text-xs text-slate-400"
                                    style={{ fontFamily: f('regular') }}
                                >
                                    {validationInfo.percent >= 100
                                        ? t('task.autoSubmitting')
                                        : validationInfo.percent >= MIN_ACCURACY_PERCENT
                                            ? t('task.readyToSubmit')
                                            : t('task.needPercent', { n: MIN_ACCURACY_PERCENT })}
                                </Text>
                            </View>

                            {/* Submit Button */}
                            <RNAnimated.View style={{ transform: [{ scale: buttonScale }] }}>
                                <Pressable
                                    onPress={handleManualSubmit}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                    disabled={!canSubmit}
                                    className={`py-4 rounded-2xl ${canSubmit ? 'bg-emerald-500 active:bg-emerald-600' : 'bg-slate-200'
                                        }`}
                                >
                                    <Text
                                        className={`text-center text-lg font-semibold ${canSubmit ? 'text-white' : 'text-slate-400'
                                            }`}
                                        style={{ fontFamily: f('semibold') }}
                                    >
                                        {t('task.submit')} ({validationInfo.percent}%)
                                    </Text>
                                </Pressable>
                            </RNAnimated.View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
