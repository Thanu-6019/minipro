import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../ui/Typography';

interface InputProps extends TextInputProps {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Typography variant="label-md" color={theme.colors['on-surface-variant']}>
        {label}
      </Typography>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            color: theme.colors['on-surface']
          },
          style
        ]}
        placeholderTextColor={theme.colors['on-surface-variant']}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 16 },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  }
});
