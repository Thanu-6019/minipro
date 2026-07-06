import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAddAppointment } from '../../src/features/appointments/hooks/useAppointments';

type ReminderOption = '1day' | '1hour';

export default function NewAppointment() {
  const router = useRouter();
  const { mutate: addAppointment, isPending } = useAddAppointment();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState<ReminderOption>('1day');

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const title = doctorName.trim() || 'Medical Appointment';
    const dateStr = date.trim();
    const timeStr = time.trim();
    if (!dateStr) {
      Alert.alert('Missing date', 'Please enter a date for the appointment.');
      return;
    }
    const appointmentDate = new Date(`${dateStr}T${timeStr || '12:00'}:00`).toISOString();
    addAppointment(
      { title, appointment_date: appointmentDate, location: facility.trim() || undefined },
      { onSuccess: () => router.push('/appointments') }
    );
  };

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.topAppBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>arrow_back</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>New Appointment</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.contextText}>
          Fill in the details below to schedule a new medical visit.
        </Text>

        {/* 1. Provider Details Section */}
        <View style={styles.glassCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>person</Text>
            <Text style={styles.sectionTitle}>Provider Details</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Doctor Name</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefixIcon}>badge</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Dr. Jane Smith"
                placeholderTextColor="#717786"
                value={doctorName}
                onChangeText={setDoctorName}
                accessibilityLabel="Doctor name"
                autoComplete="name"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.fieldLabel}>Specialty</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefixIcon}>stethoscope</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Select specialty..."
                  placeholderTextColor="#717786"
                  value={specialty}
                  onChangeText={setSpecialty}
                  accessibilityLabel="Specialty"
                  autoComplete="off"
                  returnKeyType="next"
                />
                <Text style={styles.inputSuffixIcon}>expand_more</Text>
              </View>
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.fieldLabel}>Facility / Hospital</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefixIcon}>local_hospital</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="City Medical Center"
                  placeholderTextColor="#717786"
                  value={facility}
                  onChangeText={setFacility}
                  accessibilityLabel="Facility or hospital"
                  autoComplete="off"
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>
        </View>

        {/* 2. Date & Time Section */}
        <View style={styles.glassCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>calendar_clock</Text>
            <Text style={styles.sectionTitle}>Date &amp; Time</Text>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefixIcon}>calendar_today</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="dd-mm-yyyy"
                  placeholderTextColor="#717786"
                  value={date}
                  onChangeText={setDate}
                  accessibilityLabel="Appointment date"
                  autoComplete="off"
                  returnKeyType="next"
                />
              </View>
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.fieldLabel}>Time</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefixIcon}>schedule</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="--:-- --"
                  placeholderTextColor="#717786"
                  value={time}
                  onChangeText={setTime}
                  accessibilityLabel="Appointment time"
                  autoComplete="off"
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Notes & Reminders Section */}
        <View style={styles.glassCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>description</Text>
            <Text style={styles.sectionTitle}>Notes &amp; Reminders</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Symptoms, questions to ask, required documents..."
              placeholderTextColor="#717786"
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              accessibilityLabel="Notes"
              autoComplete="off"
              returnKeyType="done"
            />
          </View>

          <View style={styles.reminderBox}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderLeft}>
                <Text style={styles.reminderBellIcon}>notifications_active</Text>
                <Text style={styles.reminderTitle}>Set Reminder</Text>
              </View>
              <Switch
                trackColor={{ false: '#e4e2e4', true: '#0058bc' }}
                thumbColor={reminderEnabled ? '#ffffff' : '#ffffff'}
                onValueChange={setReminderEnabled}
                value={reminderEnabled}
                style={styles.switch}
                accessibilityLabel="Set reminder"
                accessibilityRole="switch"
                accessibilityState={{ checked: reminderEnabled }}
              />
            </View>

            <View style={[styles.reminderOptions, { opacity: reminderEnabled ? 1 : 0.4, pointerEvents: reminderEnabled ? 'auto' : 'none' }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.reminderChip,
                  reminderTime === '1day' && styles.reminderChipActive,
                  pressed && styles.pressedScale
                ]}
                onPress={() => setReminderTime('1day')}
                accessibilityLabel="Remind 1 day before"
                accessibilityRole="button"
                accessibilityState={{ selected: reminderTime === '1day' }}
              >
                <Text style={[styles.reminderChipText, reminderTime === '1day' && styles.reminderChipTextActive]}>
                  1 Day Before
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.reminderChip,
                  reminderTime === '1hour' && styles.reminderChipActive,
                  pressed && styles.pressedScale
                ]}
                onPress={() => setReminderTime('1hour')}
                accessibilityLabel="Remind 1 hour before"
                accessibilityRole="button"
                accessibilityState={{ selected: reminderTime === '1hour' }}
              >
                <Text style={[styles.reminderChipText, reminderTime === '1hour' && styles.reminderChipTextActive]}>
                  1 Hour Before
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomActionContainer}>
        <View style={styles.bottomActionInner}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressedScale]}
            onPress={() => router.back()}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressedScale]}
            onPress={handleSubmit}
            disabled={isPending}
            accessibilityLabel="Schedule appointment"
            accessibilityRole="button"
            accessibilityState={{ disabled: isPending }}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Schedule Appointment</Text>
                <Text style={styles.submitButtonIcon}>check_circle</Text>
              </>
            )}
          </Pressable>
        </View>
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
  backButton: { padding: 8 },
  backIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#414755' },
  appBarTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 22, fontWeight: '600', color: '#0058bc' },
  navSpacer: { width: 40 },
  contextText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755', marginBottom: 24 },

  // --- Glass Card ---
  glassCard: {
    backgroundColor: 'rgba(252, 248, 251, 0.85)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 24,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#0058bc' },
  sectionTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 20, fontWeight: '600', color: '#1b1b1d' },

  // --- Form Fields ---
  fieldGroup: { marginBottom: 12 },
  rowGroup: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  fieldLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#414755', marginBottom: 4 },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f3f5',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    borderRadius: 8,
  },
  inputPrefixIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: 'rgba(113, 119, 134, 0.8)',
  },
  inputSuffixIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: 'rgba(113, 119, 134, 0.8)',
  },
  textInput: {
    flex: 1,
    paddingLeft: 44,
    paddingRight: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },
  textArea: {
    backgroundColor: '#f6f3f5',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
    minHeight: 80,
  },

  // --- Reminder Section ---
  reminderBox: {
    backgroundColor: '#f6f3f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    marginTop: 8,
  },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reminderBellIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 20, color: '#0058bc' },
  reminderTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 15, color: '#1b1b1d' },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  reminderOptions: { flexDirection: 'row', gap: 8 },
  reminderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderChipActive: {
    backgroundColor: '#d8e2ff',
    borderColor: '#0058bc',
  },
  reminderChipText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#414755' },
  reminderChipTextActive: { color: '#004493', fontWeight: '700' },

  // --- Bottom Actions ---
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252, 248, 251, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 226, 228, 0.5)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomActionInner: { flexDirection: 'row', gap: 12, maxWidth: 500, width: '100%', alignSelf: 'center' },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eae7ea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#0058bc',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  cancelButtonText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 15, fontWeight: '600', color: '#0058bc' },
  submitButtonText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 15, fontWeight: '600', color: '#ffffff' },
  submitButtonIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 20, color: '#ffffff' },

  // --- Common ---
  pressedScale: { transform: [{ scale: 0.95 }] },
});