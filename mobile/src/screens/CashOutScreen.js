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

export const CashOutScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const [agentPhone, setAgentPhone] = useState('01799999999');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const fee = Math.round(numAmount * 0.0185 * 100) / 100; // 1.85%
  const total = numAmount + fee;

  const handleProceed = () => {
    if (!agentPhone.trim()) {
      setErrorMessage('Please enter the agent number.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMessage('Please enter a valid cash out amount.');
      return;
    }
    if (wallet && total > parseFloat(wallet.balance)) {
      setErrorMessage(`Insufficient balance. Required: ৳${total.toFixed(2)}, Available: ৳${wallet.balance}`);
      return;
    }

    setErrorMessage('');
    setShowConfirm(true);
  };

  const handleConfirmCashOut = async () => {
    setLoading(true);
    try {
      const res = await api.cashOut(agentPhone.trim(), amount, pin || undefined);
      setShowConfirm(false);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert('Cash Out Failed', err.message);
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
        <Text style={styles.headerTitle}>Cash Out (Agent)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>৳ {Number(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <CustomInput
            label="Agent Mobile Number *"
            value={agentPhone}
            onChangeText={setAgentPhone}
            placeholder="01XXXXXXXXX"
            icon="business-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <TouchableOpacity
            style={styles.demoAgentPill}
            onPress={() => setAgentPhone('01799999999')}
          >
            <Ionicons name="location-outline" size={14} color={colors.textHighlight} />
            <Text style={styles.demoAgentText}>Use Demo Agent Point (01799999999)</Text>
          </TouchableOpacity>

          <CustomInput
            label="Cash Out Amount (BDT) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          {/* Dynamic Live Fee Calculation Preview */}
          <View style={styles.calcBox}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Withdrawal Amount</Text>
              <Text style={styles.calcValue}>৳ {numAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Agent Service Fee (1.85%)</Text>
              <Text style={[styles.calcValue, { color: colors.warning }]}>
                +৳ {fee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.calcRow, styles.calcTotalRow]}>
              <Text style={styles.calcTotalLabel}>Total Deduction</Text>
              <Text style={styles.calcTotalValue}>৳ {total.toFixed(2)}</Text>
            </View>
          </View>

          <CustomButton
            title="Proceed to Confirm"
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title="Confirm Cash Out"
        recipientLabel="Agent Number"
        recipientValue={agentPhone}
        amount={amount || 0}
        fee={fee}
        pin={pin}
        setPin={setPin}
        isLoading={loading}
        onConfirm={handleConfirmCashOut}
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
  balanceInfo: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  balanceValue: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  demoAgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  demoAgentText: {
    color: colors.textHighlight,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  calcBox: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  calcValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  calcTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: 6,
    paddingTop: 8,
  },
  calcTotalLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  calcTotalValue: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '800',
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
});
