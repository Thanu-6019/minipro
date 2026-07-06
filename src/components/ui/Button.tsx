import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '../../hooks/useTheme'; // Need to create this hook next

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', style, accessibilityLabel, ...props }) => {
  const { theme } = useTheme();
  
  const getStyles = () => ({
    backgroundColor: variant === 'primary' ? theme.colors.primary : 
                     variant === 'secondary' ? theme.colors.secondary : 'transparent',
    borderColor: variant === 'outline' ? theme.colors.outline : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
  });

  return (
    <TouchableOpacity style={[styles.base, getStyles(), style]} accessibilityLabel={accessibilityLabel ?? label} {...props}>
      <Typography 
        variant="title-lg" 
        color={variant === 'outline' ? theme.colors.primary : theme.colors['on-primary']}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  }
});
