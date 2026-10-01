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

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const RECENT_CONTACTS = [
  { name: 'Sadia Rahman', phone: '01822222222' },
  { name: 'Rafiqul Islam', phone: '01933333333' },
  { name: 'Demo Cash Agent', phone: '01799999999' },
];

export const SendMoneyScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
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
      setErrorMessage('Please enter the recipient mobile number.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount.');
      return;
    }
    const totalRequired = numAmount + 5.0; // ৳5 fee
    if (wallet && totalRequired > parseFloat(wallet.balance)) {
      setErrorMessage(`Insufficient balance. Required: ৳${totalRequired.toFixed(2)}, Available: ৳${wallet.balance}`);
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
      Alert.alert('Transfer Failed', err.message);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Balance Callout */}
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

        {/* Input Card */}
        <View style={styles.card}>
          <CustomInput
            label="Recipient Mobile Number *"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            placeholder="01XXXXXXXXX"
            icon="person-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          {/* Quick Contacts */}
          <Text style={styles.sectionSubtitle}>Recent / Saved Contacts</Text>
          <View style={styles.contactsRow}>
            {RECENT_CONTACTS.map((contact, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.contactChip,
                  receiverPhone === contact.phone && styles.contactChipActive,
                ]}
                onPress={() => setReceiverPhone(contact.phone)}
              >
                <Text
                  style={[
                    styles.contactChipText,
                    receiverPhone === contact.phone && styles.contactChipTextActive,
                  ]}
                >
                  {contact.name.split(' ')[0]} ({contact.phone.slice(-4)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label="Amount (BDT) *"
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
            label="Reference / Note (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="What is this for?"
            icon="chatbubble-outline"
            maxLength={50}
          />

          <View style={styles.feeNoteBox}>
            <Ionicons name="information-circle-outline" size={16} color="#00D09C" />
            <Text style={styles.feeNoteText}>
              Standard P2P service fee: ৳5.00 per transaction.
            </Text>
          </View>

          <CustomButton
            title="Proceed to Confirm"
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationSheet
        visible={showConfirm}
        title="Confirm Send Money"
        recipientLabel="Recipient Mobile"
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

      {/* Success Modal */}
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
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  contactChip: {
    backgroundColor: '#F8FCFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  contactChipActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  contactChipText: {
    color: '#64748B',
    fontSize: 11,
  },
  contactChipTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  amountChip: {
    backgroundColor: '#F8FCFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  amountChipActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  amountChipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  amountChipTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  feeNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  feeNoteText: {
    color: '#1B4D3E',
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '600',
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
