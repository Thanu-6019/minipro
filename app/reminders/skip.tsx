import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// FIX: Static import for Metro compatibility
import { reminderService } from '../../src/features/reminders/services/reminder.service';

type SkipReason = 'Slept through it' | 'Feeling unwell' | 'Out of stock' | 'Other';

export default function SkipDoseScreen() {
    const router = useRouter();
    const { reminderId } = useLocalSearchParams<{ reminderId: string }>();
    const [selectedReason, setSelectedReason] = useState<SkipReason | null>(null);

    const reasons: SkipReason[] = ['Slept through it', 'Feeling unwell', 'Out of stock', 'Other'];

    const handleConfirmSkip = async () => {
        if (!selectedReason || !reminderId) return;
        try {
            await reminderService.updateReminderStatus(reminderId, 'skipped');
            router.replace('/(tabs)');
        } catch {
            Alert.alert('Error', 'Failed to skip reminder. Please try again.');
        }
    };

    return (
        <View style={styles.backgroundOverlay}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>

                    {/* Main Glass Card */}
                    <View style={styles.card}>

                        {/* Close Button */}
                        <Pressable style={styles.closeButton} onPress={() => router.back()} accessibilityLabel="Close" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.closeIcon}>close</Text>
                        </Pressable>

                        {/* Header Section */}
                        <View style={styles.headerSection}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.headerIcon}>medication</Text>
                            </View>
                            <Text style={styles.headerTitle}>Skip Dose</Text>
                            <Text style={styles.headerSubtitle}>
                                It&apos;s okay to miss a dose sometimes. Let&apos;s record the reason.
                            </Text>
                        </View>

                        {/* Options Section */}
                        <View style={styles.optionsSection}>
                            <Text style={styles.optionsTitle}>Reason for skipping?</Text>

                            <View style={styles.optionsList}>
                                {reasons.map((reason) => {
                                    const isSelected = selectedReason === reason;
                                    return (
                                        <Pressable
                                            key={reason}
                                            style={({ pressed }) => [
                                                styles.optionRow,
                                                isSelected && styles.optionRowSelected,
                                                pressed && styles.pressedScale
                                            ]}
                                            onPress={() => setSelectedReason(reason)}
                                            accessibilityLabel={reason}
                                            accessibilityRole="radio"
                                            accessibilityState={{ selected: isSelected }}
                                        >
                                            {/* Custom Radio Button */}
                                            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                                {isSelected && <View style={styles.radioInner} />}
                                            </View>

                                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                                {reason}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Confirm Action Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.confirmButton,
                                pressed && styles.confirmButtonPressed,
                            ]}
                            onPress={handleConfirmSkip}
                            accessibilityLabel="Confirm skip dose"
                            accessibilityRole="button"
                        >
                            <Text style={styles.confirmButtonText}>Confirm Skip</Text>
                        </Pressable>

                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

// [DO NOT DELETE STYLES BELOW - This solves the "Cannot find name 'styles'" error]
const styles = StyleSheet.create({
    backgroundOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Dimmed backdrop
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // margin-mobile
    },

    // --- Card ---
    card: {
        width: '100%',
        maxWidth: 448, // max-w-md
        backgroundColor: '#FFFFFF', // surface-light
        borderRadius: 32, // rounded-[32px]
        padding: 24, // p-xl
        position: 'relative',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#eae7ea', // surface-container-high
    },

    // --- Close Button ---
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f6f3f5', // surface-container-low
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755', // on-surface-variant
    },

    // --- Header ---
    headerSection: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(186, 26, 26, 0.3)', // error-container/30
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 40,
        color: '#ba1a1a', // error
    },
    headerTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d', // on-background
        marginBottom: 8,
    },
    headerSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755', // on-surface-variant
        textAlign: 'center',
        maxWidth: 280,
    },

    // --- Options ---
    optionsSection: {
        marginBottom: 24,
    },
    optionsTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginLeft: 4,
        marginBottom: 16,
    },
    optionsList: {
        gap: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eae7ea', // surface-container-high
        backgroundColor: '#ffffff', // surface
    },
    optionRowSelected: {
        borderColor: '#0058bc',
        backgroundColor: '#fcf8fb',
    },

    // --- Custom Radio Button ---
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#c1c6d7', // outline-variant
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    radioOuterSelected: {
        borderColor: '#0058bc',
        backgroundColor: '#0058bc',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ffffff', // on-primary
    },
    optionText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#1b1b1d', // on-background
    },
    optionTextSelected: {
        fontWeight: '500',
    },

    // --- Button ---
    confirmButton: {
        width: '100%',
        backgroundColor: '#ba1a1a', // error
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ba1a1a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.9,
        backgroundColor: '#93000a', // darker error
    },
    confirmButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff', // on-error
    },

    // --- Common ---
    pressedScale: {
        transform: [{ scale: 0.98 }],
    },
});