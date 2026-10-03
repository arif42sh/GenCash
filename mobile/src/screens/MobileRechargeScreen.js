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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MOBILE_OPERATORS } from '../constants/config';
import { OPERATOR_LOGOS } from '../assets/operatorLogos';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { CustomInput } from '../components/CustomInput';
import { ConfirmationSheet } from '../components/ConfirmationSheet';
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
  const { isBangla } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [selectedOperator, setSelectedOperator] = useState(MOBILE_OPERATORS[0]);
  const [rechargeType, setRechargeType] = useState('PREPAID');
  const [amount, setAmount] = useState('50');
  const [pin, setPin] = useState('');
  const [activePackTab, setActivePackTab] = useState('Combo Offer');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPackage = (pack) => {
    setAmount(pack.amount.toString());
  };

  const handleProceed = () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setErrorMessage(isBangla ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(isBangla ? 'সঠিক রিচার্জ অংক দিন।' : 'Please enter a valid recharge amount.');
      return;
    }
    if (wallet && numAmount > parseFloat(wallet.balance)) {
      setErrorMessage(
        isBangla
          ? `অপর্যাপ্ত ব্যালেন্স। প্রয়োজন: ৳${numAmount}, আছে: ৳${wallet.balance}`
          : `Insufficient balance. Required: ৳${numAmount}, Available: ৳${wallet.balance}`
      );
      return;
    }

    setErrorMessage('');
    setPin('');
    setShowConfirm(true);
  };

  const handleConfirmRecharge = async () => {
    setLoading(true);
    try {
      const res = await api.mobileRecharge(
        mobileNumber.trim(),
        selectedOperator.name,
        parseFloat(amount),
        rechargeType
      );
      setShowConfirm(false);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert(isBangla ? 'রিচার্জ ব্যর্থ হয়েছে' : 'Recharge Failed', err.message);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBangla ? 'মোবাইল রিচার্জ' : 'Mobile Recharge'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Promotional Cashback Banner */}
        <View style={styles.cashbackBanner}>
          <Ionicons name="flame" size={20} color="#0F4D3C" />
          <Text style={styles.cashbackText}>
            {isBangla
              ? '🎉 ১০০ টাকার বেশি যেকোনো রিচার্জে ২০ টাকা নিশ্চিত ইনস্ট্যান্ট বোনাস!'
              : '🎉 10% Instant Cashback applied automatically to recharge packs above ৳100!'}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Card */}
        <View style={styles.card}>
          <CustomInput
            label={isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="01XXXXXXXXX"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          {/* Operator Selection Grid */}
          <Text style={styles.fieldLabel}>
            {isBangla ? 'টেলিকম অপারেটর নির্বাচন করুন' : 'Select Telecom Operator'}
          </Text>
          <View style={styles.operatorGrid}>
            {MOBILE_OPERATORS.map((op) => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorCard,
                  selectedOperator.id === op.id && styles.operatorCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedOperator(op)}
              >
                <View style={styles.operatorLogoContainer}>
                  {OPERATOR_LOGOS[op.id] ? (
                    <Image
                      source={OPERATOR_LOGOS[op.id]}
                      style={styles.operatorLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
                  )}
                </View>
                <Text style={styles.operatorName}>{op.name}</Text>
                <Text style={styles.operatorCode}>{op.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connection Type Toggle */}
          <Text style={styles.fieldLabel}>
            {isBangla ? 'সংযোগের ধরন' : 'Connection Type'}
          </Text>
          <View style={styles.toggleRow}>
            {['PREPAID', 'POSTPAID'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleBtn,
                  rechargeType === type && styles.toggleBtnActive,
                ]}
                activeOpacity={0.8}
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
            label={isBangla ? 'রিচার্জের পরিমাণ (BDT) *' : 'Recharge Amount (BDT) *'}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          {/* Package Categories Tabs */}
          <Text style={styles.fieldLabel}>
            {isBangla ? `প্যাক ও বান্ডেল অফার (${selectedOperator.name})` : `Packs & Bundle Offers (${selectedOperator.name})`}
          </Text>
          <View style={styles.packTabContainer}>
            {PACKAGE_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.packTab,
                  activePackTab === tab && styles.packTabActive,
                ]}
                activeOpacity={0.8}
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
                  activeOpacity={0.8}
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
                    <Text style={styles.packValidity}>{isBangla ? 'মেয়াদ: ' : 'Validity: '}{pack.validity}</Text>
                  </View>
                  <View style={styles.packPriceContainer}>
                    <Text style={styles.packPrice}>৳{pack.amount}</Text>
                    <Text style={styles.packSelectLabel}>
                      {isSelected ? (isBangla ? 'সিলেক্টেড' : 'Selected') : (isBangla ? 'পিক করুন' : 'Tap to Pick')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.rechargeBtnText}>
              {isBangla ? `রিচার্জ ৳${amount || 0} এগিয়ে যান` : `Recharge ৳${amount || 0} Now`}
            </Text>
            <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* bKash-style Hold to Confirm Sheet Modal */}
      <ConfirmationSheet
        visible={showConfirm}
        title={isBangla ? 'রিচার্জ নিশ্চিতকরণ' : 'Confirm Recharge'}
        recipientLabel={isBangla ? 'মোবাইল নম্বর' : 'Mobile Number'}
        recipientValue={`${mobileNumber} (${selectedOperator.name})`}
        amount={amount || 0}
        fee={0}
        note={rechargeType}
        pin={pin}
        setPin={setPin}
        isLoading={loading}
        onConfirm={handleConfirmRecharge}
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#EDF7F4',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F2',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  cashbackText: {
    color: '#0F4D3C',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 8,
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  operatorCard: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  operatorCardActive: {
    borderColor: '#0F4D3C',
    backgroundColor: '#EDF7F4',
  },
  operatorLogoContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  operatorLogo: {
    width: 26,
    height: 26,
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  operatorName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  operatorCode: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  toggleBtnActive: {
    backgroundColor: '#0F4D3C',
    borderColor: '#0F4D3C',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  packTabContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  packTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FCFA',
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  packTabActive: {
    backgroundColor: '#0F4D3C',
    borderColor: '#0F4D3C',
  },
  packTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  packTabTextActive: {
    color: '#FFFFFF',
  },
  packList: {
    gap: 8,
    marginBottom: 10,
  },
  packCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  packCardItemActive: {
    backgroundColor: '#EDF7F4',
    borderColor: '#00D09C',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  packBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  packValidity: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  packPriceContainer: {
    alignItems: 'flex-end',
  },
  packPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F4D3C',
  },
  packSelectLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  rechargeBtn: {
    width: '100%',
    backgroundColor: '#0F4D3C',
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rechargeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
