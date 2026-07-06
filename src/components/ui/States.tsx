import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography } from '../ui/Typography';
import { useTheme } from '../../hooks/useTheme';

export const LoadingState: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Typography style={styles.text} color={theme.colors['on-surface-variant']}>Loading...</Typography>
    </View>
  );
};

export const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Typography color={theme.colors['on-surface-variant']}>{message}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  text: { marginTop: 16 }
});
