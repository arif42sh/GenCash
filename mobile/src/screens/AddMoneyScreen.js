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
import { SuccessModal } from '../components/SuccessModal';

const BANK_SOURCES = [
  { id: 'BRAC', name: 'BRAC Bank', icon: 'business-outline', type: 'Internet Banking' },
  { id: 'CITY', name: 'City Bank Visa', icon: 'card-outline', type: 'Debit/Credit Card' },
  { id: 'IBBL', name: 'Islami Bank CellFin', icon: 'wallet-outline', type: 'App Direct' },
  { id: 'EBL', name: 'Eastern Bank Master', icon: 'card-outline', type: 'Mastercard' },
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export const AddMoneyScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const [selectedSource, setSelectedSource] = useState(BANK_SOURCES[0]);
  const [amount, setAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const res = await api.addMoney(numAmount, selectedSource.name);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert('Deposit Failed', err.message);
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
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.zeroFeeBanner}>
          <Ionicons name="sparkles" size={18} color="#00D09C" />
          <Text style={styles.zeroFeeText}>
            Zero Charge! Deposit funds into your GenCash wallet completely free.
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Select Linked Bank / Card</Text>
          <View style={styles.sourceList}>
            {BANK_SOURCES.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceCard,
                  selectedSource.id === source.id && styles.sourceCardActive,
                ]}
                onPress={() => setSelectedSource(source)}
                activeOpacity={0.7}
              >
                <View style={styles.sourceIconWrapper}>
                  <Ionicons name={source.icon} size={20} color="#1B4D3E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sourceName}>{source.name}</Text>
                  <Text style={styles.sourceType}>{source.type}</Text>
                </View>
                {selectedSource.id === source.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#00D09C" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label="Deposit Amount (BDT) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amtChip,
                  amount === amt.toString() && styles.amtChipActive,
                ]}
                onPress={() => setAmount(amt.toString())}
              >
                <Text
                  style={[
                    styles.amtChipText,
                    amount === amt.toString() && styles.amtChipTextActive,
                  ]}
                >
                  +{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title={`Add ৳${amount || 0} to Wallet`}
            onPress={handleAddMoney}
            isLoading={loading}
            iconRight="arrow-down-circle"
            style={{ marginTop: 16 }}
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
  zeroFeeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C6EFE1',
  },
  zeroFeeText: {
    color: '#1B4D3E',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
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
  fieldLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  sourceList: {
    gap: 8,
    marginBottom: 14,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2EFE9',
  },
  sourceCardActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  sourceIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sourceName: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '700',
  },
  sourceType: {
    color: '#64748B',
    fontSize: 11,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  amtChip: {
    backgroundColor: '#F8FCFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  amtChipActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  amtChipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  amtChipTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
});
