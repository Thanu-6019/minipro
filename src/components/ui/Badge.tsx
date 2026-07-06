import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui/Typography';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'pending' | 'skipped' | 'taken' | 'rescheduled';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label }) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'pending': return { bg: theme.colors['status-pending'], text: '#000' };
      case 'skipped': return { bg: theme.colors['status-skipped'], text: '#FFF' };
      case 'taken': return { bg: theme.colors['status-taken'], text: '#FFF' };
      case 'rescheduled': return { bg: theme.colors['status-rescheduled'], text: '#FFF' };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]} accessibilityRole="text" accessibilityLabel={label}>
      <Typography variant="label-sm" color={text}>{label.toUpperCase()}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  }
});
