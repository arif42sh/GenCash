import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const SuccessModal = ({ visible, transaction, onClose }) => {
  if (!transaction) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `GenCash Transaction Receipt\nTxnID: ${transaction.transaction_code}\nType: ${transaction.transaction_type}\nAmount: ৳${transaction.amount}\nStatus: Completed`,
      });
    } catch (e) {}
  };

  const amountFormatted = Number(transaction.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Animated Success Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>

          <Text style={styles.successTitle}>Transaction Successful!</Text>
          <Text style={styles.amountText}>৳ {amountFormatted}</Text>

          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction Type</Text>
              <Text style={styles.receiptValue}>{transaction.transaction_type}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={[styles.receiptValue, styles.codeText]}>{transaction.transaction_code}</Text>
            </View>

            {transaction.recipient_phone && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Recipient / Mobile</Text>
                <Text style={styles.receiptValue}>{transaction.recipient_phone}</Text>
              </View>
            )}

            {transaction.fee !== undefined && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Charge / Fee</Text>
                <Text style={styles.receiptValue}>৳ {Number(transaction.fee).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptValue}>
                {new Date(transaction.transaction_time || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
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
  content: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    marginBottom: 12,
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  amountText: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  receiptLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  receiptValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  codeText: {
    color: colors.textHighlight,
    fontFamily: 'monospace',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  shareBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: 6,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
