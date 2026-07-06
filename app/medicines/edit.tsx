import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '../../src/components/ui/Typography';
import { Input } from '../../src/components/forms/Input';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/hooks/useTheme';
import { useMedicine } from '../../src/features/medicines/hooks/useMedicine';
import { useUpdateMedicine } from '../../src/features/medicines/hooks/useUpdateMedicine';
import type { Medicine } from '../../src/features/medicines/services/medicine.service.interface';

function EditForm({ medicine }: { medicine: Medicine }) {
  const router = useRouter();
  const { theme } = useTheme();
  const updateMedicine = useUpdateMedicine();
  const [name, setName] = useState(medicine.name);
  const [dosage, setDosage] = useState(medicine.dosage);
  const [frequency, setFrequency] = useState(medicine.frequency);

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required', 'Please enter a dosage.');
      return;
    }
    updateMedicine.mutate(
      { ...medicine, name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim() || medicine.frequency },
      {
        onSuccess: () => router.back(),
        onError: (err: Error) => Alert.alert('Error', err?.message || 'Failed to update medicine.'),
      }
    );
  };

  return (
    <>
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Input label="Medicine Name" value={name} onChangeText={setName} accessibilityLabel="Medicine name" />
        </View>
        <View style={styles.inputWrapper}>
          <Input label="Dosage" value={dosage} onChangeText={setDosage} accessibilityLabel="Dosage" />
        </View>
        <View style={styles.inputWrapper}>
          <Input label="Frequency" value={frequency} onChangeText={setFrequency} accessibilityLabel="Frequency" />
        </View>
      </View>

      <View style={styles.bottomSpacer} />

      <View style={[styles.bottomActionContainer, { borderTopColor: theme.colors['outline-variant'] }]}>
        <View style={styles.buttonWrapper}>
          <Button
            label={updateMedicine.isPending ? "Updating..." : "Update Medicine"}
            onPress={handleUpdate}
            accessibilityLabel="Update medicine"
            accessibilityRole="button"
          />
        </View>
      </View>
    </>
  );
}

export default function EditMedicineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { data: medicine, isLoading: loadingMedicine } = useMedicine(id || '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topNav}>
        <Pressable style={styles.topNavButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Typography variant="body-lg" style={styles.topNavIcon}>arrow_back</Typography>
        </Pressable>
        <Typography variant="headline-md" color={theme.colors['on-surface']} style={styles.topNavTitle}>
          Edit Medicine
        </Typography>
        <View style={styles.topNavSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Typography variant="display-lg-mobile" color={theme.colors['on-surface']} style={styles.pageTitle}>
          Update Details
        </Typography>

        {loadingMedicine ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : medicine ? (
          <EditForm medicine={medicine} />
        ) : (
          <Typography variant="body-lg" color={theme.colors.error} style={{ textAlign: 'center', marginTop: 40 }}>
            Medicine not found.
          </Typography>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

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
