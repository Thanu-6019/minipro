import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppointments } from '../../src/features/appointments/hooks/useAppointments';

function formatDate(iso: string) {
    const d = new Date(iso);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const endMinutes = d.getMinutes() + 45;
    const endHourExtra = Math.floor(endMinutes / 60);
    const endMins = (endMinutes % 60).toString().padStart(2, '0');
    const endH = (hours + endHourExtra) % 12 || 12;
    const endAmpm = (hours + endHourExtra) >= 12 ? 'PM' : 'AM';
    return {
        dateFull: `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
        weekday: days[d.getDay()],
        timeRange: `${h12}:${mins} ${ampm} - ${endH}:${endMins} ${endAmpm}`,
    };
}

export default function AppointmentDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: appointments = [], isLoading } = useAppointments();

    const appointment = useMemo(() => {
        if (!id || !appointments.length) return null;
        return appointments.find(a => a.id === id) || null;
    }, [id, appointments]);

    const fmt = appointment ? formatDate(appointment.appointment_date) : null;

    if (isLoading) {
        return (
            <View style={styles.container}>
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
                    <Text style={styles.appBarTitle}>Appointment</Text>
                    <View style={styles.topBarButton} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0058bc" />
                </View>
            </View>
        );
    }

    if (!appointment) {
        return (
            <View style={styles.container}>
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
                    <Text style={styles.appBarTitle}>Appointment</Text>
                    <View style={styles.topBarButton} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#414755', textAlign: 'center' }}>
                        Appointment not found.
                    </Text>
                </View>
            </View>
        );
    }
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
                <Text style={styles.appBarTitle}>Appointment</Text>
                <Pressable
                    style={styles.topBarButton}
                    accessibilityLabel="More options"
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.topBarIcon}>more_vert</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Hero Card: Doctor Info & Time */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGlow} />

                    <View style={styles.doctorRow}>
                        <View style={styles.doctorInfoLeft}>
                            <View style={[styles.doctorImage, { backgroundColor: '#d8e2ff', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 28, color: '#0058bc' }}>person</Text>
                            </View>
                            <View>
                                <Text style={styles.doctorName}>{appointment.title}</Text>
                                <Text style={styles.doctorSpecialty}>{appointment.location || 'Medical Visit'}</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Upcoming</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.timeDetailsContainer}>
                        <View style={styles.timeDetailRow}>
                            <View style={styles.iconBox}>
                                <Text style={styles.icon}>calendar_today</Text>
                            </View>
                            <View>
                                <Text style={styles.detailTitle}>{fmt?.dateFull}</Text>
                                <Text style={styles.detailSubtitle}>{fmt?.weekday}</Text>
                            </View>
                        </View>
                        <View style={styles.timeDetailRow}>
                            <View style={styles.iconBox}>
                                <Text style={styles.icon}>schedule</Text>
                            </View>
                            <View>
                                <Text style={styles.detailTitle}>{fmt?.timeRange}</Text>
                                <Text style={styles.detailSubtitle}>45 minutes</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 2. Location & Map */}
                {appointment.location ? (
                    <View style={styles.locationCard}>
                        <View style={styles.mapPlaceholder}>
                            <View style={styles.mapPinContainer}>
                                <Text style={styles.mapPinIcon}>location_on</Text>
                            </View>
                        </View>
                        <View style={styles.locationDetails}>
                            <View style={styles.locationTextRow}>
                                <Text style={styles.locationIcon}>location_on</Text>
                                <View style={styles.locationTextContainer}>
                                    <Text style={styles.locationTitle}>{appointment.location}</Text>
                                </View>
                            </View>
                            <Pressable
                                style={({ pressed }) => [styles.directionsButton, pressed && styles.pressedScale]}
                                accessibilityLabel="Get directions"
                                accessibilityRole="button"
                            >
                                <Text style={styles.directionsIcon}>directions</Text>
                                <Text style={styles.directionsText}>Get Directions</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : null}

                {/* 3. Bento Grid for Details */}
                <View style={styles.bentoGrid}>

                    {/* Preparation Card */}
                    <View style={[styles.bentoCard, styles.prepCard]}>
                        <View style={styles.bentoHeader}>
                            <Text style={[styles.bentoHeaderIcon, { color: '#FF9500' }]}>restaurant_menu</Text>
                            <Text style={styles.bentoHeaderTitle}>Preparation</Text>
                        </View>
                        <View style={styles.prepList}>
                            <View style={styles.prepItem}>
                                <Text style={styles.prepCheck}>check_circle</Text>
                                <Text style={styles.prepText}>Bring your ID and insurance card.</Text>
                            </View>
                            <View style={styles.prepItem}>
                                <Text style={styles.prepCheck}>check_circle</Text>
                                <Text style={styles.prepText}>Arrive 15 minutes early.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Notes Card */}
                    <View style={[styles.bentoCard, styles.notesCard]}>
                        <View style={styles.bentoHeader}>
                            <Text style={[styles.bentoHeaderIcon, { color: '#0058bc' }]}>edit_note</Text>
                            <Text style={styles.bentoHeaderTitle}>My Notes</Text>
                        </View>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesText}>
                                {appointment.title} at {appointment.location || 'the clinic'}.
                            </Text>
                        </View>
                    </View>

                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomActionContainer}>
                <Pressable
                    style={({ pressed }) => [styles.rescheduleButton, pressed && styles.pressedScale]}
                    accessibilityLabel="Reschedule appointment"
                    accessibilityRole="button"
                >
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.checkinButton, pressed && styles.pressedScale]}
                    accessibilityLabel="Check in online"
                    accessibilityRole="button"
                >
                    <Text style={styles.checkinText}>Check In Online</Text>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBarIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
    },
    appBarTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '700',
        color: '#0058bc',
    },

    // --- Hero Card ---
    heroCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 32,
        elevation: 3,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    heroGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 128,
        height: 128,
        backgroundColor: 'rgba(0, 88, 188, 0.05)',
        borderRadius: 64,
    },
    doctorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 10,
        marginBottom: 16,
    },
    doctorInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    doctorImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    doctorName: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    doctorSpecialty: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255, 149, 0, 0.2)',
    },
    statusText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#FF9500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(193, 198, 215, 0.3)',
        marginBottom: 16,
        position: 'relative',
        zIndex: 10,
    },
    timeDetailsContainer: {
        gap: 12,
        position: 'relative',
        zIndex: 10,
    },
    timeDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 88, 188, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#0058bc',
    },
    detailTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        color: '#1b1b1d',
        fontWeight: '600',
    },
    detailSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 13,
        color: '#414755',
    },

    // --- Location Card ---
    locationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e4e2e4',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: 24,
    },
    mapPlaceholder: {
        height: 128,
        backgroundColor: '#d8e2ff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mapPinContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    mapPinIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 28,
        color: '#0058bc',
    },
    locationDetails: {
        padding: 16,
        gap: 16,
    },
    locationTextRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    locationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
        marginTop: 2,
    },
    locationTextContainer: {
        flex: 1,
    },
    locationTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        color: '#1b1b1d',
        fontWeight: '600',
        marginBottom: 4,
    },
    locationAddress: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 13,
        color: '#414755',
        lineHeight: 20,
    },
    directionsButton: {
        width: '100%',
        backgroundColor: '#6ffb85',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    directionsIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 18,
        color: '#00732a',
    },
    directionsText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        fontWeight: '600',
        color: '#00732a',
    },

    // --- Bento Grid ---
    bentoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    bentoCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    prepCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500',
    },
    notesCard: {
        flexBasis: '100%',
    },
    bentoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    bentoHeaderIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
    },
    bentoHeaderTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
    },

    // --- Prep ---
    prepList: {
        gap: 8,
    },
    prepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    prepCheck: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#0058bc',
        marginTop: 2,
    },
    prepText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        flex: 1,
    },

    // --- Documents ---
    documentRow: {
        backgroundColor: '#f6f3f5',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
    },
    documentIconBox: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 88, 188, 0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#0058bc',
    },
    documentInfo: {
        flex: 1,
    },
    documentTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 15,
        color: '#1b1b1d',
    },
    documentSub: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },
    downloadButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 20,
        color: '#0058bc',
    },

    // --- Notes ---
    notesBox: {
        backgroundColor: '#f6f3f5',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        minHeight: 80,
    },
    notesText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        fontStyle: 'italic',
    },

    // --- Bottom Actions ---
    bottomActionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        backgroundColor: 'rgba(252, 248, 251, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(193, 198, 215, 0.2)',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    rescheduleButton: {
        flex: 1,
        backgroundColor: '#eae7ea',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkinButton: {
        flex: 2,
        backgroundColor: '#0058bc',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rescheduleText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    checkinText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
    },

    // --- Common ---
    pressedScale: { transform: [{ scale: 0.95 }] },
});