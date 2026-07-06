import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Typography } from '../ui/Typography';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AppModal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay} accessibilityViewIsModal>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          {children}
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityLabel="Close modal" accessibilityRole="button">
            <Typography color={theme.colors.primary}>Close</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  content: { padding: 24, borderRadius: 24 },
  close: { marginTop: 16, alignItems: 'center' }
});
