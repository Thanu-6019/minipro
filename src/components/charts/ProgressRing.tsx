import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 64 }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.ring, { 
      width: size, height: size, borderRadius: size/2,
      borderColor: theme.colors['outline-variant'],
      borderWidth: size * 0.1
    }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      accessibilityLabel="Progress"
    >
      {/* Simple visual representation for prototype */}
      <View style={[styles.fill, { 
        borderColor: theme.colors.primary,
        borderWidth: size * 0.1,
        height: size, width: size,
        borderRadius: size/2
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  ring: { justifyContent: 'center', alignItems: 'center' },
  fill: { position: 'absolute' }
});
