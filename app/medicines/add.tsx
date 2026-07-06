import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAddMedicine } from '@/features/medicines/hooks/useAddMedicine';

// --- Mock Data for Dropdowns & Selectors ---
const UNIT_OPTIONS = ['mg', 'ml', 'mcg', 'g', 'IU'];
const FREQUENCY_OPTIONS = ['Once a day', 'Twice a day', 'Three times a day', 'As needed (PRN)'];

const APPEARANCE_ICONS = [
  { id: 'pill', icon: 'pill' },
  { id: 'prescriptions', icon: 'prescriptions' },
  { id: 'vaccines', icon: 'vaccines' },
  { id: 'water_drop', icon: 'water_drop' },
];

const COLOR_OPTIONS = [
  '#005bc1', // surface-tint (Primary)
  '#FF3B30', // Red
  '#34C759', // Green
  '#FF9500', // Orange
  '#8a2bb9', // Tertiary (Purple)
  '#c1c6d7', // Grey outline-variant (Add)
];

export default function AddMedicine() {
  const router = useRouter();
  const addMedicine = useAddMedicine();

  // --- State ---
  const [name, setName] = useState('');
  const [dosageValue, setDosageValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('mg');
  const [selectedFrequency, setSelectedFrequency] = useState('Once a day');
  const [selectedIcon, setSelectedIcon] = useState('pill');
  const [selectedColor, setSelectedColor] = useState('#005bc1');
  const [instructions, setInstructions] = useState('');

  // --- State to handle simple Dropdown toggles ---
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }
    if (!dosageValue.trim()) {
      Alert.alert('Required', 'Please enter a dosage.');
      return;
    }

    const dosage = `${dosageValue.trim()}${selectedUnit}`;

    addMedicine.mutate(
      {
        name: name.trim(),
        dosage,
        frequency: selectedFrequency,
        startDate: new Date().toISOString(),
        instructions: instructions.trim() || undefined,
      },
      {
        onSuccess: (saved) => {
          router.replace({
            pathname: '/medicines/confirmed',
            params: {
              id: saved.id,
              name: saved.name,
              dosage: saved.dosage,
              frequency: saved.frequency,
            },
          });
        },
        onError: (err: Error) => {
          Alert.alert('Error', err?.message || 'Failed to save medicine. Please try again.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* TopAppBar */}
      <View style={styles.topAppBar}>
        <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.icon}>arrow_back</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>Add Medicine</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Scan Prescription Promo Card */}
        <Pressable style={({ pressed }) => [styles.promoCard, pressed && styles.pressedScale]} accessibilityLabel="Scan prescription, auto-fill details using AI" accessibilityRole="button">
          <View style={styles.promoIconContainer}>
            <Text style={styles.promoIcon}>document_scanner</Text>
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Scan Prescription</Text>
            <Text style={styles.promoSubtitle}>Auto-fill details using AI</Text>
          </View>
          <Text style={styles.promoChevron}>chevron_right</Text>
        </Pressable>

        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* Medicine Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Medicine Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Amoxicillin"
              placeholderTextColor="#717786"
              value={name}
              onChangeText={setName}
              accessibilityLabel="Medicine name"
            />
          </View>

          {/* Dosage & Unit */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Dosage</Text>
            <View style={styles.rowInputContainer}>
              <TextInput
                style={[styles.textInput, styles.flexInput]}
                placeholder="250"
                placeholderTextColor="#717786"
                keyboardType="numeric"
                value={dosageValue}
                onChangeText={setDosageValue}
                accessibilityLabel="Dosage value"
              />
              {/* Custom Unit Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                  accessibilityLabel={`Unit: ${selectedUnit}`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showUnitDropdown }}
                >
                  <Text style={styles.dropdownText}>{selectedUnit}</Text>
                  <Text style={styles.dropdownChevron}>expand_more</Text>
                </Pressable>
                {showUnitDropdown && (
                  <View style={styles.dropdownList}>
                    {UNIT_OPTIONS.map((unit) => (
                      <Pressable
                        key={unit}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedUnit(unit);
                          setShowUnitDropdown(false);
                        }}
                        accessibilityLabel={unit}
                        accessibilityRole="button"
                        accessibilityState={{ selected: selectedUnit === unit }}
                      >
                        <Text style={[styles.dropdownItemText, selectedUnit === unit && styles.dropdownItemSelected]}>
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.dropdownWrapperFull}>
              <Pressable
                style={styles.dropdownTriggerFull}
                onPress={() => setShowFreqDropdown(!showFreqDropdown)}
                accessibilityLabel={`Frequency: ${selectedFrequency}`}
                accessibilityRole="button"
                accessibilityState={{ expanded: showFreqDropdown }}
              >
                <Text style={styles.dropdownText}>{selectedFrequency}</Text>
                <Text style={styles.dropdownChevron}>expand_more</Text>
              </Pressable>
              {showFreqDropdown && (
                <View style={styles.dropdownListFull}>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <Pressable
                      key={freq}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedFrequency(freq);
                        setShowFreqDropdown(false);
                      }}
                      accessibilityLabel={freq}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedFrequency === freq }}
                    >
                      <Text style={[styles.dropdownItemText, selectedFrequency === freq && styles.dropdownItemSelected]}>
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Reason (Optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Reason for taking <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Blood Pressure"
              placeholderTextColor="#717786"
              value={instructions}
              onChangeText={setInstructions}
              accessibilityLabel="Reason for taking (optional)"
            />
          </View>

          {/* Appearance Section */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Appearance</Text>

            {/* Icon Grid */}
            <View style={styles.iconGrid}>
              {APPEARANCE_ICONS.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.iconBox,
                    selectedIcon === item.id && styles.iconBoxSelected,
                    pressed && styles.pressedScale
                  ]}
                  onPress={() => setSelectedIcon(item.id)}
                  accessibilityLabel={`Icon: ${item.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedIcon === item.id }}
                >
                  <Text style={[styles.iconBoxText, selectedIcon === item.id && styles.iconBoxTextSelected]}>
                    {item.icon}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Color Picker */}
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((color, index) => {
                // Check if last item (Add button)
                const isAddButton = index === COLOR_OPTIONS.length - 1;

                return (
                  <Pressable
                    key={color}
                    style={({ pressed }) => [
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCircleSelected,
                      isAddButton && styles.colorCircleAdd,
                      pressed && styles.pressedScale
                    ]}
                    onPress={() => {
                      if (!isAddButton) setSelectedColor(color);
                    }}
                    accessibilityLabel={isAddButton ? 'Add custom color' : `Color ${color}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedColor === color }}
                  >
                    {isAddButton && <Text style={styles.colorAddIcon}>add</Text>}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Save Button */}
      <View style={styles.bottomActionContainer}>
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed, addMedicine.isPending && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={addMedicine.isPending}
          accessibilityLabel="Save medicine"
          accessibilityRole="button"
        >
          {addMedicine.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveIcon}>save</Text>
          )}
          <Text style={styles.saveText}>{addMedicine.isPending ? 'Saving...' : 'Save Medicine'}</Text>
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
    paddingTop: 12,
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
  iconButton: {
    padding: 8,
  },
  icon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc', // primary
  },
  appBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#0058bc',
  },
  spacer: {
    width: 24,
  },

  // --- Promo Card ---
  promoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 24,
  },
  promoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0070eb', // primary-container
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  promoSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  promoChevron: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // --- Form ---
  formContainer: {
    gap: 16, // gap-lg
  },
  fieldGroup: {
    gap: 4, // gap-xs
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#1b1b1d',
  },
  optionalText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontWeight: '400',
    color: '#414755',
  },
  textInput: {
    backgroundColor: '#f6f3f5', // surface-container
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },

  // --- Row Inputs (Dosage) ---
  rowInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  flexInput: {
    flex: 1,
  },
  dropdownWrapper: {
    width: 112, // w-28
    position: 'relative',
    zIndex: 10,
  },
  dropdownTrigger: {
    backgroundColor: '#f6f3f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },
  dropdownChevron: {
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
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
  },
  dropdownItemSelected: {
    fontWeight: '600',
    color: '#0058bc',
  },

  // --- Full Dropdown (Frequency) ---
  dropdownWrapperFull: {
    width: '100%',
    position: 'relative',
    zIndex: 9,
  },
  dropdownTriggerFull: {
    backgroundColor: '#f6f3f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownListFull: {
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

  // --- Appearance ---
  iconGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f6f3f5', // surface-container
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxSelected: {
    borderWidth: 2,
    borderColor: '#0058bc',
  },
  iconBoxText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 32,
    color: '#717786', // outline
  },
  iconBoxTextSelected: {
    color: '#0058bc',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#0058bc',
  },
  colorCircleAdd: {
    backgroundColor: '#c1c6d7', // outline-variant
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorAddIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#1b1b1d',
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
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(252, 248, 251, 0.9)',
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