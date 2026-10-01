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
            <Ionicons name="location-outline" size={14} color="#1B4D3E" />
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
              <Text style={[styles.calcValue, { color: '#F59E0B' }]}>
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
    backgroundColor: '#F3F9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EFE9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F2F24',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  balanceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  balanceLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  balanceValue: {
    color: '#1B4D3E',
    fontSize: 18,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  demoAgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  demoAgentText: {
    color: '#1B4D3E',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  calcBox: {
    backgroundColor: '#F8FCFA',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  calcValue: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '600',
  },
  calcTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2EFE9',
    marginTop: 6,
    paddingTop: 8,
  },
  calcTotalLabel: {
    color: '#0F2F24',
    fontSize: 14,
    fontWeight: '700',
  },
  calcTotalValue: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});
