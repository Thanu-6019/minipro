import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Animated,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DoseLoggedConfirmation() {
    const router = useRouter();
    const { name, dosage, takenAt } = useLocalSearchParams<{ name: string; dosage: string; takenAt: string }>();
    const medName = name || 'Medicine';
    const medDosage = dosage || '';
    const loggedTime = takenAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // --- Animations ---
    // 1. Scale In for Success Icon
    const scaleAnim = useMemo(() => new Animated.Value(0.9), []);
    const scaleOpacity = useMemo(() => new Animated.Value(0), []);

    // 2. Float Up for Summary Card (delay 100ms)
    const cardOpacity = useMemo(() => new Animated.Value(0), []);
    const cardTranslate = useMemo(() => new Animated.Value(20), []);

    // 3. Float Up for Buttons (delay 200ms)
    const btnOpacity = useMemo(() => new Animated.Value(0), []);
    const btnTranslate = useMemo(() => new Animated.Value(20), []);

    // 4. Outer glow pulse for the ring
    const glowAnim = useMemo(() => new Animated.Value(1), []);

    useEffect(() => {
        // Step 1: Scale In Icon
        const anim1 = Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]);
        anim1.start();

        // Step 2: Float Up Card (delay 100ms)
        const anim2 = Animated.sequence([
            Animated.delay(100),
            Animated.parallel([
                Animated.timing(cardOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(cardTranslate, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]);
        anim2.start();

        // Step 3: Float Up Buttons (delay 200ms)
        const anim3 = Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(btnOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(btnTranslate, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]);
        anim3.start();

        // Step 4: Infinite pulse for the outer ring
        const anim4 = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1.1, // scale slightly
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        anim4.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
            anim4.stop();
        };
    }, [scaleAnim, scaleOpacity, cardOpacity, cardTranslate, btnOpacity, btnTranslate, glowAnim]);

    return (
        <View style={styles.container}>

            {/* Ambient Background Blur */}
            <View style={styles.ambientContainer}>
                <View style={styles.ambientBlob1} />
                <View style={styles.ambientBlob2} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentWrapper}>

                    {/* Success Icon Container */}
                    <Animated.View
                        style={[
                            styles.iconSection,
                            {
                                opacity: scaleOpacity,
                                transform: [{ scale: scaleAnim }],
                            }
                        ]}
                    >
                        <View style={styles.iconOuterRing}>
                            {/* Outer glowing ring */}
                            <Animated.View
                                style={[
                                    styles.iconPulseRing,
                                    {
                                        transform: [{ scale: glowAnim }]
                                    }
                                ]}
                            />
                            {/* Inner solid circle */}
                            <View style={styles.iconInnerCircle}>
                                <Text style={styles.iconCheck}>check_circle</Text>
                            </View>
                        </View>
                        <Text style={styles.iconTitle}>Dose Logged</Text>
                        <Text style={styles.iconSubtitle}>
                            Your medication schedule is updated and you&apos;re right on track.
                        </Text>
                    </Animated.View>

                    {/* Dose Summary Card */}
                    <Animated.View
                        style={[
                            styles.summaryCard,
                            {
                                opacity: cardOpacity,
                                transform: [{ translateY: cardTranslate }],
                            }
                        ]}
                    >
                        <View style={styles.summaryHeader}>
                            <View style={styles.summaryIconContainer}>
                                <Text style={styles.summaryIcon}>medication</Text>
                            </View>
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryTitle}>{medName}</Text>
                                <Text style={styles.summarySubtitle}>{medDosage}</Text>
                            </View>
                        </View>

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryFooter}>
                            <View style={styles.summaryTimeLeft}>
                                <Text style={styles.summaryTimeIcon}>schedule</Text>
                                <Text style={styles.summaryTimeLabel}>Taken at</Text>
                            </View>
                            <Text style={styles.summaryTimeValue}>{loggedTime}</Text>
                        </View>
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View
                        style={[
                            styles.actionContainer,
                            {
                                opacity: btnOpacity,
                                transform: [{ translateY: btnTranslate }],
                            }
                        ]}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={() => router.replace('/(tabs)')}
                            accessibilityLabel="Back to Dashboard"
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonText}>
                                Back to Dashboard <Text style={styles.primaryButtonIcon}>arrow_forward</Text>
                            </Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && styles.secondaryButtonPressed,
                            ]}
                            onPress={() => router.back()}
                            accessibilityLabel="Undo dose entry"
                            accessibilityRole="button"
                        >
                            <Text style={styles.secondaryButtonText}>Undo Entry</Text>
                        </Pressable>
                    </Animated.View>

                </View>
            </SafeAreaView>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8fb', // background
    },

    // --- Ambient Background ---
    ambientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
    },
    ambientBlob1: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        aspectRatio: 1,
        borderRadius: 999,
        backgroundColor: 'rgba(0, 88, 188, 0.05)',
    },
    ambientBlob2: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        aspectRatio: 1,
        borderRadius: 999,
        backgroundColor: 'rgba(52, 199, 89, 0.05)',
    },

    // --- Layout ---
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // margin-mobile
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },

    // --- Success Icon Section ---
    iconSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconOuterRing: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    iconPulseRing: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 64,
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.2)',
    },
    iconInnerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#34C759', // status-taken
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 10,
    },
    iconCheck: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 48,
        color: '#ffffff',
    },
    iconTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        color: '#1b1b1d', // on-surface
        textAlign: 'center',
        marginBottom: 8,
    },
    iconSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755', // on-surface-variant
        textAlign: 'center',
        maxWidth: 280,
    },

    // --- Summary Card ---
    summaryCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 32,
        elevation: 5,
        marginBottom: 24,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 88, 188, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        color: '#0058bc',
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 4,
    },
    summarySubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#e4e2e4', // surface-variant
        opacity: 0.5,
        marginVertical: 16,
    },
    summaryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryTimeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    summaryTimeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#414755',
    },
    summaryTimeLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755',
    },
    summaryTimeValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d',
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
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 5,
    },
    primaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
    },
    primaryButtonIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    secondaryButtonText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    secondaryButtonPressed: {
        backgroundColor: 'rgba(0, 88, 188, 0.05)',
    },
});