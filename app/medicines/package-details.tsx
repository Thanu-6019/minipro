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
import { useRouter } from 'expo-router';

export default function MedicinePackageDetails() {
    const router = useRouter();
    return (
        <View style={styles.container}>

            {/* Top Navigation */}
            <View style={styles.topAppBar}>
                <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.backIcon}>arrow_back</Text>
                </Pressable>
                <Text style={styles.appBarTitle}>Package Details</Text>
                <View style={styles.navSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Package Image Hero */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo0xxbq37LMJ4LcsF1i2czY1Lf6-3TywpObt-5X1WXVZbjiKhJPt8WN4ew020vaef88xuQbmQP3b1HjnweoX--JUD3CgXZGDG8_oYCTIQpnlMPf4g20SXYYUtEMnwI-plOSA5llTzNEbPXGgU4AupqTHbzbxGya9tits9dZp4P4Ven2w_uueYYY-iqFtZ0vd7PEwiQSXRQJnSGjvQWTKD_cn_Soy70Tp6XAngQkEehMzdRYHmoyZBjIvo77hbVKXkqJu-2crXKEFsJ' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                        accessibilityLabel="Medicine package image"
                    />
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeIcon}>warning</Text>
                        <Text style={styles.heroBadgeText}>Expired</Text>
                    </View>
                </View>

                {/* Title & Basic Info */}
                <View style={styles.headerInfo}>
                    <Text style={styles.mainTitle}>Lisinopril 10mg</Text>
                    <Text style={styles.mainSubtitle}>ACE Inhibitor • 30 Tablets</Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}>
                            <Text style={styles.tagIcon}>qr_code_scanner</Text>
                            <Text style={styles.tagText}>Scanned Oct 12</Text>
                        </View>
                    </View>
                </View>

                {/* Manufacturing & Batch Details (Bento-style Grid) */}
                <View style={styles.detailsGrid}>

                    <View style={[styles.detailCard, styles.detailCardLight]}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailHeaderIcon}>tag</Text>
                            <Text style={styles.detailHeaderLabel}>BATCH NO.</Text>
                        </View>
                        <Text style={styles.detailValue}>BX-78902A</Text>
                    </View>

                    <View style={[styles.detailCard, styles.detailCardLight]}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailHeaderIcon}>factory</Text>
                            <Text style={styles.detailHeaderLabel}>MFG DATE</Text>
                        </View>
                        <Text style={styles.detailValue}>Jan 2024</Text>
                    </View>

                    <View style={[styles.detailCard, styles.detailCardExpired]}>
                        <View style={styles.detailHeaderExpired}>
                            <Text style={styles.detailHeaderIconExpired}>event_busy</Text>
                            <Text style={styles.detailHeaderLabelExpired}>EXPIRY DATE</Text>
                        </View>
                        <View style={styles.detailExpiryRow}>
                            <Text style={styles.detailValueExpired}>Sep 15, 2025</Text>
                            <Text style={styles.detailExpiryLabel}>2 Days Ago</Text>
                        </View>
                    </View>

                </View>

                {/* Storage & Safety Instructions */}
                <View style={styles.safetySection}>
                    <Text style={styles.sectionTitle}>Storage &amp; Safety</Text>

                    <View style={styles.safetyCard}>

                        <View style={[styles.safetyRow, styles.safetyRowBorder]}>
                            <View style={[styles.safetyIconContainer, { backgroundColor: 'rgba(0, 88, 188, 0.2)' }]}>
                                <Text style={[styles.safetyIcon, { color: '#0058bc' }]}>device_thermostat</Text>
                            </View>
                            <View style={styles.safetyTextContainer}>
                                <Text style={styles.safetyRowTitle}>Temperature Control</Text>
                                <Text style={styles.safetyRowDesc}>
                                    Store at room temperature (68°F to 77°F). Excursions permitted between 59°F and 86°F.
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.safetyRow, styles.safetyRowBorder]}>
                            <View style={[styles.safetyIconContainer, { backgroundColor: 'rgba(0, 88, 188, 0.2)' }]}>
                                <Text style={[styles.safetyIcon, { color: '#0058bc' }]}>water_drop</Text>
                            </View>
                            <View style={styles.safetyTextContainer}>
                                <Text style={styles.safetyRowTitle}>Moisture Protection</Text>
                                <Text style={styles.safetyRowDesc}>
                                    Store in a dry place. Protect from excessive moisture. Do not store in bathrooms.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.safetyRow}>
                            <View style={[styles.safetyIconContainer, { backgroundColor: 'rgba(186, 26, 26, 0.5)' }]}>
                                <Text style={[styles.safetyIcon, { color: '#ba1a1a' }]}>child_care</Text>
                            </View>
                            <View style={styles.safetyTextContainer}>
                                <Text style={styles.safetyRowTitle}>Child Safety</Text>
                                <Text style={styles.safetyRowDesc}>
                                    Keep out of reach of children. Store in original container tightly closed.
                                </Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Action Section (Disposal) */}
                <View style={styles.disposalSection}>
                    <View style={styles.disposalIconContainer}>
                        <Text style={styles.disposalIcon}>delete_sweep</Text>
                    </View>
                    <Text style={styles.disposalTitle}>Safe Disposal Required</Text>
                    <Text style={styles.disposalDesc}>
                        This medication has expired. Please dispose of it safely according to local guidelines to prevent accidental ingestion or environmental harm.
                    </Text>

                    <Pressable style={({ pressed }) => [styles.disposalPrimaryButton, pressed && styles.pressedScale]} accessibilityLabel="Log disposal" accessibilityRole="button">
                        <Text style={styles.disposalPrimaryIcon}>check_circle</Text>
                        <Text style={styles.disposalPrimaryText}>Log Disposal</Text>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.disposalSecondaryButton, pressed && styles.pressedScale]} accessibilityLabel="Find disposal locations" accessibilityRole="button">
                        <Text style={styles.disposalSecondaryText}>Find Disposal Locations</Text>
                    </Pressable>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
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

    // --- Top Nav ---
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
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    backIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755', // on-surface-variant
    },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#0058bc',
    },
    navSpacer: {
        width: 40,
    },

    // --- Hero Image ---
    heroContainer: {
        width: '100%',
        height: 256,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    heroBadgeIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#FF3B30',
    },
    heroBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#FF3B30',
    },

    // --- Header Info ---
    headerInfo: {
        marginBottom: 24,
    },
    mainTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.01,
        color: '#1b1b1d',
        marginBottom: 4,
    },
    mainSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 17,
        color: '#414755',
        marginBottom: 12,
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f6f3f5', // surface-container-low
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    tagIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#1b1b1d',
    },
    tagText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#1b1b1d',
    },

    // --- Details Grid ---
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    detailCard: {
        flex: 1,
        minWidth: '40%',
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
    },
    detailCardLight: {
        // Base glass styles
    },
    detailCardExpired: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30', // status-skipped
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
        flexBasis: '100%',
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    detailHeaderIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#414755',
    },
    detailHeaderLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },

    // Expiry specific styles
    detailHeaderExpired: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    detailHeaderIconExpired: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#FF3B30',
    },
    detailHeaderLabelExpired: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#FF3B30',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    detailExpiryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    detailValueExpired: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#FF3B30',
    },
    detailExpiryLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#FF3B30',
    },

    // --- Safety Section ---
    safetySection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 12,
    },
    safetyCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    safetyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
    },
    safetyRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(193, 198, 215, 0.3)',
    },
    safetyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    safetyIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
    },
    safetyTextContainer: {
        flex: 1,
    },
    safetyRowTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#1b1b1d',
        marginBottom: 4,
    },
    safetyRowDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        lineHeight: 20,
    },

    // --- Disposal Section ---
    disposalSection: {
        backgroundColor: '#f6f3f5', // surface-container-low
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        gap: 12,
    },
    disposalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(18, 18, 18, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disposalIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        color: '#414755',
    },
    disposalTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    disposalDesc: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        textAlign: 'center',
        maxWidth: 350,
        marginBottom: 4,
    },
    disposalPrimaryButton: {
        width: '100%',
        backgroundColor: '#0058bc',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    disposalPrimaryIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#ffffff',
    },
    disposalPrimaryText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ffffff',
    },
    disposalSecondaryButton: {
        width: '100%',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    disposalSecondaryText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
    },

    // --- Common ---
    pressedScale: {
        transform: [{ scale: 0.95 }],
    },
});