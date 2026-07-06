import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    TextInput,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function MedicineExpiryList() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>

            {/* Top App Bar */}
            <View style={styles.topAppBar}>
                <View style={styles.topBarLeft}>
                    <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.backIcon}>arrow_back</Text>
                    </Pressable>
                    <Text style={styles.appBarTitle}>MedTrack AI</Text>
                </View>
                <Pressable style={styles.notificationButton} accessibilityLabel="Notifications" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.notificationIcon}>notifications</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[1]} // Makes the Search/Filter section stick to the top on scroll
            >
                {/* Page Header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Expiry Tracker</Text>
                    <Text style={styles.pageSubtitle}>
                        Manage your medication inventory and track approaching expiration dates.
                    </Text>
                </View>

                {/* Search & Filter Controls (Sticky) */}
                <View style={styles.stickyControls}>
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>search</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search medications..."
                            placeholderTextColor="rgba(113, 119, 134, 0.7)"
                            accessibilityLabel="Search medicines"
                        />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    >
                        <Pressable style={[styles.filterChip, styles.filterChipActive]} accessibilityLabel="All Meds" accessibilityRole="tab" accessibilityState={{ selected: true }}>
                            <Text style={styles.filterTextActive}>All Meds</Text>
                        </Pressable>
                        <Pressable style={styles.filterChip} accessibilityLabel="Expiring Soon" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                            <Text style={styles.filterTextInactive}>Expiring Soon</Text>
                            <View style={[styles.filterBadge, { backgroundColor: '#FF9500' }]}>
                                <Text style={styles.filterBadgeText}>2</Text>
                            </View>
                        </Pressable>
                        <Pressable style={styles.filterChip} accessibilityLabel="Expired" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                            <Text style={styles.filterTextInactive}>Expired</Text>
                            <View style={[styles.filterBadge, { backgroundColor: '#FF3B30' }]}>
                                <Text style={styles.filterBadgeText}>1</Text>
                            </View>
                        </Pressable>
                        <Pressable style={styles.filterChip} accessibilityLabel="Valid" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                            <Text style={styles.filterTextInactive}>Valid</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                {/* Expiry List */}
                <View style={styles.listContainer}>

                    {/* 1. Expired Card */}
                    <View style={[styles.card, styles.cardExpired]}>
                        <View style={[styles.cardLeftIndicator, { backgroundColor: '#FF3B30' }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>pill</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>Amoxicillin</Text>
                                        <Text style={styles.cardSubtitle}>500mg • Capsules</Text>
                                    </View>
                                </View>
                                <View style={[styles.cardBadge, styles.cardBadgeExpired]}>
                                    <Text style={styles.cardBadgeIcon}>warning</Text>
                                    <Text style={styles.cardBadgeText}>Expired</Text>
                                </View>
                            </View>

                            <View style={styles.cardDivider} />

                            <View style={styles.cardDetailsGrid}>
                                <View>
                                    <Text style={styles.detailLabel}>EXPIRES ON</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>calendar_today</Text>
                                        <Text style={[styles.detailValue, styles.detailValueError]}>Oct 12, 2023</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>BATCH NO.</Text>
                                    <Text style={styles.detailValue}>BX-99201A</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <Pressable style={styles.actionButtonDiscard} accessibilityLabel="Discard Amoxicillin" accessibilityRole="button">
                                    <Text style={styles.actionIconDiscard}>delete</Text>
                                    <Text style={styles.actionTextDiscard}>Discard</Text>
                                </Pressable>
                                <Pressable style={styles.actionButtonReorder} accessibilityLabel="Reorder Amoxicillin" accessibilityRole="button">
                                    <Text style={styles.actionIconReorder}>shopping_cart</Text>
                                    <Text style={styles.actionTextReorder}>Reorder</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* 2. Expiring Soon Card */}
                    <View style={[styles.card, styles.cardWarning]}>
                        <View style={[styles.cardLeftIndicator, { backgroundColor: '#FF9500' }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>vaccines</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>Lisinopril</Text>
                                        <Text style={styles.cardSubtitle}>10mg • Tablets</Text>
                                    </View>
                                </View>
                                <View style={[styles.cardBadge, styles.cardBadgeWarning]}>
                                    <Text style={styles.cardBadgeIcon}>schedule</Text>
                                    <Text style={styles.cardBadgeText}>Expiring Soon</Text>
                                </View>
                            </View>

                            <View style={styles.cardDivider} />

                            <View style={styles.cardDetailsGrid}>
                                <View>
                                    <Text style={styles.detailLabel}>EXPIRES ON</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>calendar_today</Text>
                                        <Text style={[styles.detailValue, styles.detailValueWarning]}>Dec 05, 2023</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>BATCH NO.</Text>
                                    <Text style={styles.detailValue}>LN-44329B</Text>
                                </View>
                            </View>

                            <View style={styles.cardRemainingBadge}>
                                <Text style={styles.cardRemainingText}>28 days remaining</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Valid Card 1 */}
                    <View style={[styles.card, styles.cardValid]}>
                        <View style={[styles.cardLeftIndicator, { backgroundColor: '#34C759' }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>medication</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>Atorvastatin</Text>
                                        <Text style={styles.cardSubtitle}>20mg • Tablets</Text>
                                    </View>
                                </View>
                                <View style={[styles.cardBadge, styles.cardBadgeValid]}>
                                    <Text style={styles.cardBadgeIcon}>check_circle</Text>
                                    <Text style={styles.cardBadgeText}>Valid</Text>
                                </View>
                            </View>

                            <View style={styles.cardDivider} />

                            <View style={styles.cardDetailsGrid}>
                                <View>
                                    <Text style={styles.detailLabel}>EXPIRES ON</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>calendar_today</Text>
                                        <Text style={[styles.detailValue, styles.detailValueNeutral]}>Aug 15, 2025</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>BATCH NO.</Text>
                                    <Text style={styles.detailValue}>AT-10045X</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 4. Valid Card 2 */}
                    <View style={[styles.card, styles.cardValid]}>
                        <View style={[styles.cardLeftIndicator, { backgroundColor: '#34C759' }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>water_drop</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>Systane Ultra</Text>
                                        <Text style={styles.cardSubtitle}>Eye Drops • 10ml</Text>
                                    </View>
                                </View>
                                <View style={[styles.cardBadge, styles.cardBadgeValid]}>
                                    <Text style={styles.cardBadgeIcon}>check_circle</Text>
                                    <Text style={styles.cardBadgeText}>Valid</Text>
                                </View>
                            </View>

                            <View style={styles.cardDivider} />

                            <View style={styles.cardDetailsGrid}>
                                <View>
                                    <Text style={styles.detailLabel}>EXPIRES ON</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailIcon}>calendar_today</Text>
                                        <Text style={[styles.detailValue, styles.detailValueNeutral]}>Nov 22, 2024</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>BATCH NO.</Text>
                                    <Text style={styles.detailValue}>SY-88219M</Text>
                                </View>
                            </View>
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

        </SafeAreaView>
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
    backButton: {
        padding: 4,
    },
    backIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
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
        borderRadius: 20,
        backgroundColor: '#f6f3f5', // surface-container-low
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#0058bc',
    },

    // --- Page Header ---
    pageHeader: {
        marginBottom: 24,
        marginTop: 4,
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

    // --- Sticky Controls ---
    stickyControls: {
        backgroundColor: 'rgba(252, 248, 251, 0.9)',
        paddingTop: 4,
        paddingBottom: 12,
        marginBottom: 24,
        zIndex: 40,
    },
    searchContainer: {
        position: 'relative',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 10,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#717786',
    },
    searchInput: {
        flex: 1,
        paddingLeft: 40,
        paddingRight: 12,
        paddingVertical: 12,
        backgroundColor: '#f6f3f5', // surface-container-low
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        borderRadius: 8,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#1b1b1d',
    },
    filterList: {
        gap: 8,
        paddingBottom: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    filterChipActive: {
        backgroundColor: '#0058bc',
    },
    filterTextActive: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ffffff',
    },
    filterTextInactive: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755',
    },
    filterBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
    },
    filterBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 10,
        color: '#ffffff',
        fontWeight: 'bold',
    },

    // --- Cards List ---
    listContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#ffffff', // surface-container-lowest
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardExpired: {
        borderColor: 'rgba(255, 59, 48, 0.3)',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
    },
    cardWarning: {
        borderColor: 'rgba(255, 149, 0, 0.3)',
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    cardValid: {
        borderColor: 'rgba(193, 198, 215, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
    },
    cardLeftIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    cardContent: {
        padding: 16,
        paddingLeft: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0edef', // surface-container
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.2)',
    },
    cardIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#717786',
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
        color: '#414755',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    cardBadgeExpired: {
        backgroundColor: '#ffdad6', // error-container
    },
    cardBadgeWarning: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 149, 0, 0.2)',
    },
    cardBadgeValid: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.2)',
    },
    cardBadgeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
    },
    cardBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
    },

    // Card Details
    cardDivider: {
        borderTopWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.2)',
        marginVertical: 12,
    },
    cardDetailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    detailLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#717786',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#717786',
    },
    detailValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
    },
    detailValueError: {
        color: '#ba1a1a',
        fontWeight: '600',
    },
    detailValueWarning: {
        color: '#FF9500',
        fontWeight: '600',
    },
    detailValueNeutral: {
        color: '#1b1b1d',
        fontWeight: '500',
    },
    cardRemainingBadge: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#f6f3f5',
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    cardRemainingText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },

    // Card Actions
    cardActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButtonDiscard: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eae7ea', // surface-container-high
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonReorder: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#0058bc',
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionIconDiscard: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#ba1a1a',
    },
    actionTextDiscard: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ba1a1a',
    },
    actionIconReorder: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#ffffff',
    },
    actionTextReorder: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ffffff',
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
        borderTopColor: 'rgba(193, 198, 215, 0.3)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 50,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
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
