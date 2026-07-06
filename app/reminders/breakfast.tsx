import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MealCheckin() {
    const router = useRouter();
    const { name, dosage, reminderId } = useLocalSearchParams<{ name: string; dosage: string; reminderId: string }>();
    const medName = name || 'Medicine';
    const medDosage = dosage || '';
    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <View style={styles.gradientBackground} />

            <SafeAreaView style={styles.safeArea}>

                {/* Top App Bar */}
                <View style={styles.topAppBar}>
                    <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.pressedScale]} onPress={() => router.back()} accessibilityLabel="Close" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.closeIcon}>close</Text>
                    </Pressable>
                </View>

                {/* Main Canvas */}
                <View style={styles.mainContent}>

                    {/* Central Visualization */}
                    <View style={styles.heroContainer}>
                        {/* Subtle glow behind icon */}
                        <View style={styles.heroGlow} />

                        {/* Glass Panel Main Icon */}
                        <View style={styles.heroGlassPanel}>
                            <Text style={styles.heroIcon}>restaurant</Text>
                        </View>

                        {/* Decorative floating element */}
                        <View style={styles.heroFloatingElement}>
                            <Text style={styles.heroFloatingIcon}>light_mode</Text>
                        </View>
                    </View>

                    {/* Typography Context */}
                    <View style={styles.textContainer}>
                        <Text style={styles.mainTitle}>Time for Breakfast?</Text>
                        <Text style={styles.mainSubtitle}>
                            Taking your medicine with food ensures better absorption and less stomach upset.
                        </Text>
                    </View>

                    {/* Action Area */}
                    <View style={styles.actionContainer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={() => router.push(`/reminders/dose-logged?reminderId=${reminderId}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}&takenAt=${encodeURIComponent(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}` as any)}
                            accessibilityLabel="Confirm breakfast eaten"
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonIcon}>check_circle</Text>
                            <Text style={styles.primaryButtonText}>Yes, I&apos;ve Eaten</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={() => router.push(`/reminders/reschedule?reminderId=${reminderId}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}` as any)}
                            accessibilityLabel="Reschedule for later"
                            accessibilityRole="button"
                        >
                            <Text style={styles.secondaryButtonIcon}>schedule</Text>
                            <Text style={styles.secondaryButtonText}>Not Yet, Remind Me Later</Text>
                        </Pressable>
                    </View>

                    {/* Context Footer */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerIcon}>pill</Text>
                        <Text style={styles.footerText}>Scheduled with {medName} {medDosage}</Text>
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
        backgroundColor: '#fcf8fb', // surface fallback
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Linear gradient approximation via opacity overlays
        backgroundColor: '#fcf8fb',
    },
    safeArea: {
        flex: 1,
    },

    // --- Top App Bar ---
    topAppBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        height: 64,
        paddingTop: 8,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0edef', // surface-container
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#1b1b1d', // on-surface
    },

    // --- Main Layout ---
    mainContent: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20, // margin-mobile
        paddingBottom: 48,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },

    // --- Hero Visualization ---
    heroContainer: {
        position: 'relative',
        width: 192,
        height: 192,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#d8e2ff', // primary-fixed
        borderRadius: 96,
        opacity: 0.6,
    },
    heroGlassPanel: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 30,
        elevation: 5,
    },
    heroIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 64,
        color: '#0058bc', // primary
    },
    heroFloatingElement: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    heroFloatingIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
        color: '#FF9500', // status-pending
    },

    // --- Text Context ---
    textContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    mainTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.01,
        color: '#1b1b1d', // on-surface
        textAlign: 'center',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755', // on-surface-variant
        textAlign: 'center',
        maxWidth: 280,
    },

    // --- Actions ---
    actionContainer: {
        width: '100%',
        gap: 12,
        marginTop: 'auto',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#0058bc', // primary
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 5,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: '#f0edef', // surface-container
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
    },
    buttonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.9,
    },
    primaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#ffffff',
    },
    primaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755', // on-surface-variant
    },
    secondaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d', // on-surface
    },

    // --- Footer ---
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#f6f3f5', // surface-container-low
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e4e2e4', // surface-variant
        marginTop: 24,
    },
    footerIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
        color: '#0058bc', // primary
    },
    footerText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755', // on-surface-variant
    },

    // --- Common ---
    pressedScale: {
        transform: [{ scale: 0.95 }],
    },
});