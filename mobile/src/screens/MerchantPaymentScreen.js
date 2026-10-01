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

const CATEGORIES = ['All', 'Grocery', 'Food & Dining', 'Electronics', 'Fashion'];

const MERCHANTS_DIRECTORY = [
  {
    id: 1,
    name: 'Shwapno Superstore',
    phone: '01700100001',
    category: 'Grocery',
    icon: 'cart-outline',
    color: '#10B981',
    branches: '400+ Outlets nationwide',
  },
  {
    id: 2,
    name: 'Daily Shopping',
    phone: '01700100002',
    category: 'Grocery',
    icon: 'basket-outline',
    color: '#059669',
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
    setNote(`Shopping at ${m.name}`);
  };

  const handleProceed = () => {
    if (!merchantPhone.trim()) {
      setErrorMessage('Please enter merchant number or select a merchant store.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }
    if (wallet && numAmount > parseFloat(wallet.balance)) {
      setErrorMessage(`Insufficient balance. Required: ৳${numAmount.toFixed(2)}, Available: ৳${wallet.balance}`);
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
      Alert.alert('Payment Failed', err.message);
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
        <Text style={styles.headerTitle}>Merchant Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* QR Scan Action Bar */}
        <TouchableOpacity
          style={styles.qrScanBanner}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Scan QR', 'Point camera at merchant counter QR code.')}
        >
          <View style={styles.qrIconWrap}>
            <Ionicons name="qr-code-outline" size={24} color="#1B4D3E" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.qrBannerTitle}>Scan Merchant Counter QR</Text>
            <Text style={styles.qrBannerSub}>Auto-fills merchant name and Till ID instantly</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1B4D3E" />
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Merchant Directory Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Merchant Directory</Text>
          
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
                  <View style={[styles.merchantAvatar, { backgroundColor: m.color + '18' }]}>
                    <Ionicons name={m.icon} size={22} color={m.color} />
                  </View>
                  <View style={styles.merchantTextWrap}>
                    <Text style={styles.merchantName} numberOfLines={1}>{m.name}</Text>
                    <Text style={styles.merchantSub} numberOfLines={1}>{m.branches}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#00D09C" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <CustomInput
            label="Merchant Till / Mobile Number *"
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
            label="Payment Amount (BDT) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            prefix="৳ "
            icon="cash-outline"
            keyboardType="numeric"
          />

          <CustomInput
            label="Reference / Invoice Note"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Counter #04"
            icon="receipt-outline"
          />

          <CustomButton
            title={`Pay ৳${amount || 0} to Merchant`}
            onPress={handleProceed}
            iconRight="arrow-forward"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>

      <ConfirmationSheet
        visible={showConfirm}
        title="Confirm Merchant Payment"
        recipientLabel="Merchant Store"
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
  qrScanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
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
  },
  qrBannerTitle: {
    color: '#1B4D3E',
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
    borderColor: '#E2EFE9',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    color: '#0F2F24',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  catScroll: {
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    backgroundColor: '#F3F9F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  catChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
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
    borderColor: '#E2EFE9',
  },
  merchantCardActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
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
    backgroundColor: '#E2EFE9',
    marginVertical: 12,
  },
});
