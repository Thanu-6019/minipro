import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../../src/features/settings/hooks/useSettings';

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

export default function NotificationsScreen() {
    const router = useRouter();
    const { settings, updateSettings } = useSettings();

    const pushEnabled = settings.pushEnabled;
    const criticalEnabled = settings.criticalEnabled;
    const leadTime = settings.leadTime;

    const leadTimeLabels = ["1 hr", "2 hrs", "1 day", "2 days", "1 wk"];
    const leadTimeDisplay = ["1 Hour Before", "2 Hours Before", "1 Day Before", "2 Days Before", "1 Week Before"];

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
                <Text style={styles.appBarTitle}>Notifications</Text>
                <View style={styles.topBarSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Text */}
                <Text style={styles.headerText}>
                    Manage how and when MedTrack AI alerts you. We recommend keeping critical alerts on for your safety.
                </Text>

                {/* 1. Medication Alerts Card */}
                <View style={styles.glassCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconContainer, { backgroundColor: '#0070eb' }]}>
                            <Text style={[styles.cardIcon, { color: '#ffffff' }]}>notifications_active</Text>
                        </View>
                        <Text style={styles.cardTitle}>Medication Alerts</Text>
                    </View>

                    <View style={styles.settingsList}>
                        {/* Push Notifications */}
                        <View style={[styles.settingRow, styles.settingRowBorder]}>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Push Notifications</Text>
                                <Text style={styles.settingDesc}>Receive standard reminders on your device.</Text>
                            </View>
                            <ToggleSwitch value={pushEnabled} onValueChange={() => updateSettings({ pushEnabled: !pushEnabled })} label="Push notifications" />
                        </View>

                        {/* Critical Alerts */}
                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Critical Alerts</Text>
                                <Text style={styles.settingDesc}>Bypass &quot;Do Not Disturb&quot; for missed essential medications.</Text>
                            </View>
                            <ToggleSwitch value={criticalEnabled} onValueChange={() => updateSettings({ criticalEnabled: !criticalEnabled })} label="Critical alerts" />
                        </View>
                    </View>
                </View>

                {/* 2. Meal-Aware System Card */}
                <View style={styles.glassCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconContainer, { backgroundColor: '#a649d5' }]}>
                            <Text style={[styles.cardIcon, { color: '#ffffff' }]}>restaurant</Text>
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Meal-Aware System</Text>
                            <Text style={styles.cardSubtitle}>Smart Scheduling</Text>
                        </View>
                    </View>

                    <Text style={styles.cardDesc}>
                        Configure your typical meal times so we can accurately remind you to take medications &quot;with food&quot; or &quot;on an empty stomach.&quot;
                    </Text>

                    <View style={styles.mealGrid}>
                        {/* Breakfast */}
                        <View style={styles.mealBox}>
                            <View style={styles.mealLabelRow}>
                                <Text style={styles.mealIcon}>light_mode</Text>
                                <Text style={styles.mealLabel}>Breakfast</Text>
                            </View>
                            <Text style={styles.mealTime}>08:00</Text>
                        </View>

                        {/* Lunch */}
                        <View style={styles.mealBox}>
                            <View style={styles.mealLabelRow}>
                                <Text style={styles.mealIcon}>wb_sunny</Text>
                                <Text style={styles.mealLabel}>Lunch</Text>
                            </View>
                            <Text style={styles.mealTime}>13:00</Text>
                        </View>

                        {/* Dinner */}
                        <View style={styles.mealBox}>
                            <View style={styles.mealLabelRow}>
                                <Text style={styles.mealIcon}>dark_mode</Text>
                                <Text style={styles.mealLabel}>Dinner</Text>
                            </View>
                            <Text style={styles.mealTime}>19:00</Text>
                        </View>
                    </View>
                </View>

                {/* 3. Appointment Reminders Card */}
                <View style={styles.glassCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconContainer, { backgroundColor: '#6ffb85' }]}>
                            <Text style={[styles.cardIcon, { color: '#00732a' }]}>calendar_month</Text>
                        </View>
                        <Text style={styles.cardTitle}>Appointment Reminders</Text>
                    </View>

                    <Text style={styles.cardDesc}>
                        Adjust how early you want to be notified about upcoming doctor visits or lab tests.
                    </Text>

                    <View style={styles.leadTimeContainer}>
                        <View style={styles.leadTimeHeader}>
                            <Text style={styles.leadTimeLabel}>Lead Time</Text>
                            <Text style={styles.leadTimeValue}>{leadTimeDisplay[leadTime - 1]}</Text>
                        </View>

                        {/* Custom Visual Slider Track */}
                        <View style={styles.sliderTrackContainer}>
                            <View style={styles.sliderTrack} />
                            <View style={[styles.sliderFill, { width: `${((leadTime - 1) / 4) * 100}%` }]} />

                            {/* Knob */}
                            <View style={[styles.sliderKnob, { left: `${((leadTime - 1) / 4) * 100}%` }]} />
                        </View>

                        {/* Step Labels */}
                        <View style={styles.sliderLabels}>
                            {leadTimeLabels.map((label, index) => (
                                <Pressable
                                    key={index}
                                    style={styles.sliderLabelItem}
                                    onPress={() => updateSettings({ leadTime: index + 1 })}
                                    accessibilityLabel={`Set lead time to ${leadTimeDisplay[index]}`}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: leadTime === index + 1 }}
                                >
                                    <Text style={[styles.sliderLabelText, leadTime === index + 1 && styles.sliderLabelActive]}>
                                        {label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem} accessibilityLabel="Dashboard" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>dashboard</Text>
                    <Text style={styles.navLabel}>Dashboard</Text>
                </Pressable>
                <Pressable style={styles.navItem} accessibilityLabel="Meds" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>medication</Text>
                    <Text style={styles.navLabel}>Meds</Text>
                </Pressable>
                <Pressable style={styles.navItem} accessibilityLabel="Insights" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>analytics</Text>
                    <Text style={styles.navLabel}>Insights</Text>
                </Pressable>
                <Pressable style={[styles.navItem, styles.navItemActive]} accessibilityLabel="Profile" accessibilityRole="tab" accessibilityState={{ selected: true }}>
                    <Text style={[styles.navIcon, styles.navIconActive]}>person</Text>
                    <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
                </Pressable>
            </View>

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
    topBarSpacer: { width: 40 },

    // --- Header Text ---
    headerText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginBottom: 24,
        lineHeight: 20,
    },

    // --- Generic Card ---
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
        gap: 12,
        marginBottom: 16,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
    },
    cardTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    cardSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#717786',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginBottom: 16,
    },

    // --- 1. Medication Alerts ---
    settingsList: { marginTop: 4 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#e4e2e4',
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

    // --- 2. Meal-Aware System ---
    mealGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    mealBox: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#f6f3f5',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    mealLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mealIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#414755',
    },
    mealLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755',
    },
    mealTime: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#1b1b1d',
        textAlign: 'center',
    },

    // --- 3. Appointment Reminders & Slider ---
    leadTimeContainer: { marginTop: 16 },
    leadTimeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leadTimeLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#1b1b1d',
        fontWeight: '600',
    },
    leadTimeValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        color: '#0058bc',
        fontWeight: '600',
    },
    sliderTrackContainer: {
        height: 24,
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 8,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: '#e4e2e4',
        borderRadius: 2,
        width: '100%',
    },
    sliderFill: {
        position: 'absolute',
        height: 4,
        backgroundColor: '#0058bc',
        borderRadius: 2,
        left: 0,
        top: 10,
    },
    sliderKnob: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#0058bc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
        top: 2,
        marginLeft: -10,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    sliderLabelItem: {
        alignItems: 'center',
    },
    sliderLabelText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#717786',
    },
    sliderLabelActive: {
        color: '#0058bc',
        fontWeight: 'bold',
    },

    // --- Bottom Nav ---
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        paddingTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    navItemActive: {
        backgroundColor: 'rgba(0, 112, 235, 0.2)',
        paddingHorizontal: 16,
        borderRadius: 999,
    },
    navIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        marginBottom: 2,
        color: '#414755',
    },
    navIconActive: {
        color: '#0058bc',
    },
    navLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },
    navLabelActive: {
        color: '#0058bc',
        fontWeight: '600',
    },
});