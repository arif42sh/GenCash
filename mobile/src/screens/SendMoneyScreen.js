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

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const RECENT_CONTACTS = [
  { name: 'Sadia', phone: '01822222222', initials: 'SS', color: '#7C3AED', bg: '#EDE9FE' },
  { name: 'Rafiqul', phone: '01933333333', initials: 'RA', color: '#0D9488', bg: '#CCFBF1' },
  { name: 'Chillox', phone: '01788888888', initials: 'CH', color: '#4338CA', bg: '#E0E7FF' },
];

export const SendMoneyScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const { isBangla } = useLanguage();
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProceed = () => {
    if (!receiverPhone.trim()) {
      setErrorMessage(isBangla ? 'অনুগ্রহ করে প্রাপকের মোবাইল নম্বর লিখুন।' : 'Please enter the recipient mobile number.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(isBangla ? 'সঠিক টাকার পরিমাণ দিন।' : 'Please enter a valid transfer amount.');
      return;
    }
    const totalRequired = numAmount + 5.0; // ৳5 fee
    if (wallet && totalRequired > parseFloat(wallet.balance)) {
      setErrorMessage(
        isBangla
          ? `অপর্যাপ্ত ব্যালেন্স। প্রয়োজন: ৳${totalRequired.toFixed(2)}, আছে: ৳${wallet.balance}`
          : `Insufficient balance. Required: ৳${totalRequired.toFixed(2)}, Available: ৳${wallet.balance}`
      );
      return;
    }

    setErrorMessage('');
    setPin('');
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setLoading(true);
    try {
      const res = await api.sendMoney(receiverPhone.trim(), amount, note.trim(), pin || undefined);
      setShowConfirm(false);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert(isBangla ? 'লেনদেন ব্যর্থ হয়েছে' : 'Transfer Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isBangla ? 'সেন্ড মানি' : 'Send Money'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Balance Callout */}
        <View style={styles.balanceInfo}>
          <View>
            <Text style={styles.balanceLabel}>{isBangla ? 'সর্বমোট ব্যালেন্স' : 'Available Wallet Balance'}</Text>
            <Text style={styles.balanceValue}>৳ {Number(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.balanceIconWrap}>
            <Ionicons name="wallet-outline" size={20} color="#0F4D3C" />
          </View>
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
            label={isBangla ? 'প্রাপক মোবাইল নম্বর *' : 'Recipient Mobile Number *'}
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            placeholder="01XXXXXXXXX"
            icon="person-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          {/* Quick Contacts */}
          <Text style={styles.sectionSubtitle}>
            {isBangla ? 'রিসেন্ট / সেভ করা নম্বর' : 'Recent Contacts'}
          </Text>
          <View style={styles.contactsRow}>
            {RECENT_CONTACTS.map((contact, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.contactChip,
                  receiverPhone === contact.phone && styles.contactChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setReceiverPhone(contact.phone)}
              >
                <View style={[styles.chipAvatar, { backgroundColor: contact.bg }]}>
                  <Text style={[styles.chipInitials, { color: contact.color }]}>{contact.initials}</Text>
                </View>
                <Text
                  style={[
                    styles.contactChipText,
                    receiverPhone === contact.phone && styles.contactChipTextActive,
                  ]}
                >
                  {contact.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label={isBangla ? 'টাকার পরিমাণ (BDT) *' : 'Transfer Amount (BDT) *'}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="decimal-pad"
          />

          {/* Quick Amount Chips */}
          <View style={styles.quickAmountRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountChip,
                  amount === amt.toString() && styles.amountChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setAmount(amt.toString())}
              >
                <Text
                  style={[
                    styles.amountChipText,
                    amount === amt.toString() && styles.amountChipTextActive,
                  ]}
                >
                  +{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label={isBangla ? 'রেফারেন্স / নোট (ঐচ্ছিক)' : 'Reference Note (Optional)'}
            value={note}
            onChangeText={setNote}
            placeholder={isBangla ? 'কী উদ্দেশ্যে পাঠাচ্ছেন?' : 'What is this for?'}
            icon="chatbubble-outline"
            maxLength={50}
          />

          <View style={styles.feeNoteBox}>
            <Ionicons name="information-circle-outline" size={16} color="#0F4D3C" />
            <Text style={styles.feeNoteText}>
              {isBangla ? 'স্ট্যান্ডার্ড P2P চার্জ: মাত্র ৳৫.০০ প্রতি লেনদেনে।' : 'Standard P2P charge: ৳5.00 flat per transfer.'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedBtnText}>
              {isBangla ? 'পরবর্তী ধাপে যান' : 'Proceed to Confirm'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* bKash-style Hold to Confirm Sheet Modal */}
      <ConfirmationSheet
        visible={showConfirm}
        title={isBangla ? 'সেন্ড মানি নিশ্চিতকরণ' : 'Confirm Send Money'}
        recipientLabel={isBangla ? 'প্রাপক মোবাইল' : 'Recipient Phone'}
        recipientValue={receiverPhone}
        amount={amount || 0}
        fee={5.0}
        note={note}
        pin={pin}
        setPin={setPin}
        isLoading={loading}
        onConfirm={handleConfirmSend}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Success Modal with Confetti */}
      <SuccessModal
        visible={showSuccess}
        transaction={successTxn}
        onClose={handleSuccessClose}
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
  balanceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceValue: {
    color: '#0F4D3C',
    fontSize: 22,
    fontWeight: '800',
  },
  balanceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D6F4ED',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionSubtitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  contactChipActive: {
    borderColor: '#00D09C',
    backgroundColor: '#EDF7F4',
  },
  chipAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  chipInitials: {
    fontSize: 10,
    fontWeight: '800',
  },
  contactChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  contactChipTextActive: {
    color: '#0F4D3C',
    fontWeight: '800',
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  amountChip: {
    backgroundColor: '#F8FCFA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  amountChipActive: {
    borderColor: '#0F4D3C',
    backgroundColor: '#EDF7F4',
  },
  amountChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  amountChipTextActive: {
    color: '#0F4D3C',
    fontWeight: '800',
  },
  feeNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7F4',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  feeNoteText: {
    color: '#0F4D3C',
    fontSize: 11.5,
    marginLeft: 6,
    fontWeight: '600',
    flex: 1,
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
  proceedBtn: {
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
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
