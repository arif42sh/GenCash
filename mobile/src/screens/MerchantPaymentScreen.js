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

const PAYMENT_MODES = [
  { id: 'merchant', labelBn: 'মার্চেন্ট পেমেন্ট', labelEn: 'Merchant Pay', icon: 'cart-outline' },
  { id: 'bill_pay', labelBn: 'ইউটিলিটি ও বিল পে', labelEn: 'Utility Bill Pay', icon: 'receipt-outline' },
];

const RETAIL_CATEGORIES = ['All', 'Grocery', 'Food & Dining', 'Electronics', 'Fashion'];
const BILL_CATEGORIES = ['All', 'Electricity', 'Water', 'Gas', 'Internet'];

const DIRECTORY_ITEMS = [
  // Merchant Outlets
  {
    id: 1,
    name: 'Shwapno Superstore',
    phone: '01700100001',
    category: 'Grocery',
    type: 'merchant',
    icon: 'cart-outline',
    color: '#059669',
    branches: '400+ Outlets nationwide',
  },
  {
    id: 2,
    name: 'Unimart Mega Store',
    phone: '01700100002',
    category: 'Grocery',
    type: 'merchant',
    icon: 'basket-outline',
    color: '#0D9488',
    branches: 'Gulshan 2, Dhanmondi, Dhaka',
  },
  {
    id: 3,
    name: 'Chillox Burger Hub',
    phone: '01700100003',
    category: 'Food & Dining',
    type: 'merchant',
    icon: 'fast-food-outline',
    color: '#F59E0B',
    branches: 'Dhanmondi, Banani, Uttara',
  },
  {
    id: 4,
    name: 'Star Tech Ltd',
    phone: '01700100004',
    category: 'Electronics',
    type: 'merchant',
    icon: 'laptop-outline',
    color: '#3B82F6',
    branches: 'Multiplan Center, IDB Bhaban',
  },
  {
    id: 5,
    name: 'Apex Footwear',
    phone: '01700100005',
    category: 'Fashion',
    type: 'merchant',
    icon: 'shirt-outline',
    color: '#EC4899',
    branches: 'Bashundhara City, Dhanmondi',
  },
  {
    id: 6,
    name: 'Labaid Diagnostic',
    phone: '01700100006',
    category: 'Healthcare & Pharmacy',
    type: 'merchant',
    icon: 'medkit-outline',
    color: '#10B981',
    branches: 'Dhanmondi, Gulshan, Uttara',
  },
  // Utility & Bill Pay Biller Organizations
  {
    id: 7,
    name: 'DESCO (Electricity Prepaid & Postpaid)',
    phone: '01700200001',
    category: 'Electricity',
    type: 'bill_pay',
    icon: 'bulb-outline',
    color: '#10B981',
    branches: 'Dhaka Electric Supply Co. Ltd',
  },
  {
    id: 8,
    name: 'DPDC (Dhaka Power Distribution)',
    phone: '01700200002',
    category: 'Electricity',
    type: 'bill_pay',
    icon: 'flash-outline',
    color: '#F59E0B',
    branches: 'Dhaka Power Distribution Co.',
  },
  {
    id: 9,
    name: 'Polli Bidyut (BREB)',
    phone: '01700200003',
    category: 'Electricity',
    type: 'bill_pay',
    icon: 'flash-outline',
    color: '#059669',
    branches: 'Bangladesh Rural Electrification Board',
  },
  {
    id: 10,
    name: 'Dhaka WASA (Water Supply)',
    phone: '01700200004',
    category: 'Water',
    type: 'bill_pay',
    icon: 'water-outline',
    color: '#0284C7',
    branches: 'Dhaka Water Supply & Sewerage Authority',
  },
  {
    id: 11,
    name: 'Titas Gas Transmission',
    phone: '01700200005',
    category: 'Gas',
    type: 'bill_pay',
    icon: 'flame-outline',
    color: '#EA580C',
    branches: 'Prepaid & Metered Gas Bill',
  },
  {
    id: 12,
    name: 'Carnival Internet Broadband',
    phone: '01700200006',
    category: 'Internet',
    type: 'bill_pay',
    icon: 'wifi-outline',
    color: '#8B5CF6',
    branches: 'High-speed Fiber Broadband Bill',
  },
];

export const MerchantPaymentScreen = ({ navigation, route }) => {
  const { wallet, refreshWallet } = useAuth();
  const { isBangla } = useLanguage();
  
  const initialMode = (route?.params?.mode === 'bill_pay' || route?.params?.mode === 'utility') ? 'bill_pay' : 'merchant';
  const [activeMode, setActiveMode] = useState(initialMode);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [directoryList, setDirectoryList] = useState(DIRECTORY_ITEMS);

  // Set default selected item based on mode or params
  const matchedItem = route?.params?.phone
    ? DIRECTORY_ITEMS.find((d) => d.phone === route.params.phone)
    : (route?.params?.merchant_name
        ? DIRECTORY_ITEMS.find((d) => d.name.toLowerCase().includes(route.params.merchant_name.toLowerCase()))
        : null);
  const defaultItem = matchedItem || DIRECTORY_ITEMS.find((d) => d.type === initialMode) || DIRECTORY_ITEMS[0];
  const [merchantPhone, setMerchantPhone] = useState(route?.params?.phone || defaultItem.phone);
  const [selectedMerchant, setSelectedMerchant] = useState(defaultItem);
  const [amount, setAmount] = useState(route?.params?.amount || '350');
  const [note, setNote] = useState(
    initialMode === 'bill_pay'
      ? 'Utility Bill Payment'
      : (defaultItem ? `${defaultItem.name}-এ কেনাকাটা` : 'Shopping Bill')
  );
  const [pin, setPin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxn, setSuccessTxn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDir = async () => {
      try {
        const liveItems = await api.getDirectory();
        if (Array.isArray(liveItems) && liveItems.length > 0 && isMounted) {
          const merged = liveItems.map((item) => {
            const fallback = DIRECTORY_ITEMS.find((d) => d.phone === item.phone);
            return {
              ...item,
              icon: fallback?.icon || (item.type === 'bill_pay' ? 'receipt-outline' : 'cart-outline'),
              color: fallback?.color || '#059669',
              branches: item.location || fallback?.branches || 'Official Partner',
            };
          });
          setDirectoryList(merged);
        }
      } catch (e) {}
    };
    fetchDir();
    return () => { isMounted = false; };
  }, []);

  const currentCategories = activeMode === 'bill_pay' ? BILL_CATEGORIES : RETAIL_CATEGORIES;

  const filteredMerchants = directoryList.filter((m) => {
    if (m.type !== activeMode) return false;
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setSelectedCategory('All');
    const firstOfMode = directoryList.find((d) => d.type === mode) || directoryList[0];
    setSelectedMerchant(firstOfMode);
    setMerchantPhone(firstOfMode.phone);
    setNote(mode === 'bill_pay' ? `${firstOfMode.name} বিল পরিশোধ` : `${firstOfMode.name}-এ কেনাকাটা`);
  };

  const handleSelectMerchant = (m) => {
    setSelectedMerchant(m);
    setMerchantPhone(m.phone);
    setNote(isBangla ? `${m.name}-এ পেমেন্ট` : `Payment for ${m.name}`);
  };

  const handleProceed = () => {
    if (!merchantPhone.trim()) {
      setErrorMessage(
        activeMode === 'bill_pay'
          ? (isBangla ? 'বিল অ্যাকাউন্ট বা প্রতিষ্ঠান নির্বাচন করুন।' : 'Please enter bill account or select biller.')
          : (isBangla ? 'মার্চেন্ট নম্বর বা শপ নির্বাচন করুন।' : 'Please enter merchant number or select a merchant store.')
      );
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
    setPin('');
    setShowConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await api.merchantPayment(
        merchantPhone.trim(),
        amount,
        note.trim(),
        selectedMerchant?.id,
        pin || undefined
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
        <Text style={styles.headerTitle}>
          {activeMode === 'bill_pay'
            ? (isBangla ? 'বিল পে ও ইউটিলিটি' : 'Utility Bill Pay')
            : (isBangla ? 'পেমেন্ট' : 'Make Payment')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Mode Switch Tabs */}
        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            style={[styles.modeSwitchBtn, activeMode === 'merchant' && styles.modeSwitchBtnActive]}
            onPress={() => handleSwitchMode('merchant')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cart-outline"
              size={16}
              color={activeMode === 'merchant' ? '#FFFFFF' : '#0F4D3C'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeSwitchText, activeMode === 'merchant' && styles.modeSwitchTextActive]}>
              {isBangla ? 'মার্চেন্ট পেমেন্ট' : 'Merchant Pay'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeSwitchBtn, activeMode === 'bill_pay' && styles.modeSwitchBtnActive]}
            onPress={() => handleSwitchMode('bill_pay')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="receipt-outline"
              size={16}
              color={activeMode === 'bill_pay' ? '#FFFFFF' : '#0F4D3C'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeSwitchText, activeMode === 'bill_pay' && styles.modeSwitchTextActive]}>
              {isBangla ? 'ইউটিলিটি ও বিল পে' : 'Utility Bill Pay'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Scan Action Bar */}
        <TouchableOpacity
          style={styles.qrScanBanner}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              isBangla ? 'QR ও বারকোড স্ক্যান' : 'Scan QR & Barcode',
              activeMode === 'bill_pay'
                ? (isBangla ? 'বিল স্লিপ বা মিটার কাগজের বারকোডে ক্যামেরা তাক করুন।' : 'Point camera at utility bill voucher barcode.')
                : (isBangla ? 'কাউন্টার QR কোডের দিকে ক্যামেরা তাক করুন।' : 'Point camera at merchant counter QR code.')
            )
          }
        >
          <View style={styles.qrIconWrap}>
            <Ionicons
              name={activeMode === 'bill_pay' ? 'barcode-outline' : 'qr-code-outline'}
              size={24}
              color="#0F4D3C"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.qrBannerTitle}>
              {activeMode === 'bill_pay'
                ? (isBangla ? 'বিল স্লিপ বা মিটার বারকোড স্ক্যান করুন' : 'Scan Utility Bill Barcode')
                : (isBangla ? 'মার্চেন্ট কাউন্টার QR স্ক্যান করুন' : 'Scan Merchant Counter QR')}
            </Text>
            <Text style={styles.qrBannerSub}>
              {activeMode === 'bill_pay'
                ? (isBangla ? 'স্বয়ংক্রিয়ভাবে বিল রেফারেন্স ও ফি বসবে' : 'Auto-fills account and bill amount')
                : (isBangla ? 'স্বয়ংক্রিয়ভাবে মার্চেন্ট নম্বর ও তথ্য বসবে' : 'Auto-fills merchant name and Till ID')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#0F4D3C" />
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Directory Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {activeMode === 'bill_pay'
              ? (isBangla ? 'জনপ্রিয় ইউটিলিটি ও বিলার প্রতিষ্ঠান' : 'Utility & Biller Organizations')
              : (isBangla ? 'জনপ্রিয় মার্চেন্ট আউটলেট' : 'Merchant Outlets')}
          </Text>
          
          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {currentCategories.map((cat) => (
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

          {/* Directory List */}
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
            label={
              activeMode === 'bill_pay'
                ? (isBangla ? 'বিল অ্যাকাউন্ট / মিটার নম্বর *' : 'Bill Account / Meter No. *')
                : (isBangla ? 'মার্চেন্ট / কাউন্টার নম্বর *' : 'Merchant / Till Number *')
            }
            value={merchantPhone}
            onChangeText={(txt) => {
              setMerchantPhone(txt);
              setSelectedMerchant(null);
            }}
            placeholder="01XXXXXXXXX"
            icon={activeMode === 'bill_pay' ? 'receipt-outline' : 'storefront-outline'}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <CustomInput
            label={
              activeMode === 'bill_pay'
                ? (isBangla ? 'বিল পরিশোধ পরিমাণ (টাকা) *' : 'Bill Amount (BDT) *')
                : (isBangla ? 'পেমেন্ট পরিমাণ (টাকা) *' : 'Payment Amount (BDT) *')
            }
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
            placeholder={activeMode === 'bill_pay' ? 'e.g. October Electricity Bill' : 'e.g. Grocery payment'}
            icon="document-text-outline"
          />

          <CustomButton
            title={
              activeMode === 'bill_pay'
                ? (isBangla ? `৳${amount || 0} বিল পরিশোধ করুন` : `Pay Bill ৳${amount || 0}`)
                : (isBangla ? `৳${amount || 0} পরিশোধ করতে এগিয়ে যান` : `Proceed to Pay ৳${amount || 0}`)
            }
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title={
          activeMode === 'bill_pay'
            ? (isBangla ? 'বিল পরিশোধ নিশ্চিত করুন' : 'Confirm Bill Payment')
            : (isBangla ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment')
        }
        recipientLabel={
          activeMode === 'bill_pay'
            ? (isBangla ? 'বিলার প্রতিষ্ঠান' : 'Biller Organization')
            : (isBangla ? 'মার্চেন্ট আউটলেট' : 'Merchant Store')
        }
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
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2EFE9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  modeSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  modeSwitchBtnActive: {
    backgroundColor: '#0F4D3C',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modeSwitchText: {
    color: '#0F4D3C',
    fontSize: 12.5,
    fontWeight: '700',
  },
  modeSwitchTextActive: {
    color: '#FFFFFF',
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
