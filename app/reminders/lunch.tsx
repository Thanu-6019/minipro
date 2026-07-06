import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Animated,
    Platform,
    Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LunchCheckIn() {
    const router = useRouter();
    const { name, dosage, reminderId } = useLocalSearchParams<{ name: string; dosage: string; reminderId: string }>();
    const medName = name || 'Medicine';
    const medDosage = dosage || '';
    const breatheAnim = useMemo(() => new Animated.Value(0), []);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, {
                    toValue: 1,
                    duration: 8000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breatheAnim, {
                    toValue: 0,
                    duration: 8000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [breatheAnim]);

    const breatheScale = breatheAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });
    const breatheOpacity = breatheAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0.8],
    });

    return (
        <View style={styles.container}>

            {/* Ambient Background Animation */}
            <Animated.View
                style={[
                    styles.ambientBlur,
                    {
                        transform: [{ scale: breatheScale }],
                        opacity: breatheOpacity,
                    }
                ]}
            />

            <SafeAreaView style={styles.safeArea}>

                {/* Top App Bar */}
                <View style={styles.topAppBar}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarIcon}>person</Text>
                    </View>
                    <Text style={styles.appBarTitle}>MedTrack AI</Text>
                    <Pressable style={styles.notificationButton} accessibilityLabel="Notifications" accessibilityRole="button">
                        <Text style={styles.notificationIcon}>notifications</Text>
                    </Pressable>
                </View>

                {/* Main Content Canvas */}
                <View style={styles.mainContent}>

                    {/* Glassmorphic Card Container */}
                    <View style={styles.glassCard}>

                        {/* Icon Area */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconGlow} />
                            <Text style={styles.iconSun}>sunny</Text>
                        </View>

                        {/* Typography */}
                        <Text style={styles.mainTitle}>Ready for Lunch?</Text>
                        <Text style={styles.mainSubtitle}>
                            Taking {medName} after your meal helps reduce side effects.
                        </Text>

                        {/* Actions */}
                        <View style={styles.actionContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={() => router.push(`/reminders/dose-logged?reminderId=${reminderId}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}&takenAt=${encodeURIComponent(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}` as any)}
                                accessibilityLabel="Confirm lunch finished"
                                accessibilityRole="button"
                            >
                                <Text style={styles.primaryButtonIcon}>restaurant</Text>
                                <Text style={styles.primaryButtonText}>I&apos;ve Finished Lunch</Text>
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
                                <Text style={styles.secondaryButtonText}>Eating Later</Text>
                            </Pressable>
                        </View>

                    </View>

                    {/* Footer Context Pill */}
                    <View style={styles.footerPill}>
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
        backgroundColor: '#fcf8fb', // surface
        overflow: 'hidden',
    },
    ambientBlur: {
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        backgroundColor: 'rgba(216, 226, 255, 0.4)', // primary-fixed with opacity
        borderRadius: 999,
        zIndex: -1,
        pointerEvents: 'none',
    },
    safeArea: {
        flex: 1,
    },

    // --- Top App Bar ---
    topAppBar: {
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
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0070eb', // primary-container
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#fefcff', // on-primary-container
    },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#0058bc', // primary
    },
    notificationButton: {
        padding: 4,
    },
    notificationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
    },

    // --- Main Content ---
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },

    // --- Glass Card ---
    glassCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(228, 226, 228, 0.5)', // surface-variant/50
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
        elevation: 5,
    },

    // --- Icon ---
    iconContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#ffffff', // surface-light
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 64,
        backgroundColor: 'rgba(0, 88, 188, 0.1)',
    },
    iconSun: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 64,
        color: '#0058bc', // primary
        zIndex: 10,
    },

    // --- Typography ---
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
        marginBottom: 24,
    },

    // --- Actions ---
    actionContainer: {
        width: '100%',
        gap: 12,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: '#eae7ea', // surface-container-high
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    primaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#ffffff',
    },
    primaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc', // primary
    },
    secondaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#0058bc',
    },

    // --- Footer Pill ---
    footerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(240, 237, 239, 0.5)', // surface-container/50
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        marginTop: 24,
    },
    footerIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#717786', // outline
    },
    footerText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755', // on-surface-variant
    },
});