import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/hooks/useTheme';
import { useAddMedicine } from '../../src/features/medicines/hooks/useAddMedicine';

export default function ManualAddMedicineScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const addMedicine = useAddMedicine();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required', 'Please enter a dosage.');
      return;
    }

    addMedicine.mutate(
      {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim() || 'Once daily',
        startDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          router.replace('/medicines/confirmed');
        },
        onError: (err: Error) => {
          Alert.alert('Error', err?.message || 'Failed to save medicine.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Pressable style={styles.topNavButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Typography variant="body-lg" style={styles.topNavIcon}>arrow_back</Typography>
        </Pressable>
        <Typography variant="headline-md" color={theme.colors['on-surface']} style={styles.topNavTitle}>
          Add Medicine
        </Typography>
        <View style={styles.topNavSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <Typography variant="display-lg-mobile" color={theme.colors['on-surface']} style={styles.pageTitle}>
          Manual Entry
        </Typography>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Input label="Medicine Name" placeholder="e.g. Lisinopril" value={name} onChangeText={setName} accessibilityLabel="Medicine name" />
          </View>
          <View style={styles.inputWrapper}>
            <Input label="Dosage" placeholder="e.g. 10mg" value={dosage} onChangeText={setDosage} accessibilityLabel="Dosage" />
          </View>
          <View style={styles.inputWrapper}>
            <Input label="Frequency" placeholder="e.g. Once a day" value={frequency} onChangeText={setFrequency} accessibilityLabel="Frequency" />
          </View>
        </View>

        {/* Spacer for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Bottom Save Button */}
      <View style={[styles.bottomActionContainer, { borderTopColor: theme.colors['outline-variant'] }]}>
        <View style={styles.buttonWrapper}>
          <Button
            label={addMedicine.isPending ? "Saving..." : "Save Medicine"}
            onPress={handleSave}
            accessibilityLabel="Save medicine"
            accessibilityRole="button"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // --- Top Nav ---
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
    fontSize: 24,
    color: '#414755',
  },
  topNavTitle: {
    fontWeight: '600',
  },
  topNavSpacer: {
    width: 40,
  },

  // --- Content ---
  pageTitle: {
    marginTop: 16,
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    width: '100%',
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
  },
  buttonWrapper: {
    width: '100%',
  },
});