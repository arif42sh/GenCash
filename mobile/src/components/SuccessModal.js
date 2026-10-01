import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const SuccessModal = ({ visible, transaction, onClose }) => {
  if (!transaction) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'GenCash Transaction Receipt',
        message: `═════════════════════════\n       GENCASH RECEIPT   \n═════════════════════════\nStatus: SUCCESSFUL\nType: ${transaction.transaction_type || 'Payment'}\nAmount: ৳${Number(transaction.amount || 0).toFixed(2)}\nTxnID: ${transaction.transaction_code || 'N/A'}\nRecipient: ${transaction.recipient_phone || 'N/A'}\nFee: ৳${Number(transaction.fee || 0).toFixed(2)}\nDate: ${new Date(transaction.transaction_time || Date.now()).toLocaleString()}\n═════════════════════════\nThank you for using GenCash!`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleSaveReceipt = () => {
    Alert.alert('Receipt Saved', 'Digital receipt has been saved to your receipts folder.');
  };

  const amountFormatted = Number(transaction.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Success Checkmark with subtle glow */}
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.successTitle}>Transaction Successful</Text>
          <Text style={styles.successSub}>Your payment has been processed instantly</Text>

          <Text style={styles.amountText}>৳ {amountFormatted}</Text>

          {/* Digital Receipt Card */}
          <View style={styles.receiptBox}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptHeaderTitle}>GenCash E-Receipt</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#00D09C" />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>

            <View style={styles.dashedLine} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction Type</Text>
              <Text style={styles.receiptValue}>{transaction.transaction_type || 'Payment'}</Text>
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

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#1B4D3E" />
              <Text style={styles.secondaryBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSaveReceipt}>
              <Ionicons name="download-outline" size={18} color="#1B4D3E" />
              <Text style={styles.secondaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    color: '#0F2F24',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  successSub: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  amountText: {
    color: '#1B4D3E',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 18,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FCFA',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptHeaderTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    color: '#00D09C',
    fontSize: 9,
    fontWeight: '800',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    marginVertical: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  receiptLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  receiptValue: {
    color: '#0F2F24',
    fontSize: 12,
    fontWeight: '600',
  },
  codeText: {
    color: '#1B4D3E',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F9F6',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    gap: 6,
  },
  secondaryBtnText: {
    color: '#1B4D3E',
    fontWeight: '700',
    fontSize: 13,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#1B4D3E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
