import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';


interface GlassPanelProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  intensity = 30,
  style,
}) => {
  if (Platform.OS !== 'ios') {
    return (
      <View style={[styles.androidContainer, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} style={[styles.base, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(252, 248, 251, 0.95)', // Background color with high opacity for Android
    overflow: 'hidden',
  },
});
