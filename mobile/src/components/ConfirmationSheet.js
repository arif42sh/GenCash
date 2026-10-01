import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { CustomInput } from './CustomInput';

export const ConfirmationSheet = ({
  visible,
  title = "Confirm Transaction",
  recipientLabel = "Receiver",
  recipientValue,
  amount = 0,
  fee = 0,
  note,
  pin,
  setPin,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const total = Number(amount) + Number(fee);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>Total Deducted</Text>
            <Text style={styles.totalAmount}>৳ {total.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <Text style={styles.label}>{recipientLabel}</Text>
              <Text style={styles.value}>{recipientValue}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Transfer Amount</Text>
              <Text style={styles.value}>৳ {Number(amount).toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Service Charge / Fee</Text>
              <Text style={styles.value}>৳ {Number(fee).toFixed(2)}</Text>
            </View>

            {note ? (
              <View style={styles.row}>
                <Text style={styles.label}>Reference / Note</Text>
                <Text style={styles.value}>{note}</Text>
              </View>
            ) : null}
          </View>

          <CustomInput
            label="Enter Account PIN / Password"
            value={pin}
            onChangeText={setPin}
            placeholder="Enter your 6-digit PIN"
            icon="key-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={10}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.confirmText}>Confirm & Send</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
                </>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  amountBanner: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  totalAmount: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  breakdownCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
