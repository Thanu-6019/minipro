import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

type FrequencyOption = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
type MealOption = 'Before Meal' | 'With Food' | 'Empty Stomach';

export default function ScheduleMedicine() {
  const router = useRouter();
  const { name, dosage } = useLocalSearchParams<{ name: string; dosage: string }>();
  // --- State ---
  const [selectedFreq, setSelectedFreq] = useState<FrequencyOption>('Daily');
  const [selectedMeal, setSelectedMeal] = useState<MealOption>('Before Meal');

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Pressable style={styles.topNavButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.topNavIcon}>arrow_back</Text>
        </Pressable>
        <Text style={styles.topNavTitle}>Schedule Medicine</Text>
        <View style={styles.topNavSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Context Header */}
        <View style={styles.contextHeader}>
          <View style={styles.contextIconContainer}>
            <Text style={styles.contextIcon}>pill</Text>
          </View>
          <View>
            <Text style={styles.contextTitle}>{name || 'Medicine'}</Text>
            <Text style={styles.contextSubtitle}>{dosage || 'Dosage not specified'}</Text>
          </View>
        </View>

        {/* Frequency Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Frequency</Text>
          <View style={styles.freqGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.freqCard,
                selectedFreq === 'Daily' && styles.freqCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedFreq('Daily')}
              accessibilityLabel="Daily"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedFreq === 'Daily' }}
            >
              <Text style={[styles.freqIcon, selectedFreq === 'Daily' && styles.freqIconActive]}>calendar_today</Text>
              <Text style={[styles.freqLabel, selectedFreq === 'Daily' && styles.freqLabelActive]}>Daily</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.freqCard,
                selectedFreq === 'Weekly' && styles.freqCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedFreq('Weekly')}
              accessibilityLabel="Weekly"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedFreq === 'Weekly' }}
            >
              <Text style={[styles.freqIcon, selectedFreq === 'Weekly' && styles.freqIconActive]}>date_range</Text>
              <Text style={[styles.freqLabel, selectedFreq === 'Weekly' && styles.freqLabelActive]}>Weekly</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.freqCard,
                selectedFreq === 'Monthly' && styles.freqCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedFreq('Monthly')}
              accessibilityLabel="Monthly"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedFreq === 'Monthly' }}
            >
              <Text style={[styles.freqIcon, selectedFreq === 'Monthly' && styles.freqIconActive]}>calendar_month</Text>
              <Text style={[styles.freqLabel, selectedFreq === 'Monthly' && styles.freqLabelActive]}>Monthly</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.freqCard,
                selectedFreq === 'Custom' && styles.freqCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedFreq('Custom')}
              accessibilityLabel="Custom"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedFreq === 'Custom' }}
            >
              <Text style={[styles.freqIcon, selectedFreq === 'Custom' && styles.freqIconActive]}>tune</Text>
              <Text style={[styles.freqLabel, selectedFreq === 'Custom' && styles.freqLabelActive]}>Custom</Text>
            </Pressable>
          </View>
        </View>

        {/* Time Picker & Timeline */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Times Per Day</Text>
            <Text style={styles.sectionCountLabel}>2 times</Text>
          </View>

          <View style={styles.timelineCard}>
            {/* Timeline Visualization */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />

              {/* Morning Pin */}
              <View style={[styles.timelinePin, { left: '25%' }]}>
                <View style={styles.timelinePinIconContainer}>
                  <Text style={styles.timelinePinIcon}>wb_sunny</Text>
                </View>
                <Text style={styles.timelinePinTime}>08:00 AM</Text>
              </View>

              {/* Evening Pin */}
              <View style={[styles.timelinePin, { left: '75%' }]}>
                <View style={styles.timelinePinIconContainer}>
                  <Text style={styles.timelinePinIcon}>dark_mode</Text>
                </View>
                <Text style={styles.timelinePinTime}>08:00 PM</Text>
              </View>
            </View>

            {/* Dose Entries */}
            <View style={styles.doseEntriesContainer}>
              {/* Dose 1 */}
              <View style={styles.doseRow}>
                <View style={styles.doseRowLeft}>
                  <View style={styles.doseIconContainer}>
                    <Text style={styles.doseIcon}>wb_sunny</Text>
                  </View>
                  <View>
                    <Text style={styles.doseLabel}>Dose 1</Text>
                    <Text style={styles.doseTime}>08:00 AM</Text>
                  </View>
                </View>
                <Pressable style={styles.doseRemoveButton} accessibilityLabel="Remove dose 1" accessibilityRole="button">
                  <Text style={styles.doseRemoveIcon}>close</Text>
                </Pressable>
              </View>

              {/* Dose 2 */}
              <View style={styles.doseRow}>
                <View style={styles.doseRowLeft}>
                  <View style={styles.doseIconContainer}>
                    <Text style={styles.doseIcon}>dark_mode</Text>
                  </View>
                  <View>
                    <Text style={styles.doseLabel}>Dose 2</Text>
                    <Text style={styles.doseTime}>08:00 PM</Text>
                  </View>
                </View>
                <Pressable style={styles.doseRemoveButton} accessibilityLabel="Remove dose 2" accessibilityRole="button">
                  <Text style={styles.doseRemoveIcon}>close</Text>
                </Pressable>
              </View>

              {/* Add Time Button */}
              <Pressable style={styles.addTimeButton} accessibilityLabel="Add time" accessibilityRole="button">
                <Text style={styles.addTimeIcon}>add</Text>
                <Text style={styles.addTimeLabel}>Add Time</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Meal Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Meal Instructions</Text>
          <View style={styles.mealGrid}>

            <Pressable
              style={({ pressed }) => [
                styles.mealCard,
                selectedMeal === 'Before Meal' && styles.mealCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedMeal('Before Meal')}
              accessibilityLabel="Before Meal"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedMeal === 'Before Meal' }}
            >
              <Text style={[styles.mealIcon, selectedMeal === 'Before Meal' && styles.mealIconActive]}>restaurant</Text>
              <Text style={[styles.mealLabel, selectedMeal === 'Before Meal' && styles.mealLabelActive]}>Before Meal</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.mealCard,
                selectedMeal === 'With Food' && styles.mealCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedMeal('With Food')}
              accessibilityLabel="With Food"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedMeal === 'With Food' }}
            >
              <Text style={[styles.mealIcon, selectedMeal === 'With Food' && styles.mealIconActive]}>local_dining</Text>
              <Text style={[styles.mealLabel, selectedMeal === 'With Food' && styles.mealLabelActive]}>With Food</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.mealCard,
                selectedMeal === 'Empty Stomach' && styles.mealCardActive,
                pressed && styles.pressedScale
              ]}
              onPress={() => setSelectedMeal('Empty Stomach')}
              accessibilityLabel="Empty Stomach"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedMeal === 'Empty Stomach' }}
            >
              <Text style={[styles.mealIcon, selectedMeal === 'Empty Stomach' && styles.mealIconActive]}>no_meals</Text>
              <Text style={[styles.mealLabel, selectedMeal === 'Empty Stomach' && styles.mealLabelActive]}>Empty Stomach</Text>
            </Pressable>

          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomActionContainer}>
        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} accessibilityLabel="Save schedule" accessibilityRole="button">
          <Text style={styles.saveIcon}>check_circle</Text>
          <Text style={styles.saveText}>Save Schedule</Text>
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
  },

  // --- Top Navigation ---
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(252, 248, 251, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  topNavIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755', // on-surface-variant
  },
  topNavTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  topNavSpacer: {
    width: 40,
  },

  // --- Context Header ---
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  contextIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#0070eb', // primary-container
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  contextIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 32,
    color: '#fefcff', // on-primary-container
  },
  contextTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  contextSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },

  // --- Generic Section ---
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionCountLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#0058bc',
  },

  // --- Frequency Grid ---
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  freqCardActive: {
    borderColor: '#0058bc',
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
  },
  freqIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755',
  },
  freqIconActive: {
    color: '#0058bc',
  },
  freqLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  freqLabelActive: {
    color: '#0058bc',
  },

  // --- Timeline ---
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  timelineContainer: {
    height: 96,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#dcd9dc', // surface-dim
    borderRadius: 2,
  },
  timelinePin: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    alignItems: 'center',
  },
  timelinePinIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0058bc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timelinePinIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#ffffff',
  },
  timelinePinTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#1b1b1d',
    marginTop: 8,
  },

  // --- Dose Entries ---
  doseEntriesContainer: {
    gap: 12,
    paddingTop: 4,
  },
  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
  },
  doseRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e4e2e4', // surface-container-highest
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#414755',
  },
  doseLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#1b1b1d',
  },
  doseTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 15,
    color: '#0058bc',
  },
  doseRemoveButton: {
    padding: 8,
    borderRadius: 20,
  },
  doseRemoveIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#414755',
  },
  addTimeButton: {
    width: '100%',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 88, 188, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addTimeIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#0058bc',
  },
  addTimeLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },

  // --- Meal Instructions ---
  mealGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mealCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  mealCardActive: {
    borderColor: '#0058bc',
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
  },
  mealIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755',
    marginBottom: 4,
    textAlign: 'center',
  },
  mealIconActive: {
    color: '#0058bc',
  },
  mealLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    textAlign: 'center',
  },
  mealLabelActive: {
    color: '#0058bc',
  },

  // --- Bottom Action ---
  bottomSpacer: {
    height: 100,
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(252, 248, 251, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 215, 0.2)',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#0058bc',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  saveIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
  },
  saveText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },

  // --- Common ---
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
});