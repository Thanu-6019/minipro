import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';

interface ActionButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  disabled,
  accessibilityLabel,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          loader: theme.colors['on-primary'],
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          loader: theme.colors['on-secondary'],
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          loader: theme.colors.primary,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          loader: theme.colors.primary,
        };
      case 'error':
        return {
          container: styles.errorContainer,
          text: styles.errorText,
          loader: theme.colors['on-error'],
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          loader: theme.colors['on-primary'],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md };
      case 'md':
        return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg };
      case 'lg':
        return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl };
    }
  };

  const { container, text, loader } = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.base,
        container,
        sizeStyle,
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={disabled || isLoading}
      accessibilityLabel={accessibilityLabel ?? label}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={loader} size="small" />
      ) : (
        <>
          {leftIcon}
          <Typography 
            variant="body-lg" 
            weight="semibold" 
            style={[
              text,
              ...(leftIcon ? [{ marginLeft: theme.spacing.xs }] : []),
              ...(rightIcon ? [{ marginRight: theme.spacing.xs }] : []),
            ] as unknown as TextStyle}
          >
            {label}
          </Typography>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors['on-primary'],
  },
  secondaryContainer: {
    backgroundColor: theme.colors.secondary,
  },
  secondaryText: {
    color: theme.colors['on-secondary'],
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary,
  },
  errorContainer: {
    backgroundColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors['on-error'],
  },
});
