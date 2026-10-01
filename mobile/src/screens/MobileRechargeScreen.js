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
import { MOBILE_OPERATORS } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SuccessModal } from '../components/SuccessModal';

const RECHARGE_PACKS = [
  { amount: 20, label: 'Emergency', sub: 'Talktime' },
  { amount: 50, label: 'Regular', sub: '50 Min' },
  { amount: 100, label: 'Smart Pack', sub: '2GB + 100 Min' },
  { amount: 200, label: 'Weekly Booster', sub: '5GB + 200 Min' },
  { amount: 498, label: 'Monthly Unlimited', sub: '25GB Combo' },
];

export const MobileRechargeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [selectedOperator, setSelectedOperator] = useState(MOBILE_OPERATORS[0]);
  const [rechargeType, setRechargeType] = useState('PREPAID');
  const [amount, setAmount] = useState('50');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRecharge = async () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 11-digit mobile number.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid recharge amount.');
      return;
    }
    if (wallet && numAmount > parseFloat(wallet.balance)) {
      setErrorMessage(`Insufficient balance. Required: ৳${numAmount}, Available: ৳${wallet.balance}`);
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const res = await api.mobileRecharge(
        mobileNumber.trim(),
        selectedOperator.name,
        numAmount,
        rechargeType
      );
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert('Recharge Failed', err.message);
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
        <Text style={styles.headerTitle}>Mobile Recharge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Promotional Cashback Banner */}
        <View style={styles.cashbackBanner}>
          <Ionicons name="gift" size={20} color="#F59E0B" />
          <Text style={styles.cashbackText}>
            🎉 10% Instant Cashback applied automatically to recharges above ৳100!
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Card */}
        <View style={styles.card}>
          <CustomInput
            label="Mobile Number *"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="01XXXXXXXXX"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          {/* Operator Selection Grid */}
          <Text style={styles.fieldLabel}>Select Telecom Operator</Text>
          <View style={styles.operatorGrid}>
            {MOBILE_OPERATORS.map((op) => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorCard,
                  selectedOperator.id === op.id && styles.operatorCardActive,
                ]}
                onPress={() => setSelectedOperator(op)}
              >
                <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
                <Text style={styles.operatorName}>{op.name}</Text>
                <Text style={styles.operatorCode}>{op.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connection Type Toggle */}
          <Text style={styles.fieldLabel}>Connection Type</Text>
          <View style={styles.toggleRow}>
            {['PREPAID', 'POSTPAID'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleBtn,
                  rechargeType === type && styles.toggleBtnActive,
                ]}
                onPress={() => setRechargeType(type)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    rechargeType === type && styles.toggleTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount input */}
          <CustomInput
            label="Recharge Amount (BDT) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          {/* Popular Packs */}
          <Text style={styles.fieldLabel}>Popular Airtime & Data Packs</Text>
          <View style={styles.packGrid}>
            {RECHARGE_PACKS.map((pack, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.packCard,
                  amount === pack.amount.toString() && styles.packCardActive,
                ]}
                onPress={() => setAmount(pack.amount.toString())}
              >
                <Text style={styles.packAmount}>৳{pack.amount}</Text>
                <Text style={styles.packLabel}>{pack.label}</Text>
                <Text style={styles.packSub}>{pack.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title={`Recharge ৳${amount || 0} Now`}
            onPress={handleRecharge}
            isLoading={loading}
            iconRight="flash"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

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
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  cashbackText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
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
    marginTop: 10,
    marginBottom: 8,
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  operatorCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  operatorCardActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(30, 111, 159, 0.08)',
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  operatorName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  operatorCode: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  packCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  packCardActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  packAmount: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  packLabel: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  packSub: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
});
