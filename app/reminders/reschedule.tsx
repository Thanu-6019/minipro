import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// FIX: Static import for Metro compatibility (prevents bundler crash)
import { reminderService } from '../../src/features/reminders/services/reminder.service';

type QuickSelectOption = '15' | '30' | '60' | 'meal';

export default function RescheduleDose() {
    const router = useRouter();
    const { name, dosage, reminderId, time } = useLocalSearchParams<{ name: string; dosage: string; reminderId: string; time: string }>();
    const medName = name || 'Medicine';
    const medDosage = dosage || '';
    const originalTime = time || '';
    const [selectedOption, setSelectedOption] = useState<QuickSelectOption>('60');

    const handleConfirmNewTime = async () => {
        if (!reminderId) {
            router.back();
            return;
        }

        const now = new Date();
        let delayMs = 0;
        if (selectedOption === '15') delayMs = 15 * 60 * 1000;
        else if (selectedOption === '30') delayMs = 30 * 60 * 1000;
        else if (selectedOption === '60') delayMs = 60 * 60 * 1000;
        else delayMs = 120 * 60 * 1000; // Fallback meal time
        const newTime = new Date(now.getTime() + delayMs).toISOString();

        try {
            // Skip the current occurrence
            await reminderService.updateReminderStatus(reminderId, 'skipped');
            // Create the next reminder
            await reminderService.createNextReminder(reminderId, newTime);
            router.replace('/(tabs)');
        } catch {
            Alert.alert('Error', 'Failed to reschedule. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>

                {/* Top Nav Action (Close) */}
                <View style={styles.topNav}>
                    <Pressable style={styles.closeButton} onPress={() => router.back()} accessibilityLabel="Close" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.closeIcon}>close</Text>
                    </Pressable>
                    <Text style={styles.brandText}>MedTrack AI</Text>
                    <View style={styles.navSpacer} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Ambient Background Decorations */}
                    <View style={styles.ambientBlob1} />
                    <View style={styles.ambientBlob2} />

                    {/* Headers */}
                    <View style={styles.headerSection}>
                        <Text style={styles.mainTitle}>Reschedule Dose</Text>
                        <Text style={styles.mainSubtitle}>
                            Life happens. Let&apos;s find a better time for your medication.
                        </Text>
                    </View>

                    {/* Context Card (Current Med) */}
                    <View style={styles.contextCard}>
                        <View style={styles.contextIconContainer}>
                            <Text style={styles.contextIcon}>pill</Text>
                        </View>
                        <View style={styles.contextTextContainer}>
                            <Text style={styles.contextTitle}>{medName}</Text>
                            <Text style={styles.contextSubtitle}>{medDosage}{originalTime ? ` • Originally at ${originalTime}` : ''}</Text>
                        </View>
                    </View>

                    {/* Quick Select Options */}
                    <Text style={styles.sectionTitle}>Quick Select</Text>
                    <View style={styles.quickSelectGrid}>

                        {/* In 15 mins */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.quickSelectCard,
                                selectedOption === '15' && styles.quickSelectCardActive,
                                pressed && styles.pressedScale,
                            ]}
                            onPress={() => setSelectedOption('15')}
                        >
                            <Text style={[styles.quickSelectIcon, selectedOption === '15' && styles.quickSelectIconActive]}>timer</Text>
                            <Text style={[styles.quickSelectLabel, selectedOption === '15' && styles.quickSelectLabelActive]}>In 15 mins</Text>
                        </Pressable>

                        {/* In 30 mins */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.quickSelectCard,
                                selectedOption === '30' && styles.quickSelectCardActive,
                                pressed && styles.pressedScale,
                            ]}
                            onPress={() => setSelectedOption('30')}
                        >
                            <Text style={[styles.quickSelectIcon, selectedOption === '30' && styles.quickSelectIconActive]}>timer_10_select</Text>
                            <Text style={[styles.quickSelectLabel, selectedOption === '30' && styles.quickSelectLabelActive]}>In 30 mins</Text>
                        </Pressable>

                        {/* In 1 hour (Active) */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.quickSelectCard,
                                styles.quickSelectCardActive, // Default Active
                                pressed && styles.pressedScale,
                            ]}
                            onPress={() => setSelectedOption('60')}
                        >
                            <View style={styles.activeCardOverlay} />
                            <Text style={[styles.quickSelectIcon, styles.quickSelectIconActive]}>hourglass_top</Text>
                            <Text style={[styles.quickSelectLabel, styles.quickSelectLabelActive]}>In 1 hour</Text>
                            <View style={styles.activeIndicator} />
                        </Pressable>

                        {/* After next meal */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.quickSelectCard,
                                selectedOption === 'meal' && styles.quickSelectCardActive,
                                pressed && styles.pressedScale,
                            ]}
                            onPress={() => setSelectedOption('meal')}
                        >
                            <Text style={[styles.quickSelectIcon, { color: '#006e28' }, selectedOption === 'meal' && styles.quickSelectIconActive]}>restaurant</Text>
                            <Text style={[styles.quickSelectLabel, selectedOption === 'meal' && styles.quickSelectLabelActive]}>After next meal</Text>
                        </Pressable>

                    </View>

                    {/* Custom Time Input */}
                    <Pressable style={({ pressed }) => [styles.customTimeRow, pressed && styles.pressedScale]}>
                        <View style={styles.customTimeLeft}>
                            <Text style={styles.customTimeIcon}>calendar_month</Text>
                            <Text style={styles.customTimeLabel}>Custom Time</Text>
                        </View>
                        <View style={styles.customTimeRight}>
                            <Text style={styles.customTimeValue}>10:00 AM</Text>
                            <Text style={styles.customTimeChevron}>chevron_right</Text>
                        </View>
                    </Pressable>

                    {/* Bottom Spacer for Button */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Fixed Bottom Action Area */}
                <View style={styles.bottomActionArea}>
                    <View style={styles.bottomActionContainer}>
                        <Pressable
                            style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
                            onPress={handleConfirmNewTime}
                        >
                            <Text style={styles.confirmIcon}>check_circle</Text>
                            <Text style={styles.confirmText}>Confirm New Time</Text>
                        </Pressable>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8fb', // surface
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20, // margin-mobile
        paddingTop: 0,
        paddingBottom: 20,
    },

    // --- Top Nav ---
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 64,
        backgroundColor: 'rgba(252, 248, 251, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 50,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    closeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    brandText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#0058bc',
    },
    navSpacer: {
        width: 40,
    },

    // --- Ambient Backgrounds ---
    ambientBlob1: {
        position: 'absolute',
        top: 80,
        right: 0,
        width: 256,
        height: 256,
        backgroundColor: 'rgba(0, 112, 235, 0.2)',
        borderRadius: 128,
        opacity: 0.5,
        zIndex: -10,
        pointerEvents: 'none',
    },
    ambientBlob2: {
        position: 'absolute',
        bottom: 160,
        left: 0,
        width: 192,
        height: 192,
        backgroundColor: 'rgba(88, 86, 214, 0.15)',
        borderRadius: 96,
        opacity: 0.5,
        zIndex: -10,
        pointerEvents: 'none',
    },

    // --- Header ---
    headerSection: {
        marginBottom: 24,
        marginTop: 8,
    },
    mainTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.01,
        color: '#1b1b1d',
        marginBottom: 8,
        textAlign: 'center',
    },
    mainSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755',
        textAlign: 'center',
        maxWidth: 350,
        alignSelf: 'center',
    },

    // --- Context Card ---
    contextCard: {
        backgroundColor: 'rgba(252, 248, 251, 0.85)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#1f2687',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 32,
        elevation: 3,
    },
    contextIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0edef', // surface-container
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
    },
    contextIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
    },
    contextTextContainer: {
        flex: 1,
    },
    contextTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 4,
    },
    contextSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },

    // --- Quick Select ---
    sectionTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 12,
    },
    quickSelectGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    quickSelectCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#ffffff', // surface-container-lowest
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.4)',
        gap: 8,
    },
    quickSelectCardActive: {
        backgroundColor: '#0058bc', // primary-container
        borderColor: '#0058bc',
        shadowColor: '#0070eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
        position: 'relative',
    },
    activeCardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    activeIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffffff',
    },
    quickSelectIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#5856D6', // status-rescheduled
    },
    quickSelectIconActive: {
        color: '#ffffff',
    },
    quickSelectLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#1b1b1d',
    },
    quickSelectLabelActive: {
        color: '#ffffff',
        fontWeight: '600',
    },

    // --- Custom Time ---
    customTimeRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.4)',
    },
    customTimeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    customTimeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    customTimeLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#1b1b1d',
    },
    customTimeRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    customTimeValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },
    customTimeChevron: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#414755',
    },

    // --- Bottom Action ---
    bottomSpacer: {
        height: 100,
    },
    bottomActionArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(252, 248, 251, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(193, 198, 215, 0.2)',
        paddingTop: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.03,
        shadowRadius: 24,
        elevation: 10,
        zIndex: 40,
    },
    bottomActionContainer: {
        paddingHorizontal: 20,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    confirmButton: {
        width: '100%',
        backgroundColor: '#0058bc',
        paddingVertical: 16,
        borderRadius: 999,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.9,
    },
    confirmIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#ffffff',
    },
    confirmText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },

    // --- Common ---
    pressedScale: {
        transform: [{ scale: 0.95 }],
    },
});