import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export type NavKey = 'home' | 'medicines' | 'calendar' | 'profile';

interface NavItemConfig {
    key: NavKey;
    label: string;
    icon: string;
    route: string;
    /** Pathname prefixes that should also light up this tab. */
    matches: string[];
}

// Single source of truth for the app's footer. Every screen that needs a
// bottom nav (tab screens and top-level stack screens alike) renders this
// component instead of hand-rolling its own copy, so the footer is always
// visually and behaviorally identical.
const NAV_ITEMS: NavItemConfig[] = [
    { key: 'home', label: 'Home', icon: 'home', route: '/(tabs)', matches: ['/(tabs)', '/(tabs)/index'] },
    { key: 'medicines', label: 'Meds', icon: 'medication', route: '/medicines', matches: ['/medicines', '/(tabs)/medicines'] },
    { key: 'calendar', label: 'Calendar', icon: 'calendar_month', route: '/(tabs)/calendar', matches: ['/(tabs)/calendar'] },
    { key: 'profile', label: 'Profile', icon: 'person', route: '/(tabs)/profile', matches: ['/(tabs)/profile', '/settings'] },
];

function isActive(pathname: string, item: NavItemConfig): boolean {
    return item.matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

interface UnifiedBottomNavProps {
    /**
     * Force a specific tab to appear active. Optional — when omitted, the
     * active tab is derived from the current route via usePathname(), which is
     * the right default for every screen except ones nested a couple of levels
     * deep (e.g. settings/notifications) where you may want to be explicit.
     */
    active?: NavKey;
}

export default function UnifiedBottomNav({ active }: UnifiedBottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.bottomNav}>
            {NAV_ITEMS.map((item) => {
                const selected = active ? active === item.key : isActive(pathname, item);
                return (
                    <Pressable
                        key={item.key}
                        style={[styles.navItem, selected && styles.navItemActive]}
                        onPress={() => {
                            if (!selected) router.push(item.route as any);
                        }}
                        accessibilityLabel={item.label}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <Text style={[styles.navIcon, selected && styles.navIconActive]}>{item.icon}</Text>
                        <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
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
        zIndex: 50,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        minWidth: 56,
    },
    navItemActive: {
        backgroundColor: 'rgba(0, 112, 235, 0.2)', // primary-container/20
        paddingHorizontal: 16,
    },
    navIcon: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        fontSize: 24,
        marginBottom: 2,
        color: '#414755', // on-surface-variant
    },
    navIconActive: {
        color: '#0058bc', // primary
    },
    navLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
        fontSize: 11,
        color: '#414755',
    },
    navLabelActive: {
        color: '#0058bc',
        fontWeight: '600',
    },
});