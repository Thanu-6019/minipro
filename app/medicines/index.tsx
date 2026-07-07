import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMedicines } from '@/features/medicines/hooks/useMedicines';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import type { Medicine } from '@/features/medicines/services/medicine.service.interface';
import UnifiedBottomNav from '@/components/UnifiedBottomNav';

const FILTERS = ['All Meds', 'Active', 'As Needed', 'Past'] as const;
type FilterKey = typeof FILTERS[number];

const ICON_PALETTE = [
  { icon: 'pill', iconBg: 'rgba(0, 88, 188, 0.2)', iconColor: '#0058bc', overlayColor: 'rgba(0, 88, 188, 0.05)' },
  { icon: 'prescriptions', iconBg: 'rgba(138, 43, 185, 0.2)', iconColor: '#8a2bb9', overlayColor: 'rgba(138, 43, 185, 0.05)' },
  { icon: 'water_drop', iconBg: 'rgba(0, 110, 40, 0.3)', iconColor: '#006e28', overlayColor: 'rgba(0, 110, 40, 0.05)' },
];

function getMedicineStatus(med: Medicine): string {
  if (med.frequency?.toLowerCase().includes('prn') || med.frequency?.toLowerCase().includes('as needed')) {
    return 'As Needed';
  }
  if (med.endDate && new Date(med.endDate) < new Date()) {
    return 'Past';
  }
  return 'Active';
}

function getStatusColors(status: string) {
  switch (status) {
    case 'Active':
      return { statusColor: '#2E7D32', statusBg: '#E8F5E9', statusBorder: '#C8E6C9' };
    case 'Past':
      return { statusColor: '#9E9E9E', statusBg: '#F5F5F5', statusBorder: '#E0E0E0' };
    default:
      return { statusColor: '#414755', statusBg: '#eae7ea', statusBorder: 'rgba(193, 198, 215, 0.3)' };
  }
}

function getScheduleIcon(status: string): string {
  return status === 'As Needed' ? 'air' : 'schedule';
}

function mapToCard(med: Medicine, index: number) {
  const status = getMedicineStatus(med);
  const colors = getStatusColors(status);
  const palette = ICON_PALETTE[index % ICON_PALETTE.length];
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    status,
    ...colors,
    ...palette,
    scheduleIcon: getScheduleIcon(status),
    scheduleText: med.frequency || 'Not scheduled',
  };
}

export default function MedicineLibrary() {
  const router = useRouter();
  const avatarSource = useGenderAvatar();
  const { data: medicines, isLoading, error } = useMedicines();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All Meds');

  const displayMedicines = useMemo(() => {
    if (!medicines) return [];
    let mapped = medicines.map((m, i) => mapToCard(m, i));
    if (activeFilter !== 'All Meds') {
      mapped = mapped.filter((m) => m.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (m) => m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q)
      );
    }
    return mapped;
  }, [medicines, activeFilter, searchQuery]);

  const renderMedicationCard = ({ item }: { item: ReturnType<typeof mapToCard> }) => (
    <View style={styles.card}>
      {/* Decorative rounded blob */}
      <View style={[styles.cardDecorativeBlob, { backgroundColor: item.overlayColor }]} />

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.cardIconContainer, { backgroundColor: item.iconBg }]}>
            <Text style={[styles.cardIcon, { color: item.iconColor }]}>{item.icon}</Text>
          </View>
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.dosage}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusBg, borderColor: item.statusBorder }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.cardFooterLeft}>
          <Text style={styles.scheduleIcon}>{item.scheduleIcon}</Text>
          <Text style={styles.scheduleText}>{item.scheduleText}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.moreButton, pressed && styles.pressedScale]} onPress={() => router.push(`/medicines/details?id=${item.id}`)} accessibilityLabel={`View details for ${item.name}`} accessibilityRole="button">
          <Text style={styles.moreIcon}>more_horiz</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

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
        <Pressable
          style={styles.notificationButton}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.notificationIcon}>notifications</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>

        {/* Search & Filter Area */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>search</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications..."
              placeholderTextColor="rgba(65, 71, 85, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search medicines"
            />
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item, index }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.filterChip,
                  item === activeFilter ? styles.filterChipActive : styles.filterChipInactive,
                  pressed && styles.pressedScale
                ]}
                onPress={() => setActiveFilter(item)}
                accessibilityLabel={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: item === activeFilter }}
              >
                <Text style={item === activeFilter ? styles.filterTextActive : styles.filterTextInactive}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>

        {/* Medication List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0058bc" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#414755', textAlign: 'center' }}>
              Failed to load medications. Pull down to retry.
            </Text>
          </View>
        ) : displayMedicines.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#414755', textAlign: 'center' }}>
              {searchQuery || activeFilter !== 'All Meds' ? 'No medications match your search.' : 'No medications yet. Tap + to add one.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayMedicines}
            keyExtractor={(item) => item.id}
            renderItem={renderMedicationCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push('/medicines/add')}
          accessibilityLabel="Add medicine"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>add</Text>
        </Pressable>

      </View>

      <UnifiedBottomNav active="medicines" />

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // background
  },
  mainContent: {
    flex: 1,
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
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#0058bc', // primary
  },
  notificationButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // --- Search & Filter ---
  searchSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: 'rgba(65, 71, 85, 0.6)',
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 12,
    paddingVertical: 12,
    backgroundColor: '#f6f3f5', // surface-container-low
    borderRadius: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#1b1b1d',
  },
  filterList: {
    gap: 12,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0058bc', // primary
  },
  filterChipInactive: {
    backgroundColor: '#eae7ea', // surface-container-high
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
  },
  filterTextActive: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#ffffff',
  },
  filterTextInactive: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },

  // --- Medication Card ---
  listContent: {
    gap: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDecorativeBlob: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    borderBottomLeftRadius: 96,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    zIndex: 2,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  cardSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(193, 198, 215, 0.2)',
    marginBottom: 12,
    zIndex: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#414755',
  },
  scheduleText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom nav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0058bc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 40,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
  },
  fabIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
  },
});