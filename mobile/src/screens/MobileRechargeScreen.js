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

const PACKAGE_TABS = ['Internet', 'Minutes', 'Combo Offer', 'Special'];

const PACKAGES_DATA = {
  Internet: [
    { amount: 48, title: '1.5 GB Internet', validity: '3 Days', badge: 'Popular' },
    { amount: 108, title: '5 GB Internet', validity: '7 Days', badge: 'Best Value' },
    { amount: 249, title: '15 GB Internet', validity: '30 Days', badge: 'Monthly' },
    { amount: 399, title: '30 GB Internet', validity: '30 Days', badge: 'Heavy' },
    { amount: 499, title: '50 GB Internet', validity: '30 Days', badge: 'Super' },
  ],
  Minutes: [
    { amount: 34, title: '45 Minutes', validity: '2 Days', badge: 'Quick' },
    { amount: 97, title: '140 Minutes', validity: '7 Days', badge: 'Weekly' },
    { amount: 199, title: '320 Minutes', validity: '30 Days', badge: 'Monthly' },
    { amount: 349, title: '600 Minutes', validity: '30 Days', badge: 'Super Talk' },
    { amount: 599, title: '1100 Minutes', validity: '30 Days', badge: 'Unlimited' },
  ],
  'Combo Offer': [
    { amount: 148, title: '3 GB + 80 Min', validity: '7 Days', badge: 'Hot' },
    { amount: 299, title: '10 GB + 200 Min', validity: '30 Days', badge: 'Most Popular' },
    { amount: 498, title: '25 GB + 450 Min', validity: '30 Days', badge: 'Executive' },
    { amount: 699, title: '40 GB + 800 Min', validity: '30 Days', badge: 'VIP Pack' },
  ],
  Special: [
    { amount: 20, title: 'Emergency Talktime', validity: '1 Day', badge: 'Instant' },
    { amount: 50, title: 'Regular Flexiload', validity: 'Regular', badge: 'Standard' },
    { amount: 100, title: 'Full Talktime', validity: 'Regular', badge: 'Top Up' },
  ],
};

export const MobileRechargeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [selectedOperator, setSelectedOperator] = useState(MOBILE_OPERATORS[0]);
  const [rechargeType, setRechargeType] = useState('PREPAID');
  const [amount, setAmount] = useState('50');
  const [activePackTab, setActivePackTab] = useState('Combo Offer');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPackage = (pack) => {
    setAmount(pack.amount.toString());
  };

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
          <Ionicons name="gift" size={20} color="#00D09C" />
          <Text style={styles.cashbackText}>
            🎉 10% Instant Cashback applied automatically to recharge packs above ৳100!
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

          {/* Package Categories Tabs */}
          <Text style={styles.fieldLabel}>Packs & Bundle Offers ({selectedOperator.name})</Text>
          <View style={styles.packTabContainer}>
            {PACKAGE_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.packTab,
                  activePackTab === tab && styles.packTabActive,
                ]}
                onPress={() => setActivePackTab(tab)}
              >
                <Text
                  style={[
                    styles.packTabText,
                    activePackTab === tab && styles.packTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dynamic Packages List */}
          <View style={styles.packList}>
            {PACKAGES_DATA[activePackTab]?.map((pack, idx) => {
              const isSelected = amount === pack.amount.toString();
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.packCardItem, isSelected && styles.packCardItemActive]}
                  onPress={() => handleSelectPackage(pack)}
                  activeOpacity={0.75}
                >
                  <View style={styles.packInfo}>
                    <View style={styles.packTopRow}>
                      <Text style={styles.packTitle}>{pack.title}</Text>
                      {pack.badge && (
                        <View style={styles.packBadge}>
                          <Text style={styles.packBadgeText}>{pack.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.packValidity}>Validity: {pack.validity}</Text>
                  </View>
                  <View style={styles.packPriceContainer}>
                    <Text style={styles.packPrice}>৳{pack.amount}</Text>
                    <Text style={styles.packSelectLabel}>{isSelected ? 'Selected' : 'Tap to Pick'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomButton
            title={`Recharge ৳${amount || 0} Now`}
            onPress={handleRecharge}
            isLoading={loading}
            iconRight="flash"
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
    paddingBottom: 40,
  },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C6EFE1',
  },
  cashbackText: {
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
    backgroundColor: '#F8FCFA',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2EFE9',
  },
  operatorCardActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  operatorName: {
    color: '#0F2F24',
    fontSize: 11,
    fontWeight: '700',
  },
  operatorCode: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F9F6',
    borderRadius: 14,
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
    backgroundColor: '#1B4D3E',
  },
  toggleText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  packTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F9F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  packTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  packTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  packTabText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  packTabTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  packList: {
    gap: 8,
    marginBottom: 12,
  },
  packCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2EFE9',
  },
  packCardItemActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  packInfo: {
    flex: 1,
  },
  packTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packTitle: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '700',
  },
  packBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packBadgeText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  packValidity: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  packPriceContainer: {
    alignItems: 'flex-end',
  },
  packPrice: {
    color: '#1B4D3E',
    fontSize: 16,
    fontWeight: '900',
  },
  packSelectLabel: {
    color: '#00D09C',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
