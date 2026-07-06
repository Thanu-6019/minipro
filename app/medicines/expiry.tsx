import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';

export default function ExpiringSoon() {
    const avatarSource = useGenderAvatar();
    return (
        <View style={styles.container}>

            {/* Top App Bar */}
            <View style={styles.topAppBar}>
                <View style={styles.topBarLeft}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={avatarSource}
                            style={styles.profileImage}
                            accessibilityLabel="Profile avatar"
                        />
                    </View>
                    <Text style={styles.appBarTitle}>MedTrack AI</Text>
                </View>
                <Pressable style={styles.notificationButton} accessibilityLabel="Notifications" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.notificationIcon}>notifications</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Page Header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Expiring Soon</Text>
                    <Text style={styles.pageSubtitle}>
                        Manage your upcoming medication expirations to ensure treatment efficacy.
                    </Text>
                </View>

                {/* Critical Alerts Grid */}
                <View style={styles.alertsGrid}>

                    {/* Alert Card 1 */}
                    <View style={styles.alertCard}>
                        <View style={[styles.alertGlow, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]} />
                        <View style={styles.alertHeader}>
                            <View style={styles.alertStatus}>
                                <Text style={styles.alertStatusIcon}>warning</Text>
                                <Text style={[styles.alertStatusText, { color: '#FF9500' }]}>Expires in 12 days</Text>
                            </View>
                            <View style={styles.alertBadge}>
                                <Text style={styles.alertBadgeText}>Liquid</Text>
                            </View>
                        </View>
                        <View style={styles.alertBody}>
                            <Text style={styles.alertTitle}>Amoxicillin Suspension</Text>
                            <Text style={styles.alertSubtitle}>250mg/5mL • Dr. Smith</Text>
                        </View>
                    </View>

                    {/* Alert Card 2 */}
                    <View style={styles.alertCard}>
                        <View style={[styles.alertGlow, { backgroundColor: 'rgba(186, 26, 26, 0.05)' }]} />
                        <View style={styles.alertHeader}>
                            <View style={styles.alertStatus}>
                                <Text style={styles.alertStatusIcon}>error</Text>
                                <Text style={[styles.alertStatusText, { color: '#ba1a1a' }]}>Expired 2 days ago</Text>
                            </View>
                            <View style={styles.alertBadge}>
                                <Text style={styles.alertBadgeText}>EpiPen</Text>
                            </View>
                        </View>
                        <View style={styles.alertBody}>
                            <Text style={styles.alertTitle}>Epinephrine Auto-Injector</Text>
                            <Text style={styles.alertSubtitle}>0.3mg • Emergency</Text>
                        </View>
                    </View>

                </View>

                {/* Adherence Impact Card */}
                <View style={styles.impactCard}>
                    <View style={styles.impactGlow} />
                    <View style={styles.impactIconContainer}>
                        <Text style={styles.impactIcon}>health_and_safety</Text>
                    </View>
                    <View style={styles.impactTextContainer}>
                        <Text style={styles.impactTitle}>Why Fresh Stock Matters</Text>
                        <Text style={styles.impactSubtitle}>
                            Expired medications can lose potency or change in chemical composition over time, potentially compromising your treatment efficacy. Keeping your stock up-to-date ensures you receive the intended therapeutic benefit.
                        </Text>
                    </View>
                </View>

                {/* Quick Refill List */}
                <View style={styles.refillSection}>
                    <View style={styles.refillHeader}>
                        <Text style={styles.refillTitle}>Quick Refill Needed</Text>
                        <Pressable accessibilityLabel="View all" accessibilityRole="button">
                            <Text style={styles.refillViewAll}>View All</Text>
                        </Pressable>
                    </View>

                    <View style={styles.refillList}>

                        {/* Refill Item 1 */}
                        <View style={styles.refillItem}>
                            <View style={styles.refillIconContainer}>
                                <Text style={styles.refillIcon}>pill</Text>
                            </View>
                            <View style={styles.refillInfo}>
                                <Text style={styles.refillName}>Lisinopril 10mg</Text>
                                <Text style={styles.refillDetails}>Expires Next Month • Daily</Text>
                            </View>
                            <Pressable style={styles.reorderButton} accessibilityLabel="Reorder Lisinopril 10mg" accessibilityRole="button">
                                <Text style={styles.reorderText}>Reorder</Text>
                            </Pressable>
                        </View>

                        {/* Refill Item 2 */}
                        <View style={styles.refillItem}>
                            <View style={styles.refillIconContainer}>
                                <Text style={styles.refillIcon}>vaccines</Text>
                            </View>
                            <View style={styles.refillInfo}>
                                <Text style={styles.refillName}>Insulin Glargine</Text>
                                <Text style={styles.refillDetails}>Expires in 45 days • Refrigerated</Text>
                            </View>
                            <Pressable style={styles.reorderButton} accessibilityLabel="Reorder Insulin Glargine" accessibilityRole="button">
                                <Text style={styles.reorderText}>Reorder</Text>
                            </Pressable>
                        </View>

                    </View>
                </View>

                {/* Spacer for Bottom Nav */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem} accessibilityLabel="Home" accessibilityRole="button">
                    <Text style={styles.navIcon}>home</Text>
                    <Text style={styles.navLabel}>Home</Text>
                </Pressable>
                <Pressable style={[styles.navItem, styles.navItemActive]} accessibilityLabel="Medicines" accessibilityRole="button">
                    <Text style={[styles.navIcon, styles.navIconActive]}>pill</Text>
                    <Text style={[styles.navLabel, styles.navLabelActive]}>Meds</Text>
                </Pressable>
                <Pressable style={styles.navItem} accessibilityLabel="Scan" accessibilityRole="button">
                    <Text style={styles.navIcon}>document_scanner</Text>
                    <Text style={styles.navLabel}>Scan</Text>
                </Pressable>
                <Pressable style={styles.navItem} accessibilityLabel="Stats" accessibilityRole="button">
                    <Text style={styles.navIcon}>monitoring</Text>
                    <Text style={styles.navLabel}>Stats</Text>
                </Pressable>
                <Pressable style={styles.navItem} accessibilityLabel="Profile" accessibilityRole="button">
                    <Text style={styles.navIcon}>person</Text>
                    <Text style={styles.navLabel}>Profile</Text>
                </Pressable>
            </View>

        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8fb', // background
    },
    scrollContent: {
        paddingHorizontal: 20, // margin-mobile
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
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    profileContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#0058bc',
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },

    // --- Page Header ---
    pageHeader: {
        marginBottom: 24,
    },
    pageTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.01,
        color: '#1b1b1d',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },

    // --- Alerts Grid ---
    alertsGrid: {
        gap: 16,
        marginBottom: 24,
    },
    alertCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
        justifyContent: 'space-between',
    },
    alertGlow: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 128,
        height: 128,
        borderBottomLeftRadius: 128,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
    },
    alertStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    alertStatusIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
    },
    alertStatusText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
    },
    alertBadge: {
        backgroundColor: '#f0edef', // surface-container
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    alertBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },
    alertBody: {
        zIndex: 2,
    },
    alertTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 4,
    },
    alertSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },

    // --- Impact Card ---
    impactCard: {
        backgroundColor: 'rgba(0, 112, 235, 0.1)', // primary-container/10
        borderWidth: 1,
        borderColor: 'rgba(0, 112, 235, 0.2)',
        borderRadius: 12,
        padding: 24,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    impactGlow: {
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 192,
        height: 192,
        backgroundColor: 'rgba(216, 226, 255, 0.3)', // primary-fixed/30
        borderRadius: 96,
    },
    impactIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 112, 235, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    impactIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 32,
        color: '#0058bc',
    },
    impactTextContainer: {
        alignItems: 'center',
    },
    impactTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#0058bc',
        marginBottom: 8,
    },
    impactSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        textAlign: 'center',
        lineHeight: 20,
    },

    // --- Refill List ---
    refillSection: {
        gap: 16,
    },
    refillHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    refillTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    refillViewAll: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
    },
    refillList: {
        gap: 8,
    },
    refillItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    refillIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f0edef', // surface-container
        justifyContent: 'center',
        alignItems: 'center',
    },
    refillIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    refillInfo: {
        flex: 1,
    },
    refillName: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 17,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    refillDetails: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },
    reorderButton: {
        backgroundColor: 'rgba(0, 88, 188, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    reorderText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
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
        backgroundColor: 'rgba(252, 248, 251, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(193, 198, 215, 0.1)',
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
        padding: 8,
        borderRadius: 12,
        opacity: 0.6,
    },
    navItemActive: {
        opacity: 1,
        backgroundColor: 'rgba(0, 112, 235, 0.2)',
        paddingHorizontal: 16,
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