import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled JS errors in the React tree
 * and displays a user-friendly fallback instead of a white crash screen.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        padding: 32,
                    }}
                >
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>😔</Text>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: '#1E293B',
                            textAlign: 'center',
                            marginBottom: 8,
                        }}
                    >
                        কিছু একটা সমস্যা হয়েছে
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#64748B',
                            textAlign: 'center',
                            marginBottom: 24,
                            lineHeight: 20,
                        }}
                    >
                        Something went wrong. Please try again.
                    </Text>
                    <TouchableOpacity
                        onPress={this.handleRetry}
                        style={{
                            backgroundColor: '#10B981',
                            paddingHorizontal: 32,
                            paddingVertical: 14,
                            borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                            আবার চেষ্টা করুন
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}
