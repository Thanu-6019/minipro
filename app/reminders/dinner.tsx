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

export default function DinnerCheckIn() {
    const router = useRouter();
    const { name, dosage, reminderId } = useLocalSearchParams<{ name: string; dosage: string; reminderId: string }>();
    const medName = name || 'Medicine';
    const medDosage = dosage || '';
    const pulseAnim1 = useMemo(() => new Animated.Value(0), []);
    const pulseAnim2 = useMemo(() => new Animated.Value(0), []);

    useEffect(() => {
        // Ring 1
        const anim1 = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim1, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.bezier(0.215, 0.61, 0.355, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim1, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        anim1.start();

        // Ring 2 (With 1 second offset)
        const anim2 = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim2, {
                    toValue: 1,
                    duration: 3000,
                    delay: -1000, // Offset animation
                    easing: Easing.bezier(0.215, 0.61, 0.355, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim2, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        anim2.start();
        return () => {
            anim1.stop();
            anim2.stop();
        };
    }, [pulseAnim1, pulseAnim2]);

    const ringScale1 = pulseAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.5],
    });
    const ringOpacity1 = pulseAnim1.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 0.1, 0],
    });

    const ringScale2 = pulseAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.5],
    });
    const ringOpacity2 = pulseAnim2.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 0.1, 0],
    });

    return (
        <View style={styles.container}>

            {/* Soft Atmospheric Background Gradient */}
            <View style={styles.backgroundGradient} />

            <SafeAreaView style={styles.safeArea}>

                {/* Top Nav Action (Close) - Transactional Intent */}
                <View style={styles.topNav}>
                    <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.pressedScale]} onPress={() => router.back()} accessibilityLabel="Close" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.closeIcon}>close</Text>
                    </Pressable>
                </View>

                {/* Main Content Canvas */}
                <View style={styles.mainContent}>

                    {/* Central Icon Graphic with Subtle Animation */}
                    <View style={styles.heroContainer}>
                        <Animated.View
                            style={[
                                styles.pulseRing,
                                {
                                    transform: [{ scale: ringScale1 }],
                                    opacity: ringOpacity1,
                                }
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.pulseRing,
                                {
                                    transform: [{ scale: ringScale2 }],
                                    opacity: ringOpacity2,
                                }
                            ]}
                        />

                        <View style={styles.glassIconPanel}>
                            <Text style={styles.iconMoon}>clear_night</Text>
                        </View>
                    </View>

                    {/* Typography Cluster */}
                    <View style={styles.textCluster}>
                        <Text style={styles.mainTitle}>Evening Meal?</Text>
                        <Text style={styles.mainSubtitle}>
                            A consistent routine with your dinner supports your long-term health.
                        </Text>
                    </View>

                    {/* Action Buttons Layout */}
                    <View style={styles.actionContainer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={() => router.push(`/reminders/dose-logged?reminderId=${reminderId}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}&takenAt=${encodeURIComponent(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}` as any)}
                            accessibilityLabel="Confirm dinner finished"
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonIcon}>restaurant</Text>
                            <Text style={styles.primaryButtonText}>Dinner is Done</Text>
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
                            <Text style={styles.secondaryButtonText}>Reschedule for Later</Text>
                        </Pressable>
                    </View>

                    {/* Contextual Footer Metadata */}
                    <View style={styles.footerPill}>
                        <Text style={styles.footerIcon}>pill</Text>
                        <Text style={styles.footerText}>SCHEDULED WITH {medName.toUpperCase()} {medDosage.toUpperCase()}</Text>
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
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Simulating the gradient via stacked overlays
        backgroundColor: '#fcf8fb',
    },
    safeArea: {
        flex: 1,
    },

    // --- Top Nav ---
    topNav: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        height: 64,
        paddingTop: 8,
        zIndex: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(228, 226, 228, 0.5)', // surface-container-high/50
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755', // on-surface-variant
    },

    // --- Main Content ---
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // margin-mobile
        paddingBottom: 40,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },

    // --- Hero Icon ---
    heroContainer: {
        width: 192,
        height: 192,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    pulseRing: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 96,
        backgroundColor: 'rgba(0, 88, 188, 0.1)',
    },
    glassIconPanel: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconMoon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 64,
        color: '#0058bc', // primary
    },

    // --- Typography ---
    textCluster: {
        alignItems: 'center',
        marginBottom: 48,
        width: '100%',
        gap: 16,
    },
    mainTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.01,
        color: '#1b1b1d', // on-surface
        textAlign: 'center',
    },
    mainSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755', // on-surface-variant
        textAlign: 'center',
        maxWidth: 280,
        opacity: 0.9,
        lineHeight: 22,
    },

    // --- Actions ---
    actionContainer: {
        width: '100%',
        gap: 4, // gap-xs
        marginTop: 'auto',
        paddingBottom: 24,
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
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        marginTop: 4, // mt-xs
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
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#1b1b1d', // on-surface
    },
    secondaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },

    // --- Footer Metadata ---
    footerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: 'rgba(111, 251, 133, 0.3)', // secondary-container/30
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(111, 251, 133, 0.5)',
    },
    footerIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#006e28', // secondary
    },
    footerText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#00732a', // on-secondary-container
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    // --- Common ---
    pressedScale: {
        transform: [{ scale: 0.95 }],
    },
});