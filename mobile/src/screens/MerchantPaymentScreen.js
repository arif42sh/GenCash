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

const CATEGORIES = ['All', 'Grocery', 'Food & Dining', 'Electronics', 'Fashion'];

const MERCHANTS_DIRECTORY = [
  {
    id: 1,
    name: 'Shwapno Superstore',
    phone: '01700100001',
    category: 'Grocery',
    icon: 'cart-outline',
    color: '#059669',
    branches: '400+ Outlets nationwide',
  },
  {
    id: 2,
    name: 'Daily Shopping',
    phone: '01700100002',
    category: 'Grocery',
    icon: 'basket-outline',
    color: '#0D9488',
    branches: 'PRAN-RFL Group Outlet',
  },
  {
    id: 3,
    name: 'Chillox Burger Hub',
    phone: '01700100003',
    category: 'Food & Dining',
    icon: 'fast-food-outline',
    color: '#F59E0B',
    branches: 'Dhanmondi, Banani, Uttara',
  },
  {
    id: 4,
    name: 'Star Tech & Engineering',
    phone: '01700100004',
    category: 'Electronics',
    icon: 'laptop-outline',
    color: '#3B82F6',
    branches: 'Official Tech Mega Store',
  },
  {
    id: 5,
    name: 'Yellow Fashion Hub',
    phone: '01700100005',
    category: 'Fashion',
    icon: 'shirt-outline',
    color: '#EC4899',
    branches: 'BEXIMCO Lifestyle Store',
  },
  {
    id: 6,
    name: 'Ryans Computers',
    phone: '01700100006',
    category: 'Electronics',
    icon: 'hardware-chip-outline',
    color: '#6366F1',
    branches: 'IDB Bhaban, Multiplan Center',
  },
];

export const MerchantPaymentScreen = ({ navigation }) => {
  const { wallet, refreshWallet } = useAuth();
  const { isBangla } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [merchantPhone, setMerchantPhone] = useState('01700100001');
  const [selectedMerchant, setSelectedMerchant] = useState(MERCHANTS_DIRECTORY[0]);
  const [amount, setAmount] = useState('350');
  const [note, setNote] = useState('Shopping Bill');
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredMerchants = MERCHANTS_DIRECTORY.filter((m) => {
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  const handleSelectMerchant = (m) => {
    setSelectedMerchant(m);
    setMerchantPhone(m.phone);
    setNote(isBangla ? `${m.name}-এ কেনাকাটা` : `Shopping at ${m.name}`);
  };

  const handleProceed = () => {
    if (!merchantPhone.trim()) {
      setErrorMessage(isBangla ? 'মার্চেন্ট নম্বর বা শপ নির্বাচন করুন।' : 'Please enter merchant number or select a merchant store.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(isBangla ? 'সঠিক পেমেন্ট পরিমাণ লিখুন।' : 'Please enter a valid payment amount.');
      return;
    }
    if (wallet && numAmount > parseFloat(wallet.balance)) {
      setErrorMessage(
        isBangla
          ? `অপর্যাপ্ত ব্যালেন্স। প্রয়োজন: ৳${numAmount.toFixed(2)}, আছে: ৳${wallet.balance}`
          : `Insufficient balance. Required: ৳${numAmount.toFixed(2)}, Available: ৳${wallet.balance}`
      );
      return;
    }

    setErrorMessage('');
    setShowConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await api.merchantPayment(
        merchantPhone.trim(),
        amount,
        note.trim(),
        selectedMerchant?.id
      );
      setShowConfirm(false);
      setSuccessTxn(res);
      setShowSuccess(true);
      await refreshWallet();
    } catch (err) {
      Alert.alert(isBangla ? 'পেমেন্ট ব্যর্থ' : 'Payment Failed', err.message);
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
        <Text style={styles.headerTitle}>{isBangla ? 'মার্চেন্ট পেমেন্ট' : 'Merchant Payment'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* QR Scan Action Bar */}
        <TouchableOpacity
          style={styles.qrScanBanner}
          activeOpacity={0.8}
          onPress={() => Alert.alert(isBangla ? 'QR স্ক্যান' : 'Scan QR', isBangla ? 'কাউন্টার QR কোডের দিকে ক্যামেরা তাক করুন।' : 'Point camera at merchant counter QR code.')}
        >
          <View style={styles.qrIconWrap}>
            <Ionicons name="qr-code-outline" size={24} color="#0F4D3C" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.qrBannerTitle}>{isBangla ? 'মার্চেন্ট কাউন্টার QR স্ক্যান করুন' : 'Scan Merchant Counter QR'}</Text>
            <Text style={styles.qrBannerSub}>{isBangla ? 'স্বয়ংক্রিয়ভাবে মার্চেন্ট নম্বর ও তথ্য বসবে' : 'Auto-fills merchant name and Till ID instantly'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#0F4D3C" />
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Merchant Directory Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{isBangla ? 'জনপ্রিয় মার্চেন্ট আউটলেট' : 'Merchant Directory'}</Text>
          
          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  selectedCategory === cat && styles.catChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    selectedCategory === cat && styles.catChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Merchants List */}
          <View style={styles.merchantGrid}>
            {filteredMerchants.map((m) => {
              const isSelected = selectedMerchant?.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.merchantCard,
                    isSelected && styles.merchantCardActive,
                  ]}
                  onPress={() => handleSelectMerchant(m)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.merchantAvatar, { backgroundColor: `${m.color}18` }]}>
                    <Ionicons name={m.icon} size={20} color={m.color} />
                  </View>
                  <View style={styles.merchantTextWrap}>
                    <Text style={styles.merchantName}>{m.name}</Text>
                    <Text style={styles.merchantSub}>{m.branches}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#059669" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Payment Input Section */}
          <CustomInput
            label={isBangla ? 'মার্চেন্ট / কাউন্টার নম্বর *' : 'Merchant / Till Number *'}
            value={merchantPhone}
            onChangeText={(txt) => {
              setMerchantPhone(txt);
              setSelectedMerchant(null);
            }}
            placeholder="01XXXXXXXXX"
            icon="storefront-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <CustomInput
            label={isBangla ? 'বিল পরিশোধ পরিমাণ (টাকা) *' : 'Bill Payment Amount (BDT) *'}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          <CustomInput
            label={isBangla ? 'রেফারেন্স / নোট (ঐচ্ছিক)' : 'Reference / Note (Optional)'}
            value={note}
            onChangeText={setNote}
            placeholder={isBangla ? 'উদা: মার্চেন্ট কেনাকাটা' : 'e.g. Grocery payment'}
            icon="document-text-outline"
          />

          <CustomButton
            title={isBangla ? `৳${amount || 0} পরিশোধ করতে এগিয়ে যান` : `Proceed to Pay ৳${amount || 0}`}
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title={isBangla ? 'মার্চেন্ট পেমেন্ট নিশ্চিত করুন' : 'Confirm Merchant Payment'}
        recipientLabel={isBangla ? 'মার্চেন্ট আউটলেট' : 'Merchant Store'}
        recipientValue={selectedMerchant?.name || merchantPhone}
        amount={amount || 0}
        fee={0}
        note={note}
        pin={pin}
        setPin={setPin}
        isLoading={loading}
        onConfirm={handleConfirmPayment}
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
    paddingBottom: 40,
  },
  qrScanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F1',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C6EFE1',
  },
  qrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  qrBannerTitle: {
    color: '#0F4D3C',
    fontSize: 13,
    fontWeight: '800',
  },
  qrBannerSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
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
    borderColor: '#DFEFE8',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    color: '#0F4D3C',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  catScroll: {
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    backgroundColor: '#F8FCFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  catChipActive: {
    backgroundColor: '#0F4D3C',
    borderColor: '#0F4D3C',
  },
  catChipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  merchantGrid: {
    gap: 8,
    marginBottom: 12,
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFEFE8',
  },
  merchantCardActive: {
    borderColor: '#059669',
    backgroundColor: '#E8F6F1',
  },
  merchantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  merchantTextWrap: {
    flex: 1,
  },
  merchantName: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '700',
  },
  merchantSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#DFEFE8',
    marginVertical: 12,
  },
});
