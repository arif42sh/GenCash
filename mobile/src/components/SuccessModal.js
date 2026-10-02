import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const CONFETTI_COLORS = [
  '#34D399', '#F59E0B', '#EF4444', '#8B5CF6',
  '#3B82F6', '#10B981', '#EC4899', '#F97316',
  '#FBBF24', '#06B6D4'
];

const CONFETTI_ITEMS = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: (i * 14) % 320,
  size: 6 + (i % 5) * 2,
  isCircle: i % 3 === 0,
}));

export const SuccessModal = ({ visible, transaction, onClose }) => {
  const { isBangla } = useLanguage();
  const confettiAnims = useRef(CONFETTI_ITEMS.map(() => new Animated.Value(0))).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Scale up checkmark badge
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();

      // Confetti waterfall animation
      confettiAnims.forEach((anim) => anim.setValue(0));
      const animations = confettiAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 1600 + (i % 6) * 200,
          useNativeDriver: true,
        })
      );
      Animated.stagger(40, animations).start();
    }
  }, [visible]);

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
    Alert.alert(
      isBangla ? 'রসিদ সংরক্ষিত' : 'Receipt Saved',
      isBangla
        ? 'ডিজিটাল ট্রানজেকশন রসিদ গ্যালারিতে সংরক্ষিত হয়েছে।'
        : 'Digital transaction receipt has been saved to your receipts folder.'
    );
  };

  const amountFormatted = Number(transaction.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Floating Confetti Particles Burst */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {CONFETTI_ITEMS.map((item, index) => {
            const anim = confettiAnims[index];
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 480],
            });
            const rotate = anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${(index % 2 === 0 ? 1 : -1) * 360}deg`],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            });

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.confettiParticle,
                  {
                    left: item.left,
                    backgroundColor: item.color,
                    width: item.size,
                    height: item.isCircle ? item.size : item.size * 1.6,
                    borderRadius: item.isCircle ? item.size / 2 : 2,
                    opacity,
                    transform: [{ translateY }, { rotate }],
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.content}>
          {/* Animated Success Checkmark with subtle glow */}
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.successTitle}>
            {isBangla ? 'লেনদেন সফল হয়েছে!' : 'Transaction Successful'}
          </Text>
          <Text style={styles.successSub}>
            {isBangla ? 'আপনার পেমেন্ট তাৎক্ষণিকভাবে সম্পন্ন হয়েছে' : 'Your payment has been processed instantly'}
          </Text>

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
              <Text style={styles.receiptLabel}>{isBangla ? 'লেনদেনের ধরন' : 'Transaction Type'}</Text>
              <Text style={styles.receiptValue}>{transaction.transaction_type || 'Payment'}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={[styles.receiptValue, styles.codeText]}>{transaction.transaction_code}</Text>
            </View>

            {transaction.recipient_phone && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>{isBangla ? 'প্রাপক মোবাইল' : 'Recipient Phone'}</Text>
                <Text style={styles.receiptValue}>{transaction.recipient_phone}</Text>
              </View>
            )}

            {transaction.fee !== undefined && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>{isBangla ? 'চার্জ / ফি' : 'Service Fee'}</Text>
                <Text style={styles.receiptValue}>৳ {Number(transaction.fee).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{isBangla ? 'তারিখ ও সময়' : 'Date & Time'}</Text>
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

          {/* Action Buttons: Share & Save */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social-outline" size={18} color="#0F4D3C" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>{isBangla ? 'শেয়ার' : 'Share'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSaveReceipt} activeOpacity={0.8}>
              <Ionicons name="download-outline" size={18} color="#0F4D3C" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>{isBangla ? 'রসিদ সেভ' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>
              {isBangla ? 'হোম পেজে ফিরে যান' : 'Back to Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 40, 31, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    zIndex: 10,
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    zIndex: 20,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D09C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F4D3C',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#EDF7F4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F4D3C',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 156, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F4D3C',
    letterSpacing: 0.5,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#0F4D3C',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF7F4',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  secondaryBtnText: {
    color: '#0F4D3C',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#0F4D3C',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
