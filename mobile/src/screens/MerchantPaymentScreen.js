import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { ConfirmationSheet } from '../components/ConfirmationSheet';
import { SuccessModal } from '../components/SuccessModal';

const DEMO_MERCHANTS = [
  { id: 1, name: 'Shwapno Superstore', phone: '01700100001', category: 'Grocery' },
  { id: 3, name: 'Chillox Burger Hub', phone: '01700100003', category: 'Food' },
  { id: 4, name: 'Star Tech Ltd', phone: '01700100004', category: 'Tech' },
];

export const MerchantPaymentScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const [merchantPhone, setMerchantPhone] = useState('01700100001');
  const [selectedMerchant, setSelectedMerchant] = useState(DEMO_MERCHANTS[0]);
  const [amount, setAmount] = useState('350');
  const [note, setNote] = useState('Grocery items');
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectMerchant = (m) => {
    setSelectedMerchant(m);
    setMerchantPhone(m.phone);
    setNote(`Shopping at ${m.name}`);
  };

  const handleProceed = () => {
    if (!merchantPhone.trim()) {
      setErrorMessage('Please enter merchant number or select a merchant.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }
    if (wallet && numAmount > parseFloat(wallet.balance)) {
      setErrorMessage(`Insufficient balance. Required: ৳${numAmount.toFixed(2)}, Available: ৳${wallet.balance}`);
      return;
    }

    setErrorMessage('');
    setShowConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await api.merchantPayment(
        merchantPhone.trim(),
        amount,
        note.trim(),
        selectedMerchant?.id
      );
      setShowConfirm(false);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert('Payment Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* QR Scan Action Bar */}
        <TouchableOpacity
          style={styles.qrScanBanner}
          onPress={() => Alert.alert('QR Scanner', 'QR Scanner camera activated. Merchant QR decoded!')}
        >
          <Ionicons name="qr-code-outline" size={24} color="#EC4899" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.qrBannerTitle}>Scan Merchant QR Code</Text>
            <Text style={styles.qrBannerSub}>Tap here to auto-fill merchant details via camera</Text>
          </View>
          <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Featured Merchant Stores</Text>
          <View style={styles.merchantsRow}>
            {DEMO_MERCHANTS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.merchantChip,
                  selectedMerchant?.id === m.id && styles.merchantChipActive,
                ]}
                onPress={() => handleSelectMerchant(m)}
              >
                <Text
                  style={[
                    styles.merchantChipName,
                    selectedMerchant?.id === m.id && styles.merchantChipNameActive,
                  ]}
                >
                  {m.name}
                </Text>
                <Text style={styles.merchantChipCat}>{m.category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label="Merchant Mobile / Till Number *"
            value={merchantPhone}
            onChangeText={(txt) => {
              setMerchantPhone(txt);
              setSelectedMerchant(null);
            }}
            placeholder="01XXXXXXXXX"
            icon="storefront-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <CustomInput
            label="Payment Amount (BDT) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          <CustomInput
            label="Reference / Invoice Note"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Bill #4829"
            icon="receipt-outline"
          />

          <CustomButton
            title={`Pay ৳${amount || 0} to Merchant`}
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title="Confirm Payment"
        recipientLabel="Merchant Store"
        recipientValue={selectedMerchant?.name || merchantPhone}
        amount={amount || 0}
        fee={0}
        note={note}
        pin={pin}
        setPin={setPin}
        isLoading={loading}
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        visible={showSuccess}
        transaction={successTxn}
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  qrScanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  qrBannerTitle: {
    color: '#F472B6',
    fontSize: 13,
    fontWeight: '700',
  },
  qrBannerSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  merchantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  merchantChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  merchantChipActive: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
  },
  merchantChipName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  merchantChipNameActive: {
    color: '#F472B6',
    fontWeight: '800',
  },
  merchantChipCat: {
    color: colors.textMuted,
    fontSize: 9,
  },
});
