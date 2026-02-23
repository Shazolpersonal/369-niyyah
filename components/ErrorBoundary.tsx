import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            this.setState({ hasError: false, error: null });
        }
    };

    handleFactoryReset = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(keys);
            await Updates.reloadAsync();
        } catch (e) {
            console.error('Failed to reset app:', e);
            this.setState({ hasError: false, error: null });
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>😔</Text>
                        <Text style={styles.title}>কিছু একটা সমস্যা হয়েছে</Text>
                        <Text style={styles.description}>
                            Something went wrong. This might be a temporary glitch or corrupted local data.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={this.handleRetry} style={styles.primaryButton}>
                                <Text style={styles.primaryButtonText}>আবার চেষ্টা করুন (Reload)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={this.handleFactoryReset} style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>ডেটা রিসেট করুন (Reset Data)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emoji: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
    description: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    buttonContainer: { width: '100%', gap: 16 },
    primaryButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
    secondaryButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
    secondaryButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
});
