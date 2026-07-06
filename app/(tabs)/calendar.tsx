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
import { useAppointments } from '@/features/appointments/hooks/useAppointments';

function formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const h12 = h % 12 || 12;
    return `${h12}:${m}`;
}

function getPeriod(iso: string): string {
    const h = new Date(iso).getHours();
    return h >= 12 ? 'PM' : 'AM';
}

function getShortDate(iso: string): string {
    const d = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function AppointmentCalendar() {
    const avatarSource = useGenderAvatar();
    const { data: appointments = [] } = useAppointments();
    return (
        <View style={styles.container}>

            {/* TopAppBar */}
            <View style={styles.topAppBar}>
                <View style={styles.topBarLeft}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={avatarSource}
                            style={styles.profileImage}
                            accessibilityLabel="Profile avatar"
                        />
                    </View>
                </View>
                <Text style={styles.appBarTitle}>MedTrack AI</Text>
                <Pressable style={styles.notificationButton} accessibilityLabel="Notifications" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.notificationIcon}>notifications</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Premium Calendar Widget */}
                <View style={styles.calendarCard}>
                    {/* Calendar Header */}
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>October 2026</Text>
                        <View style={styles.calendarControls}>
                            <Pressable style={styles.calendarControlBtn} accessibilityLabel="Previous month" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={styles.calendarControlIcon}>chevron_left</Text>
                            </Pressable>
                            <Pressable style={styles.calendarControlBtn} accessibilityLabel="Next month" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={styles.calendarControlIcon}>chevron_right</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {/* Weekday Headers */}
                        <View style={styles.calendarRowHeader}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                                <Text key={day} style={styles.calendarHeaderLabel}>{day}</Text>
                            ))}
                        </View>

                        {/* Dates - Row 1 */}
                        <View style={styles.calendarRow}>
                            <Text style={styles.calendarDateOther}>28</Text>
                            <Text style={styles.calendarDateOther}>29</Text>
                            <Text style={styles.calendarDateOther}>30</Text>
                            <Text style={styles.calendarDate}>1</Text>
                            <Text style={styles.calendarDate}>2</Text>
                            <Text style={styles.calendarDate}>3</Text>
                            <Text style={styles.calendarDate}>4</Text>
                        </View>

                        {/* Dates - Row 2 */}
                        <View style={styles.calendarRow}>
                            <Text style={styles.calendarDate}>5</Text>
                            <View style={styles.calendarDateWrapper}>
                                <Text style={styles.calendarDate}>6</Text>
                                <View style={[styles.calendarDot, { backgroundColor: '#34C759' }]} />
                            </View>
                            <Text style={styles.calendarDate}>7</Text>
                            <Text style={styles.calendarDate}>8</Text>
                            <View style={styles.calendarDateWrapper}>
                                <Text style={styles.calendarDate}>9</Text>
                                <View style={[styles.calendarDot, { backgroundColor: '#0058bc' }]} />
                            </View>
                            <Text style={styles.calendarDate}>10</Text>
                            <Text style={styles.calendarDate}>11</Text>
                        </View>

                        {/* Dates - Row 3 */}
                        <View style={styles.calendarRow}>
                            <Text style={styles.calendarDate}>12</Text>
                            <Text style={styles.calendarDate}>13</Text>
                            <View style={styles.calendarDateWrapper}>
                                <View style={styles.calendarActiveDate}>
                                    <Text style={styles.calendarActiveText}>14</Text>
                                </View>
                                <View style={styles.calendarActiveDots}>
                                    <View style={[styles.calendarDot, { backgroundColor: '#FF9500' }]} />
                                    <View style={[styles.calendarDot, { backgroundColor: '#0058bc' }]} />
                                </View>
                            </View>
                            <Text style={styles.calendarDate}>15</Text>
                            <Text style={styles.calendarDate}>16</Text>
                            <Text style={styles.calendarDate}>17</Text>
                            <Text style={styles.calendarDate}>18</Text>
                        </View>
                    </View>
                </View>

                {/* Today's Appointments */}
                <View style={styles.appointmentsSection}>
                    <View style={styles.appointmentHeader}>
                        <Text style={styles.appointmentTitle}>Today&apos;s Appointments</Text>
                        <Text style={styles.appointmentDateLabel}>{getShortDate(new Date().toISOString())}</Text>
                    </View>

                    <View style={styles.appointmentList}>
                        {appointments.slice(0, 2).map((appt, idx) => (
                            <View key={appt.id} style={styles.appointmentCard}>
                                <View style={[styles.appointmentLine, { backgroundColor: idx === 0 ? '#FF9500' : '#0058bc' }]} />
                                <View style={styles.appointmentTimeCol}>
                                    <Text style={styles.appointmentTime}>{formatTime(appt.appointment_date)}</Text>
                                    <Text style={styles.appointmentPeriod}>{getPeriod(appt.appointment_date)}</Text>
                                </View>
                                <View style={styles.appointmentDivider} />
                                <View style={styles.appointmentDetails}>
                                    <View style={styles.appointmentDetailTop}>
                                        <Text style={styles.appointmentDoctor}>{appt.title}</Text>
                                        <View style={idx === 0 ? styles.appointmentBadgeUpcoming : styles.appointmentBadgeCheckup}>
                                            <Text style={[styles.appointmentBadgeText, idx !== 0 && { color: '#0058bc' }]}>Upcoming</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.appointmentType}>{appt.location || 'No location specified'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
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
    topBarLeft: { flexDirection: 'row', alignItems: 'center' },
    profileContainer: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#f0edef' },
    profileImage: { width: '100%', height: '100%' },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '700',
        color: '#0058bc'
    },
    notificationButton: { padding: 8 },
    notificationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755'
    },

    // --- Calendar Card ---
    calendarCard: {
        backgroundColor: 'rgba(252, 248, 251, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    calendarControls: { flexDirection: 'row', gap: 8 },
    calendarControlBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    calendarControlIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#414755',
    },

    // --- Calendar Grid ---
    calendarGrid: { gap: 8 },
    calendarRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    calendarHeaderLabel: {
        flex: 1,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    calendarDateOther: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 8,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        opacity: 0.4,
    },
    calendarDate: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 8,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#1b1b1d',
    },
    calendarDateWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    calendarDot: {
        position: 'absolute',
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    calendarActiveDate: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0058bc',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    calendarActiveText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
    calendarActiveDots: {
        position: 'absolute',
        bottom: -4,
        flexDirection: 'row',
        gap: 2,
    },

    // --- Appointments Section ---
    appointmentsSection: { marginBottom: 24 },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    appointmentTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    appointmentDateLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: '#0058bc',
    },
    appointmentList: { gap: 12 },
    appointmentCard: {
        backgroundColor: 'rgba(252, 248, 251, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
        gap: 12,
    },
    appointmentLine: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    appointmentTimeCol: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 12,
        borderRightWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        minWidth: 60,
    },
    appointmentTime: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    appointmentPeriod: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
        textTransform: 'uppercase',
    },
    appointmentDivider: {
        position: 'absolute',
        left: 76,
        top: 16,
        bottom: 16,
        width: 1,
        backgroundColor: 'rgba(193, 198, 215, 0.3)',
    },
    appointmentDetails: { flex: 1, justifyContent: 'center' },
    appointmentDetailTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    appointmentDoctor: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    appointmentBadgeUpcoming: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    appointmentBadgeCheckup: {
        backgroundColor: 'rgba(0, 88, 188, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    appointmentBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#FF9500',
    },
    appointmentType: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginBottom: 4,
    },
    appointmentMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    appointmentMetaIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: 'rgba(65, 71, 85, 0.8)',
    },
    appointmentMetaText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        color: 'rgba(65, 71, 85, 0.8)',
    },

    // --- FAB ---
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#0058bc',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0070eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 8,
        zIndex: 40,
    },
    fabIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
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
    },

    // --- Common ---
    pressedScale: { transform: [{ scale: 0.95 }] },
});