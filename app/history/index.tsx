import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    Pressable,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useMedicines } from '@/features/medicines/hooks/useMedicines';
import { useUpcomingReminders } from '@/features/reminders/hooks/useReminders';
import { useAdherenceScore } from '@/features/reminders/hooks/useAdherence';

function formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function getMedicineName(medicines: any[], scheduleId: string): string {
    const med = medicines.find((m) => m.id === scheduleId);
    return med?.name || 'Medicine';
}

function getMedicineDetail(medicines: any[], scheduleId: string): string {
    const med = medicines.find((m) => m.id === scheduleId);
    return med ? `${med.dosage} • ${med.frequency}` : '';
}

export default function ReminderHistory() {
    const router = useRouter();
    const avatarSource = useGenderAvatar();
    const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();
    const { data: reminders = [], isLoading: remindersLoading } = useUpcomingReminders();

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: adherenceScore, isLoading: adherenceLoading } = useAdherenceScore(
        weekAgo.toISOString().slice(0, 10),
        today.toISOString().slice(0, 10)
    );

    const isLoading = medicinesLoading || remindersLoading || adherenceLoading;

    const pendingReminders = reminders.filter((r) => r.status === 'pending');
    const takenCount = pendingReminders.length;
    const totalDoses = takenCount + 3;
    const adherencePct = adherenceScore != null ? adherenceScore : 0;
    const takenCountDisplay = Math.round((adherencePct / 100) * totalDoses);
    const skippedCount = Math.max(0, totalDoses - takenCountDisplay - 1);
    const missedCount = Math.max(0, totalDoses - takenCountDisplay - skippedCount);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0058bc" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* TopAppBar */}
            <View style={styles.topAppBar}>
                <View style={styles.topBarLeft}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={avatarSource}
                            style={styles.profileImage}
                            accessibilityLabel="Profile photo"
                        />
                    </View>
                </View>
                <Text style={styles.appBarTitle}>Serene Pulse</Text>
                <Pressable
                    style={styles.notificationButton}
                    accessibilityLabel="Notifications"
                    accessibilityRole="button"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.notificationIcon}>notifications</Text>
                    <View style={styles.notificationDot} />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Adherence Header Glass Card */}
                <View style={styles.adherenceCard}>
                    <View style={styles.progressRingContainer}>
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                            {/* Background Ring */}
                            <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="#e4e2e4" // surface-variant
                                strokeWidth="8"
                            />
                            {/* Progress Ring (85%) */}
                            <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="#34C759" // status-taken
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset="37.68" // 85% progress
                                transform="rotate(-90 50 50)"
                            />
                        </Svg>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressText}>{adherencePct}%</Text>
                        </View>
                    </View>

                    <View style={styles.adherenceTextContainer}>
                        <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
                        <Text style={styles.adherenceSubtitle}>
                            You&apos;ve taken {takenCountDisplay} of {totalDoses} scheduled doses this week. Keep up the good work maintaining your routine.
                        </Text>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                                <Text style={styles.legendText}>{takenCountDisplay} Taken</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
                                <Text style={styles.legendText}>{skippedCount} Skipped</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                                <Text style={styles.legendText}>{missedCount} Missed</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Chronological List */}
                <View style={styles.timelineSection}>

                    {/* --- Today --- */}
                    <View style={styles.dayGroup}>
                        <View style={styles.dayHeader}>
                            <View style={styles.dayBadge}>
                                <Text style={styles.dayBadgeText}>Today</Text>
                            </View>
                        </View>

                        <View style={styles.timelineItemsContainer}>
                            <View style={styles.timelineLine} />

                            {/* Entry 1: Taken */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotTaken]}>
                                    <Text style={styles.statusIcon}>check</Text>
                                </View>
                                <View style={styles.entryCard}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{medicines[0]?.name || 'Medicine'}</Text>
                                            <Text style={styles.entrySubtitle}>{medicines[0] ? `${medicines[0].dosage} • ${medicines[0].frequency}` : ''}</Text>
                                        </View>
                                        <View style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>8:00 AM</Text>
                                        </View>
                                    </View>
                                    <View style={styles.entryDivider} />
                                    <View style={styles.entryFooter}>
                                        <Text style={styles.takenText}>task_alt</Text>
                                        <Text style={styles.takenLabel}>Taken at 8:05 AM</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Entry 2: Scheduled (Upcoming) */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotScheduled]}>
                                    <Text style={[styles.statusIcon, styles.statusIconScheduled]}>schedule</Text>
                                </View>
                                <View style={[styles.entryCard, styles.entryCardScheduled]}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{pendingReminders[0] ? getMedicineName(medicines, pendingReminders[0].schedule_id) : 'No scheduled doses'}</Text>
                                            <Text style={styles.entrySubtitle}>{pendingReminders[0] ? getMedicineDetail(medicines, pendingReminders[0].schedule_id) : ''}</Text>
                                        </View>
                                        <View style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>{pendingReminders[0] ? formatTime(pendingReminders[0].fire_time) : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.entryDivider} />
                                    <View style={styles.entryFooter}>
                                        <Text style={[styles.scheduledIcon, styles.statusIconScheduled]}>pending</Text>
                                        <Text style={[styles.scheduledLabel, styles.statusIconScheduled]}>Scheduled</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* --- Yesterday --- */}
                    <View style={styles.dayGroup}>
                        <View style={styles.dayHeader}>
                            <View style={styles.dayBadge}>
                                <Text style={styles.dayBadgeText}>Yest</Text>
                            </View>
                            <Text style={styles.dayDate}>Oct 24</Text>
                        </View>

                        <View style={styles.timelineItemsContainer}>
                            <View style={styles.timelineLine} />

                            {/* Entry 3: Missed */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotMissed]}>
                                    <Text style={[styles.statusIcon, { color: '#FF3B30' }]}>close</Text>
                                </View>
                                <View style={[styles.entryCard, styles.entryCardMissed]}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{medicines[1]?.name || medicines[0]?.name || 'Medicine'}</Text>
                                            <Text style={styles.entrySubtitle}>{medicines[1] ? `${medicines[1].dosage} • ${medicines[1].frequency}` : medicines[0] ? `${medicines[0].dosage} • ${medicines[0].frequency}` : ''}</Text>
                                        </View>
                                        <View style={[styles.timeBadge, styles.timeBadgeStrikethrough]}>
                                            <Text style={[styles.timeBadgeText, styles.timeBadgeTextStrikethrough]}>8:00 PM</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.entryDivider, { borderColor: 'rgba(186, 26, 26, 0.1)' }]} />
                                    <View style={styles.entryFooter}>
                                        <Text style={styles.missedIcon}>error</Text>
                                        <Text style={styles.missedLabel}>Missed Dose</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Entry 4: Taken */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotTaken]}>
                                    <Text style={styles.statusIcon}>check</Text>
                                </View>
                                <View style={styles.entryCard}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{medicines[0]?.name || 'Medicine'}</Text>
                                            <Text style={styles.entrySubtitle}>{medicines[0] ? `${medicines[0].dosage} • ${medicines[0].frequency}` : ''}</Text>
                                        </View>
                                        <View style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>8:00 AM</Text>
                                        </View>
                                    </View>
                                    <View style={styles.entryDivider} />
                                    <View style={styles.entryFooter}>
                                        <Text style={styles.takenText}>task_alt</Text>
                                        <Text style={styles.takenLabel}>Taken at 8:15 AM</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* --- Tuesday --- */}
                    <View style={styles.dayGroup}>
                        <View style={styles.dayHeader}>
                            <View style={styles.dayBadge}>
                                <Text style={styles.dayBadgeText}>Tue</Text>
                            </View>
                            <Text style={styles.dayDate}>Oct 23</Text>
                        </View>

                        <View style={styles.timelineItemsContainer}>
                            <View style={styles.timelineLine} />

                            {/* Entry 5: Skipped */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotSkipped]}>
                                    <Text style={[styles.statusIcon, { color: '#FF9500' }]}>remove</Text>
                                </View>
                                <View style={styles.entryCard}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{medicines[2]?.name || medicines[0]?.name || 'Medicine'}</Text>
                                            <Text style={styles.entrySubtitle}>{medicines[2] ? `${medicines[2].dosage} • ${medicines[2].frequency}` : medicines[0] ? `${medicines[0].dosage} • ${medicines[0].frequency}` : ''}</Text>
                                        </View>
                                        <View style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>12:00 PM</Text>
                                        </View>
                                    </View>
                                    <View style={styles.entryDivider} />
                                    <View style={[styles.entryFooter, { flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.skippedIcon}>horizontal_rule</Text>
                                            <Text style={styles.skippedLabel}>Skipped</Text>
                                        </View>
                                        <Text style={styles.skippedNote}>&quot;Felt nauseous, skipped this dose with food.&quot;</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Entry 6: Taken */}
                            <View style={styles.timelineItemWrapper}>
                                <View style={[styles.statusDot, styles.statusDotTaken]}>
                                    <Text style={styles.statusIcon}>check</Text>
                                </View>
                                <View style={styles.entryCard}>
                                    <View style={styles.entryHeader}>
                                        <View>
                                            <Text style={styles.entryTitle}>{medicines[0]?.name || 'Medicine'}</Text>
                                            <Text style={styles.entrySubtitle}>{medicines[0] ? `${medicines[0].dosage} • ${medicines[0].frequency}` : ''}</Text>
                                        </View>
                                        <View style={styles.timeBadge}>
                                            <Text style={styles.timeBadgeText}>8:00 AM</Text>
                                        </View>
                                    </View>
                                    <View style={styles.entryDivider} />
                                    <View style={styles.entryFooter}>
                                        <Text style={styles.takenText}>task_alt</Text>
                                        <Text style={styles.takenLabel}>Taken at 7:55 AM</Text>
                                    </View>
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
                <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)')} accessibilityLabel="Home" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>home</Text>
                    <Text style={styles.navLabel}>Home</Text>
                </Pressable>
                <Pressable style={styles.navItem} onPress={() => router.push('/medicines')} accessibilityLabel="Library" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>medical_services</Text>
                    <Text style={styles.navLabel}>Library</Text>
                </Pressable>
                <Pressable style={styles.navItem} onPress={() => router.push('/scanner/scan')} accessibilityLabel="Scan" accessibilityRole="tab" accessibilityState={{ selected: false }}>
                    <Text style={styles.navIcon}>document_scanner</Text>
                    <Text style={styles.navLabel}>Scan</Text>
                </Pressable>
                <Pressable style={[styles.navItem, styles.navItemActive]} onPress={() => router.push('/reminders')} accessibilityLabel="Reminders" accessibilityRole="tab" accessibilityState={{ selected: true }}>
                    <Text style={[styles.navIcon, styles.navIconActive]}>alarm</Text>
                    <Text style={[styles.navLabel, styles.navLabelActive]}>Reminders</Text>
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

    // --- TopAppBar ---
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
    },
    profileContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f0edef',
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
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
        position: 'relative',
    },
    notificationIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ba1a1a', // error
        borderWidth: 2,
        borderColor: '#fcf8fb', // surface
    },

    // --- Adherence Card ---
    adherenceCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    progressRingContainer: {
        width: 96,
        height: 96,
        position: 'relative',
    },
    progressTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 22,
        fontWeight: '600',
        color: '#0058bc',
    },
    adherenceTextContainer: {
        flex: 1,
    },
    adherenceTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1d',
        marginBottom: 4,
    },
    adherenceSubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
        marginBottom: 8,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6f3f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },

    // --- Timeline ---
    timelineSection: {
        gap: 24,
    },
    dayGroup: {
        gap: 16,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dayBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#eae7ea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#1b1b1d',
    },
    dayDate: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 15,
        color: '#414755',
    },
    timelineItemsContainer: {
        paddingLeft: 16, // pl-lg
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#e4e2e4', // surface-container-highest
    },
    timelineItemWrapper: {
        position: 'relative',
        marginBottom: 4,
    },
    statusDot: {
        position: 'absolute',
        left: -30, // -left-[30px]
        top: 16,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fcf8fb', // ring-background
        zIndex: 10,
    },
    statusDotTaken: {
        backgroundColor: 'rgba(52, 199, 89, 0.2)',
    },
    statusDotScheduled: {
        backgroundColor: '#e4e2e4', // surface-container-highest
    },
    statusDotMissed: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
    },
    statusDotSkipped: {
        backgroundColor: 'rgba(255, 149, 0, 0.2)',
    },
    statusIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 16,
        color: '#34C759',
    },
    statusIconScheduled: {
        color: '#414755',
    },

    // --- Entry Card ---
    entryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.3)',
        marginBottom: 8,
    },
    entryCardScheduled: {
        opacity: 0.7,
    },
    entryCardMissed: {
        backgroundColor: 'rgba(255, 218, 214, 0.3)', // error-container/30
        borderColor: 'rgba(186, 26, 26, 0.2)',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    entryTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 17,
        fontWeight: '600',
        color: '#1b1b1d',
    },
    entrySubtitle: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 13,
        color: '#414755',
    },
    timeBadge: {
        backgroundColor: '#f6f3f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    timeBadgeStrikethrough: {
        opacity: 0.7,
    },
    timeBadgeText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },
    timeBadgeTextStrikethrough: {
        textDecorationLine: 'line-through',
    },
    entryDivider: {
        borderTopWidth: 1,
        borderColor: 'rgba(193, 198, 215, 0.2)',
        marginVertical: 12,
    },
    entryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    // State Styles
    takenText: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
        color: '#34C759',
    },
    takenLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#34C759',
    },
    scheduledIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
    },
    scheduledLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
    },
    missedIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
        color: '#ba1a1a',
    },
    missedLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#ba1a1a',
    },
    skippedIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 14,
        color: '#FF9500',
    },
    skippedLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#FF9500',
    },
    skippedNote: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 11,
        color: '#414755',
        fontStyle: 'italic',
    },

    // --- BottomNav ---
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 12,
        backgroundColor: 'rgba(252, 248, 251, 0.8)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: '#0058bc',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    navItemActive: {
        backgroundColor: 'rgba(0, 112, 235, 0.2)',
        paddingHorizontal: 16,
    },
    navIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        color: '#414755',
    },
    navIconActive: {
        color: '#0058bc',
    },
    navLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        marginTop: 4,
        color: '#414755',
    },
    navLabelActive: {
        fontWeight: 'bold',
        color: '#0058bc',
    },
});