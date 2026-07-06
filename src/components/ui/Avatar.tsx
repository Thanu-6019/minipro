import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  source: any;
  size?: number;
  accessibilityLabel?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ source, size = 48, accessibilityLabel }) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        borderColor: theme.colors.outline
      }
    ]}>
      <Image source={source} style={styles.image} accessibilityLabel={accessibilityLabel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
