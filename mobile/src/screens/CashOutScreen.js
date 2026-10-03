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
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { ConfirmationSheet } from '../components/ConfirmationSheet';
import { SuccessModal } from '../components/SuccessModal';

export const CashOutScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const { isBangla } = useLanguage();
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
      setErrorMessage(isBangla ? 'এজেন্ট নম্বর লিখুন।' : 'Please enter the agent number.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMessage(isBangla ? 'সঠিক ক্যাশ আউট পরিমাণ লিখুন।' : 'Please enter a valid cash out amount.');
      return;
    }
    if (wallet && total > parseFloat(wallet.balance)) {
      setErrorMessage(
        isBangla
          ? `অপর্যাপ্ত ব্যালেন্স। প্রয়োজন: ৳${total.toFixed(2)}, আছে: ৳${wallet.balance}`
          : `Insufficient balance. Required: ৳${total.toFixed(2)}, Available: ৳${wallet.balance}`
      );
      return;
    }

    setErrorMessage('');
    setPin('');
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
      Alert.alert(isBangla ? 'ক্যাশ আউট ব্যর্থ' : 'Cash Out Failed', err.message);
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
          <Ionicons name="arrow-back" size={20} color="#0F4D3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBangla ? 'ক্যাশ আউট (এজেন্ট)' : 'Cash Out (Agent)'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>{isBangla ? 'বর্তমান ব্যালেন্স' : 'Available Balance'}</Text>
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
            label={isBangla ? 'এজেন্ট মোবাইল নম্বর *' : 'Agent Mobile Number *'}
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
            <Ionicons name="location-outline" size={14} color="#0F4D3C" />
            <Text style={styles.demoAgentText}>
              {isBangla ? 'ডেমো এজেন্ট পয়েন্ট (01799999999)' : 'Use Demo Agent Point (01799999999)'}
            </Text>
          </TouchableOpacity>

          <CustomInput
            label={isBangla ? 'উত্তোলনের পরিমাণ (টাকা) *' : 'Cash Out Amount (BDT) *'}
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
              <Text style={styles.calcLabel}>{isBangla ? 'উত্তোলনের পরিমাণ' : 'Withdrawal Amount'}</Text>
              <Text style={styles.calcValue}>৳ {numAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>{isBangla ? 'এজেন্ট সার্ভিস চার্জ (১.৮৫%)' : 'Agent Service Fee (1.85%)'}</Text>
              <Text style={[styles.calcValue, { color: '#059669' }]}>
                +৳ {fee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.calcRow, styles.calcTotalRow]}>
              <Text style={styles.calcTotalLabel}>{isBangla ? 'সর্বমোট কর্তন' : 'Total Deduction'}</Text>
              <Text style={styles.calcTotalValue}>৳ {total.toFixed(2)}</Text>
            </View>
          </View>

          <CustomButton
            title={isBangla ? 'নিশ্চিত করতে এগিয়ে যান' : 'Proceed to Confirm'}
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title={isBangla ? 'ক্যাশ আউট নিশ্চিত করুন' : 'Confirm Cash Out'}
        recipientLabel={isBangla ? 'এজেন্ট নম্বর' : 'Agent Number'}
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
    backgroundColor: '#EDF7F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EDF7F4',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F4D3C',
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
    borderColor: '#DFEFE8',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#0F4D3C',
    fontSize: 18,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  demoAgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C6EFE1',
  },
  demoAgentText: {
    color: '#0F4D3C',
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
    borderColor: '#DFEFE8',
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
    borderTopColor: '#DFEFE8',
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
