import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { getFontFamily } from '../utils/fonts';

export default function GuideScreen() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const f = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getFontFamily(language, weight);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text
                    className="text-lg font-semibold text-slate-800"
                    style={{ fontFamily: f('semibold') }}
                >
                    {t('guide.title')}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
            >
                {/* What is 369 Niyyah */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: f('bold') }}
                    >
                        {t('guide.whatIs.title')}
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: f('regular') }}
                    >
                        {t('guide.whatIs.body')}
                    </Text>
                </View>

                {/* The 369 Method */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: f('bold') }}
                    >
                        {t('guide.method.title')}
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7 mb-3"
                        style={{ fontFamily: f('regular') }}
                    >
                        {t('guide.method.intro')}
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">🌅</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: f('semibold') }}>
                                    {t('guide.method.morning.title')}
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: f('regular') }}>
                                    {t('guide.method.morning.desc')}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">☀️</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: f('semibold') }}>
                                    {t('guide.method.noon.title')}
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: f('regular') }}>
                                    {t('guide.method.noon.desc')}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start">
                            <Text className="text-2xl mr-3">🌙</Text>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800" style={{ fontFamily: f('semibold') }}>
                                    {t('guide.method.night.title')}
                                </Text>
                                <Text className="text-sm text-slate-500 mt-1" style={{ fontFamily: f('regular') }}>
                                    {t('guide.method.night.desc')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* How to Write */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: f('bold') }}
                    >
                        {t('guide.howToWrite.title')}
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: f('regular') }}
                    >
                        {t('guide.howToWrite.body')}
                    </Text>
                </View>

                {/* Daily Themes */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: f('bold') }}
                    >
                        {t('guide.themes.title')}
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: f('regular') }}
                    >
                        {t('guide.themes.body')}
                    </Text>
                </View>

                {/* Streaks */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                    <Text
                        className="text-lg font-bold text-emerald-700 mb-3"
                        style={{ fontFamily: f('bold') }}
                    >
                        {t('guide.streaks.title')}
                    </Text>
                    <Text
                        className="text-base text-slate-600 leading-7"
                        style={{ fontFamily: f('regular') }}
                    >
                        {t('guide.streaks.body')}
                    </Text>
                </View>

                {/* Dua */}
                <View className="bg-emerald-50 rounded-2xl p-5 items-center">
                    <Text className="text-3xl mb-3">🤲</Text>
                    <Text
                        className="text-base text-emerald-700 text-center leading-7"
                        style={{ fontFamily: f('medium') }}
                    >
                        {t('guide.dua')}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
