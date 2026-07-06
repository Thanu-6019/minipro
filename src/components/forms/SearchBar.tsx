import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SearchBarProps {
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search..." }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors['surface-variant'] }]}>
      <TextInput 
        placeholder={placeholder} 
        placeholderTextColor={theme.colors['on-surface-variant']}
        style={[styles.input, { color: theme.colors['on-surface'] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  input: {
    fontSize: 16,
  }
});
