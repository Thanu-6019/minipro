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
import { useAuthStore } from '@/store/authStore';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useRouter } from 'expo-router';

export default function UserProfile() {
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);
    const router = useRouter();
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';
    const avatarSource = useGenderAvatar();
    const bloodType = user?.user_metadata?.blood_type || '';
    const heightWeight = user?.user_metadata?.height_weight || '';
    const allergies: string[] = user?.user_metadata?.allergies || [];
    return (
        <View style={styles.container}>

            {/* TopAppBar */}
            <View style={styles.topAppBar}>
                <Pressable style={styles.topBarButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.topBarIcon}>arrow_back</Text>
                </Pressable>
                <Text style={styles.appBarTitle}>Profile</Text>
                <Pressable style={styles.topBarButton} onPress={() => router.push('/settings')} accessibilityLabel="Settings" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.topBarIcon}>settings</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={avatarSource}
                            style={styles.avatarImage}
                            accessibilityLabel="Profile avatar"
                        />
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                </View>

                {/* Settings List */}
                <View style={styles.settingsContainer}>

                    {/* Account Security Card */}
                    <View style={styles.settingsCard}>
                        <View style={styles.cardAccentPrimary} />
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderIcon}>shield_lock</Text>
                            <Text style={styles.cardHeaderTitle}>Account Security</Text>
                        </View>

                        <View style={styles.cardBody}>
                            <Pressable style={({ pressed }) => [styles.listItem, pressed && styles.pressedScale]} accessibilityLabel="Edit email address" accessibilityRole="button">
                                <View>
                                    <Text style={styles.listItemTitle}>Email Address</Text>
                                    <Text style={styles.listItemSubtitle}>{email}</Text>
                                </View>
                                <Text style={styles.listItemArrow}>chevron_right</Text>
                            </Pressable>

                            <View style={styles.divider} />

                            <Pressable style={({ pressed }) => [styles.listItem, pressed && styles.pressedScale]} accessibilityLabel="Edit password" accessibilityRole="button">
                                <View>
                                    <Text style={styles.listItemTitle}>Password</Text>
                                    <Text style={styles.listItemSubtitle}>Last updated 2 months ago</Text>
                                </View>
                                <Text style={styles.listItemArrow}>chevron_right</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Medical Profile Card */}
                    <View style={styles.settingsCard}>
                        <View style={styles.cardAccentSecondary} />
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardHeaderIcon, { color: '#006e28' }]}>medical_information</Text>
                            <Text style={styles.cardHeaderTitle}>Medical Profile</Text>
                        </View>

                        <View style={styles.medicalGrid}>
                            <View style={styles.medicalBox}>
                                <Text style={styles.medicalLabel}>Blood Type</Text>
                                <Text style={styles.medicalValue}>{bloodType || '—'}</Text>
                            </View>
                            <View style={styles.medicalBox}>
                                <Text style={styles.medicalLabel}>Height / Weight</Text>
                                <Text style={styles.medicalValue}>{heightWeight || '—'}</Text>
                            </View>

                            <View style={styles.allergyBox}>
                                <View style={styles.allergyHeader}>
                                    <Text style={styles.allergyIcon}>warning</Text>
                                    <Text style={styles.allergyLabel}>Allergies</Text>
                                </View>
                                <View style={styles.allergyTags}>
                                    {allergies.length > 0 ? allergies.map((a) => (
                                        <View key={a} style={styles.allergyTag}>
                                            <Text style={styles.allergyTagText}>{a}</Text>
                                        </View>
                                    )) : (
                                        <Text style={styles.listItemSubtitle}>No known allergies</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Log Out Action */}
                    <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressedScale]} onPress={async () => { await signOut(); router.replace('/(auth)/welcome'); }} accessibilityLabel="Log out" accessibilityRole="button">
                        <Text style={styles.logoutIcon}>logout</Text>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>

                </View>

                <View style={{ height: 80 }} />
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
    topBarButton: {
        padding: 8,
        borderRadius: 20,
    },
    topBarIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#0058bc',
    },

    // --- Header ---
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 128,
        height: 128,
        borderRadius: 64,
        padding: 4,
        marginBottom: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(0, 112, 235, 0.3)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#ffffff',
    },
    userName: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d',
    },

    // --- Settings ---
    settingsContainer: {
        gap: 24,
    },
    settingsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eae7ea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    cardAccentPrimary: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#0058bc',
        opacity: 0.5,
    },
    cardAccentSecondary: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#006e28',
        opacity: 0.5,
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
        color: '#0058bc',
    },
    cardHeaderTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    cardBody: {
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    listItemTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        color: '#1b1b1d',
    },
    listItemSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 13,
        color: '#414755',
        marginTop: 4,
    },
    listItemArrow: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#c1c6d7',
    },
    divider: {
        height: 1,
        backgroundColor: '#eae7ea',
        marginHorizontal: 12,
    },

    // --- Medical Grid ---
    medicalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    medicalBox: {
        flex: 1,
        minWidth: '40%',
        backgroundColor: '#f6f3f5',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e4e2e4',
        justifyContent: 'space-between',
    },
    medicalLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#414755',
        marginBottom: 4,
    },
    medicalValue: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    allergyBox: {
        flexBasis: '100%',
        backgroundColor: 'rgba(186, 26, 26, 0.2)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(186, 26, 26, 0.5)',
        marginTop: 4,
    },
    allergyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    allergyIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#ba1a1a',
    },
    allergyLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ba1a1a',
    },
    allergyTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    allergyTag: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(186, 26, 26, 0.5)',
    },
    allergyTagText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#ba1a1a',
    },

    // --- Logout ---
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        marginTop: 8,
    },
    logoutIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#ba1a1a',
    },
    logoutText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#ba1a1a',
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

    // --- Common ---
    pressedScale: { transform: [{ scale: 0.95 }] },
});