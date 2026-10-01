import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SuccessModal } from '../components/SuccessModal';

const DEFAULT_SOURCES = [
  { id: '1', name: 'BRAC Bank •• 4912', icon: 'business-outline', type: 'Bank Account', category: 'BANK' },
  { id: '2', name: 'City Bank Visa •• 8821', icon: 'card-outline', type: 'Visa Platinum', category: 'CARD' },
  { id: '3', name: 'Islami Bank CellFin', icon: 'wallet-outline', type: 'App Direct', category: 'BANK' },
  { id: '4', name: 'Eastern Bank Master •• 3340', icon: 'card-outline', type: 'Mastercard World', category: 'CARD' },
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export const AddMoneyScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const { t, isBangla } = useLanguage();

  const [savedSources, setSavedSources] = useState(DEFAULT_SOURCES);
  const [selectedSource, setSelectedSource] = useState(DEFAULT_SOURCES[0]);
  const [amount, setAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Add Card/Bank Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [sourceType, setSourceType] = useState('CARD'); // 'CARD' | 'BANK'
  const [cardOrBankName, setCardOrBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    loadSavedSources();
  }, []);

  const loadSavedSources = async () => {
    try {
      const stored = await storage.getItem('@gencash_saved_sources');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedSources(parsed);
          setSelectedSource(parsed[0]);
        }
      }
    } catch (e) {}
  };

  const saveSourcesToStorage = async (newList) => {
    setSavedSources(newList);
    try {
      await storage.setItem('@gencash_saved_sources', JSON.stringify(newList));
    } catch (e) {}
  };

  const handleAddNewSource = async () => {
    if (!cardOrBankName.trim() || !accountNumber.trim()) {
      Alert.alert('Error', isBangla ? 'অনুগ্রহ করে নাম এবং নম্বর লিখুন।' : 'Please enter bank/card name and number.');
      return;
    }

    const lastFour = accountNumber.trim().slice(-4) || '1234';
    const newEntry = {
      id: Date.now().toString(),
      name: `${cardOrBankName.trim()} •• ${lastFour}`,
      type: sourceType === 'CARD' ? 'Visa/Mastercard' : 'Bank Account',
      icon: sourceType === 'CARD' ? 'card-outline' : 'business-outline',
      category: sourceType,
    };

    const updated = [newEntry, ...savedSources];
    await saveSourcesToStorage(updated);
    setSelectedSource(newEntry);

    // Reset fields & close modal
    setShowAddModal(false);
    setCardOrBankName('');
    setAccountNumber('');
    setHolderName('');
    setExpiryDate('');
    Alert.alert('Success', isBangla ? 'নতুন কার্ড/অ্যাকাউন্ট সফলভাবে সেভ করা হয়েছে।' : 'New card/bank account saved successfully.');
  };

  const handleDeleteSource = (sourceItem) => {
    Alert.alert(
      isBangla ? 'কার্ড/অ্যাকাউন্ট মুছবেন?' : 'Delete Saved Source?',
      isBangla
        ? `আপনি কি নিশ্চিতভাবে "${sourceItem.name}" ডিলিট করতে চান?`
        : `Are you sure you want to remove "${sourceItem.name}"?`,
      [
        { text: isBangla ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: isBangla ? 'ডিলিট' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = savedSources.filter((s) => s.id !== sourceItem.id);
            await saveSourcesToStorage(updated);
            if (selectedSource?.id === sourceItem.id && updated.length > 0) {
              setSelectedSource(updated[0]);
            }
          },
        },
      ]
    );
  };

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(isBangla ? 'সঠিক টাকার অংক লিখুন।' : 'Please enter a valid amount.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const res = await api.addMoney(numAmount, selectedSource?.name || 'Linked Bank');
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
        <Text style={styles.headerTitle}>{isBangla ? 'টাকা যোগ (Add Money)' : 'Add Money'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Zero Fee Promotion Banner */}
        <View style={styles.zeroFeeBanner}>
          <Ionicons name="sparkles" size={18} color="#00D09C" />
          <Text style={styles.zeroFeeText}>
            {isBangla
              ? 'জিরো ফি! ব্যাংক অ্যাকাউন্ট বা কার্ড থেকে সম্পূর্ণ ফ্রিতে ওয়ালেটে টাকা যোগ করুন।'
              : 'Zero Charge! Deposit funds into your GenCash wallet completely free.'}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {/* Section Header with Add New Card Button */}
          <View style={styles.sourceSectionHeader}>
            <Text style={styles.fieldLabel}>
              {isBangla ? 'সংযুক্ত কার্ড ও ব্যাংক অ্যাকাউন্টসমূহ' : 'Saved Cards & Bank Accounts'}
            </Text>
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color="#00D09C" />
              <Text style={styles.addNewBtnText}>{isBangla ? 'নতুন যোগ' : '+ Add New'}</Text>
            </TouchableOpacity>
          </View>

          {/* Saved Sources List */}
          <View style={styles.sourceList}>
            {savedSources.map((source) => {
              const isSelected = selectedSource?.id === source.id;
              return (
                <View
                  key={source.id}
                  style={[
                    styles.sourceCard,
                    isSelected && styles.sourceCardActive,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.sourceTouchArea}
                    onPress={() => setSelectedSource(source)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.sourceIconWrapper, isSelected && styles.sourceIconWrapperActive]}>
                      <Ionicons
                        name={source.icon || 'card-outline'}
                        size={20}
                        color={isSelected ? '#00D09C' : '#1B4D3E'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sourceName}>{source.name}</Text>
                      <Text style={styles.sourceType}>{source.type}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#00D09C" style={{ marginRight: 6 }} />
                    )}
                  </TouchableOpacity>

                  {/* Delete Card Button */}
                  <TouchableOpacity
                    style={styles.deleteSourceBtn}
                    onPress={() => handleDeleteSource(source)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <CustomInput
            label={isBangla ? 'জমার পরিমাণ (টাকা) *' : 'Deposit Amount (BDT) *'}
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
            title={isBangla ? `৳${amount || 0} ওয়ালেটে যোগ করুন` : `Add ৳${amount || 0} to Wallet`}
            onPress={handleAddMoney}
            isLoading={loading}
            iconRight="arrow-down-circle"
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>

      {/* Add New Card / Bank Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'নতুন কার্ড বা ব্যাংক যোগ করুন' : 'Add New Card or Bank'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Type Switcher: CARD vs BANK */}
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  sourceType === 'CARD' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setSourceType('CARD')}
              >
                <Ionicons
                  name="card"
                  size={16}
                  color={sourceType === 'CARD' ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeToggleText,
                    sourceType === 'CARD' && styles.typeToggleTextActive,
                  ]}
                >
                  {isBangla ? 'ভিসা / মাস্টারকার্ড' : 'Debit / Credit Card'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  sourceType === 'BANK' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setSourceType('BANK')}
              >
                <Ionicons
                  name="business"
                  size={16}
                  color={sourceType === 'BANK' ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeToggleText,
                    sourceType === 'BANK' && styles.typeToggleTextActive,
                  ]}
                >
                  {isBangla ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <Text style={styles.modalFieldLabel}>
              {sourceType === 'CARD'
                ? isBangla ? 'কার্ডের নাম বা ব্যাংক *' : 'Card Provider / Bank Name *'
                : isBangla ? 'ব্যাংকের নাম *' : 'Bank Name *'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={sourceType === 'CARD' ? 'e.g. City Bank Visa' : 'e.g. Dutch-Bangla Bank'}
              value={cardOrBankName}
              onChangeText={setCardOrBankName}
            />

            <Text style={styles.modalFieldLabel}>
              {sourceType === 'CARD'
                ? isBangla ? 'কার্ড নম্বর (১৬ ডিজিট) *' : 'Card Number (16 Digits) *'
                : isBangla ? 'অ্যাকাউন্ট নম্বর *' : 'Account Number *'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={sourceType === 'CARD' ? '4111 2222 3333 4444' : '205.120.98421'}
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            {sourceType === 'CARD' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalFieldLabel}>{isBangla ? 'মেয়াদ (MM/YY)' : 'Expiry (MM/YY)'}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="12/28"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalFieldLabel}>{isBangla ? 'নাম' : 'Holder Name'}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Tanvir Ahmed"
                    value={holderName}
                    onChangeText={setHolderName}
                  />
                </View>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>{t('cancel', 'Cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleAddNewSource}
              >
                <Text style={styles.modalSaveBtnText}>{isBangla ? 'সেভ করুন' : 'Save Source'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  sourceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addNewBtnText: {
    color: '#00D09C',
    fontSize: 12,
    fontWeight: '700',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2EFE9',
  },
  sourceCardActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  sourceTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  sourceIconWrapperActive: {
    backgroundColor: '#1B4D3E',
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
  deleteSourceBtn: {
    padding: 6,
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

  // Add Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '800',
  },
  typeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F9F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  typeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  typeToggleBtnActive: {
    backgroundColor: '#1B4D3E',
  },
  typeToggleText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  typeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalFieldLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: '#F8FCFA',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F2F24',
    marginBottom: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F9F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#1B4D3E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
