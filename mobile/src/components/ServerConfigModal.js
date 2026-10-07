import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { api } from '../services/api';

export const ServerConfigModal = ({ visible, onClose, onUpdated }) => {
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    if (visible) {
      api.getActiveBaseUrl().then((url) => setServerUrl(url || 'http://10.249.129.201:8000'));
    }
  }, [visible]);

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid server URL');
      return;
    }
    const updated = await api.setCustomBaseUrl(serverUrl.trim());
    Alert.alert('Success', `Backend server URL set to:\n${updated}`);
    if (onUpdated) onUpdated(updated);
    onClose();
  };

  const setPreset = (preset) => {
    setServerUrl(preset);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="server-outline" size={24} color={colors.primaryLight} />
            <Text style={styles.title}>Configure Server URL</Text>
          </View>
          <Text style={styles.subtitle}>
            Connect your phone to the FastAPI backend running on your PC or Tunnel.
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://10.249.129.201:8000"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.presetLabel}>Quick Presets:</Text>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://10.249.129.201:8000')}
            >
              <Text style={styles.presetText}>Local PC (10.249.129.201)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://10.0.2.2:8000')}
            >
              <Text style={styles.presetText}>Android Emulator (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://127.0.0.1:8000')}
            >
              <Text style={styles.presetText}>Localhost (Web)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  inputWrapper: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
    marginBottom: 12,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  presetLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  presetsRow: {
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetText: {
    color: colors.textHighlight,
    fontSize: 11,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
