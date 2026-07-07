import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../../src/features/settings/hooks/useSettings';
import UnifiedBottomNav from '@/components/UnifiedBottomNav';

// --- Custom Toggle Switch Component ---
const ToggleSwitch = ({ value, onValueChange, label }: { value: boolean; onValueChange: () => void; label: string }) => {
    return (
        <Pressable
            style={[styles.toggleContainer, { backgroundColor: value ? '#0058bc' : '#e4e2e4' }]}
            onPress={onValueChange}
            accessibilityLabel={label}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
        >
            <View style={[styles.toggleKnob, { transform: [{ translateX: value ? 24 : 0 }] }]} />
        </Pressable>
    );
};

export default function PrivacyDataScreen() {
    const router = useRouter();
    const { settings, updateSettings } = useSettings();

    const biometricEnabled = settings.biometricEnabled;
    const shareEnabled = settings.shareEnabled;

    const pulseAnim = useMemo(() => new Animated.Value(1), []);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>

            {/* TopAppBar */}
            <View style={styles.topAppBar}>
                <Pressable
                    style={styles.topBarButton}
                    onPress={() => router.back()}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.topBarIcon}>arrow_back</Text>
                </Pressable>
                <Text style={styles.appBarTitle}>Privacy &amp; Data</Text>
                <Pressable
                    style={styles.topBarButton}
                    accessibilityLabel="Settings"
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.topBarIcon}>settings</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerIconContainer}>
                        <Text style={styles.headerIcon}>shield_lock</Text>
                    </View>
                    <Text style={styles.headerTitle}>Your Data is Secure</Text>
                    <Text style={styles.headerDesc}>
                        We use end-to-end encryption to ensure your medical history remains private. You control who sees your data.
                    </Text>
                </View>

                {/* 1. Privacy Control Card */}
                <View style={styles.glassCard}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardHeaderIcon, { color: '#0058bc' }]}>security</Text>
                        <Text style={styles.cardHeaderTitle}>Privacy Control</Text>
                    </View>

                    <View style={styles.settingsList}>
                        {/* Biometric Unlock */}
                        <View style={[styles.settingRow, styles.settingRowBorder]}>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Biometric Unlock</Text>
                                <Text style={styles.settingDesc}>Require FaceID or TouchID to open MedTrack AI.</Text>
                            </View>
                            <ToggleSwitch value={biometricEnabled} onValueChange={() => updateSettings({ biometricEnabled: !biometricEnabled })} label="Biometric unlock" />
                        </View>

                        {/* Share with Provider */}
                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Share with Healthcare Provider</Text>
                                <Text style={styles.settingDesc}>Automatically share weekly insight summaries with your primary care physician.</Text>
                            </View>
                            <ToggleSwitch value={shareEnabled} onValueChange={() => updateSettings({ shareEnabled: !shareEnabled })} label="Share with healthcare provider" />
                        </View>
                    </View>
                </View>

                {/* 2. Data Management Card */}
                <View style={styles.glassCard}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardHeaderIcon, { color: '#0058bc' }]}>dataset</Text>
                        <Text style={styles.cardHeaderTitle}>Data Management</Text>
                    </View>

                    {/* Cloud Sync Status */}
                    <View style={styles.syncStatusRow}>
                        <View style={styles.syncLeft}>
                            <Animated.View style={[styles.syncIconContainer, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.syncIcon}>cloud_sync</Text>
                            </Animated.View>
                            <View>
                                <Text style={styles.syncTitle}>Cloud Sync Active</Text>
                                <Text style={styles.syncSub}>Last synced: Just now</Text>
                            </View>
                        </View>
                        <Pressable
                            accessibilityLabel="Sync now"
                            accessibilityRole="button"
                        >
                            <Text style={styles.syncAction}>Sync Now</Text>
                        </Pressable>
                    </View>

                    {/* Export Actions */}
                    <View style={styles.exportSection}>
                        <Text style={styles.exportDesc}>
                            Download a copy of your health records, medication history, and logged insights.
                        </Text>
                        <View style={styles.exportGrid}>
                            <Pressable
                                style={({ pressed }) => [styles.exportButton, styles.exportButtonPrimary, pressed && styles.pressedScale]}
                                accessibilityLabel="Export PDF"
                                accessibilityRole="button"
                            >
                                <Text style={styles.exportIcon}>picture_as_pdf</Text>
                                <Text style={styles.exportTextPrimary}>Export PDF</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.exportButton, styles.exportButtonSecondary, pressed && styles.pressedScale]}
                                accessibilityLabel="Export CSV"
                                accessibilityRole="button"
                            >
                                <Text style={styles.exportIcon}>csv</Text>
                                <Text style={styles.exportTextSecondary}>Export CSV</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Delete Action */}
                    <View style={styles.deleteRow}>
                        <Pressable
                            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressedScale]}
                            accessibilityLabel="Delete account and data"
                            accessibilityRole="button"
                        >
                            <View style={styles.deleteLeft}>
                                <Text style={styles.deleteIcon}>delete_forever</Text>
                                <Text style={styles.deleteText}>Delete Account &amp; Data</Text>
                            </View>
                            <Text style={styles.deleteChevron}>chevron_right</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <UnifiedBottomNav active="profile" />

        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8fb',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
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
    },
    topBarButton: { padding: 8, borderRadius: 20 },
    topBarIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#0058bc' },
    appBarTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 20, fontWeight: '600', color: '#1b1b1d' },

    // --- Header ---
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 88, 188, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 32,
        color: '#0058bc',
    },
    headerTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 8,
    },
    headerDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        textAlign: 'center',
        maxWidth: 350,
    },

    // --- Generic Card ---
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardHeaderIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
    },
    cardHeaderTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },

    // --- 1. Privacy Control ---
    settingsList: { marginTop: 4 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(228, 226, 228, 0.5)',
    },
    settingTextContainer: { flex: 1, paddingRight: 12 },
    settingTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 17,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    settingDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginTop: 4,
    },

    // --- Custom Toggle ---
    toggleContainer: {
        width: 48,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        padding: 2,
    },
    toggleKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },

    // --- 2. Data Management ---
    syncStatusRow: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e4e2e4',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    syncLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    syncIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#34C759',
    },
    syncTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 17,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    syncSub: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 13,
        color: '#414755',
    },
    syncAction: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
    },

    // --- Export Actions ---
    exportSection: { marginBottom: 16 },
    exportDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginBottom: 12,
    },
    exportGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    exportButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exportButtonPrimary: {
        backgroundColor: '#0070eb',
    },
    exportButtonSecondary: {
        backgroundColor: '#eae7ea',
    },
    exportIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#1b1b1d',
    },
    exportTextPrimary: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ffffff',
    },
    exportTextSecondary: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#1b1b1d',
    },

    // --- Delete Row ---
    deleteRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(228, 226, 228, 0.5)',
        paddingTop: 16,
    },
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    deleteLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#ba1a1a',
    },
    deleteText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 17,
        color: '#ba1a1a',
    },
    deleteChevron: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#c1c6d7',
    },

    // --- Common ---
    pressedScale: { transform: [{ scale: 0.95 }] },
});