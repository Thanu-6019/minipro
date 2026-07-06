import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAddMedicine } from '../../src/features/medicines/hooks/useAddMedicine';
import type { PipelineResult } from '../../src/features/scanner/prescription.pipeline';

function parseDosage(dosageStr: string): { amount: string; unit: string } {
  const match = dosageStr.match(/^(\d+)\s*(mg|ml|mcg|g|tablet|capsule)/i);
  if (match) return { amount: match[1], unit: match[2].toLowerCase() };
  const numOnly = dosageStr.match(/^(\d+)/);
  if (numOnly) return { amount: numOnly[1], unit: 'mg' };
  return { amount: dosageStr, unit: 'mg' };
}

export default function PrescriptionReview() {
  const router = useRouter();
  const { result, imageUri } = useLocalSearchParams<{ result: string; imageUri: string }>();
  const addMedicine = useAddMedicine();

  const pipelineResult: PipelineResult | null = useMemo(() => {
    try {
      return result ? JSON.parse(result) : null;
    } catch {
      return null;
    }
  }, [result]);

  const firstMed = pipelineResult?.verifiedMedicines?.[0] || pipelineResult?.medications?.[0];
  const parsedDosage = firstMed ? parseDosage(firstMed.dosage) : { amount: '500', unit: 'mg' };

  const [medicineName, setMedicineName] = useState(firstMed?.medicineName || '');
  const [dosage, setDosage] = useState(parsedDosage.amount);
  const [dosageUnit, setDosageUnit] = useState(parsedDosage.unit);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [frequency, setFrequency] = useState(firstMed?.frequency || '');
  const [duration, setDuration] = useState(firstMed?.duration || '');

  const units = ['mg', 'ml', 'mcg', 'g'];

  const handleConfirm = () => {
    if (!medicineName.trim()) {
      Alert.alert('Missing Name', 'Please enter the medicine name.');
      return;
    }

    addMedicine.mutate(
      {
        name: medicineName.trim(),
        dosage: `${dosage}${dosageUnit}`,
        frequency: frequency.trim() || 'Once daily',
        startDate: new Date().toISOString(),
        instructions: firstMed?.beforeAfterMeal ? `${firstMed.beforeAfterMeal} meal` : undefined,
      },
      {
        onSuccess: (savedMedicine) => {
          router.replace({
            pathname: '/scanner/verification',
            params: {
              name: medicineName.trim(),
              dosage: `${dosage}${dosageUnit}`,
              frequency: frequency.trim() || 'Once daily',
              id: savedMedicine.id,
            },
          });
        },
        onError: () => {
          Alert.alert('Error', 'Failed to save medicine. Please try again.');
        },
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowUnitDropdown(false); }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topAppBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backIcon}>arrow_back</Text>
          </Pressable>
          <Text style={styles.appBarTitle}>Review Extraction</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {imageUri && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Scanned Image Preview</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" accessibilityLabel="Scanned prescription image" />
                <View style={styles.imageGlassOverlay} />
                <View style={styles.imageBadge}>
                  <Text style={styles.imageBadgeIcon}>document_scanner</Text>
                  <Text style={styles.imageBadgeText}>Original Scan</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.resultCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderIcon}>auto_awesome</Text>
              <Text style={styles.cardHeaderTitle}>AI Extraction Results</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Please review and edit the details below before confirming to add to your MedTrack.
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Medicine Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={medicineName}
                    onChangeText={setMedicineName}
                    placeholder="Enter medicine name"
                    placeholderTextColor="rgba(65, 71, 85, 0.4)"
                    accessibilityLabel="Medicine name"
                  />
                  {medicineName ? (
                    <View style={styles.aiVerifiedBadge}>
                      <Text style={styles.badgeIconSmall}>check_circle</Text>
                      <Text style={styles.badgeTextSmall}>AI Verified</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Dosage</Text>
                <View style={styles.dosageRow}>
                  <TextInput
                    style={[styles.textInput, styles.dosageInput]}
                    value={dosage}
                    onChangeText={setDosage}
                    keyboardType="numeric"
                    placeholder="Amount"
                    placeholderTextColor="rgba(65, 71, 85, 0.4)"
                    accessibilityLabel="Dosage amount"
                  />
                  <View style={styles.selectContainer}>
                    <Pressable
                      style={styles.selectBox}
                      onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                      accessibilityLabel="Dosage unit"
                      accessibilityRole="button"
                    >
                      <Text style={styles.selectText}>{dosageUnit}</Text>
                      <Text style={styles.selectIcon}>expand_more</Text>
                    </Pressable>
                    {showUnitDropdown && (
                      <View style={styles.dropdownList}>
                        {units.map((unit) => (
                          <Pressable
                            key={unit}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setDosageUnit(unit);
                              setShowUnitDropdown(false);
                            }}
                            accessibilityLabel={`Select ${unit}`}
                            accessibilityRole="button"
                          >
                            <Text style={[styles.dropdownItemText, dosageUnit === unit && styles.dropdownItemSelected]}>
                              {unit}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Frequency</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={frequency}
                    onChangeText={setFrequency}
                    placeholder="e.g. Twice daily"
                    placeholderTextColor="rgba(65, 71, 85, 0.4)"
                    accessibilityLabel="Frequency"
                  />
                  {frequency ? (
                    <View style={styles.aiVerifiedBadge}>
                      <Text style={styles.badgeIconSmall}>check_circle</Text>
                      <Text style={styles.badgeTextSmall}>AI Verified</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Duration</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="e.g. 7 Days"
                    placeholderTextColor="rgba(65, 71, 85, 0.4)"
                    accessibilityLabel="Duration"
                  />
                  {duration ? (
                    <View style={styles.aiVerifiedBadge}>
                      <Text style={styles.badgeIconSmall}>check_circle</Text>
                      <Text style={styles.badgeTextSmall}>AI Verified</Text>
                    </View>
                  ) : (
                    <View style={styles.reviewNeededBadge}>
                      <Text style={styles.badgeIconSmall}>edit</Text>
                      <Text style={[styles.badgeTextSmall, styles.reviewBadgeText]}>Review Needed</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomAction}>
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
              addMedicine.isPending && { opacity: 0.6 },
            ]}
            onPress={handleConfirm}
            disabled={addMedicine.isPending}
            accessibilityLabel="Confirm details"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonIcon}>check_circle</Text>
            <Text style={styles.confirmButtonText}>
              {addMedicine.isPending ? 'Saving...' : 'Confirm Details'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingTop: 24,
    paddingBottom: 120, // offset for bottom action
  },
  // Top App Bar
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(252, 248, 251, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#1b1b1d', // on-surface
  },
  appBarTitle: {
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },

  // Image Section
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755', // on-surface-variant
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f6f3f5', // surface-container-low
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  imageGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageBadgeIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
    color: '#0058bc', // primary
    marginRight: 4,
  },
  imageBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#0058bc',
  },

  // Result Card
  resultCard: {
    backgroundColor: '#ffffff', // surface-light
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
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
  cardSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    lineHeight: 20,
    color: '#414755',
    marginBottom: 24,
  },

  // Form Fields
  formContainer: {
    gap: 16,
  },
  fieldContainer: {
    position: 'relative',
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    marginBottom: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    width: '100%',
    backgroundColor: '#f6f3f5', // surface-container-low
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },

  // Dosage Row
  dosageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dosageInput: {
    flex: 1,
  },
  selectContainer: {
    width: 96, // w-24 approx
    position: 'relative',
    zIndex: 10,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f6f3f5',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },
  selectIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#1b1b1d',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },
  dropdownItemSelected: {
    fontWeight: '600',
    color: '#0058bc',
  },

  // Badges inside inputs
  aiVerifiedBadge: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6ffb85', // secondary-container
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  reviewNeededBadge: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4e2e4', // surface-container-highest
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  badgeIconSmall: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 12,
    color: '#00732a', // on-secondary-container
  },
  badgeTextSmall: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#00732a',
  },
  reviewBadgeText: {
    color: '#414755',
  },

  // Warning Text
  warningText: {
    marginTop: 4,
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#FF9500', // status-pending
  },

  // Bottom Action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(252, 248, 251, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 215, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#0058bc',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  confirmButtonIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
  },
  confirmButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
});