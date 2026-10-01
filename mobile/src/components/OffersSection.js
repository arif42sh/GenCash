import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const SPECIAL_OFFERS = [
  {
    id: 'off_1',
    title: 'Shwapno Super Grocery',
    subtitle: 'Min spend ৳1,000',
    discount: '-20%',
    badge: 'CASHBACK',
    code: 'SHWAPNO20',
    validity: 'Valid till 31 Oct',
    description: 'Get flat 20% instant cashback on fresh groceries, household items, and pantry staples when paying with GenCash QR.',
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    merchant: 'Shwapno Superstore',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_2',
    title: 'Chillox Gourmet Burger',
    subtitle: 'Any Burger + Fries',
    discount: '-35%',
    badge: 'HOT DEAL',
    code: 'CHILLOX35',
    validity: 'Valid till 25 Oct',
    description: 'Enjoy 35% discount on all burger meals across all branches in Dhaka, Chittagong & Sylhet with GenCash Pay.',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    merchant: 'Chillox Burger Hub',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_3',
    title: 'GP 30GB + 500 Min Bundle',
    subtitle: 'Monthly Power Pack',
    discount: '৳100 OFF',
    badge: 'RECHARGE',
    code: 'GPMEGA100',
    validity: 'Valid till 30 Oct',
    description: 'Exclusive ৳100 cashback recharge bonus on Grameenphone 30GB 30-day all-purpose internet pack.',
    category: 'Recharge',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&auto=format&fit=crop&q=80',
    merchant: 'Grameenphone',
    screen: 'MobileRecharge',
  },
  {
    id: 'off_4',
    title: 'Star Tech Tech Peripherals',
    subtitle: 'Keyboards, Mice & Audio',
    discount: '-15%',
    badge: 'ELECTRONICS',
    code: 'STARTECH15',
    validity: 'Valid till 15 Nov',
    description: 'Upgrade your gaming setup or work desk with 15% instant discount on premium computer accessories.',
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
    merchant: 'Star Tech Ltd',
    screen: 'MerchantPayment',
  },
];

const COMBOS = [
  {
    id: 'combo_1',
    title: 'Taco Kit & Drink Combo',
    badgeText: '1+1',
    savings: 'Save ৳250',
    code: 'TACO1PLUS1',
    validity: 'Valid this weekend',
    description: 'Buy 1 Double Taco meal and get another Taco combo totally free when paying via GenCash QR scanner.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&auto=format&fit=crop&q=80',
    gradient: ['#1E3A8A', '#3B82F6'],
  },
  {
    id: 'combo_2',
    title: 'Crispy Snack & Dip Duo',
    badgeText: '1+1',
    savings: 'Save ৳180',
    code: 'DORITO1PLUS1',
    validity: 'Valid this week',
    description: 'Buy 1 Large Party Nacho pack and get Cheesy Jalapeno dip absolutely free on partner outlets.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
    gradient: ['#164E3D', '#00D09C'],
  },
];

const BRANDS = [
  { id: 'b1', name: 'Shwapno', icon: 'cart-outline', color: '#10B981', bg: '#E8F7F0' },
  { id: 'b2', name: 'Chillox', icon: 'fast-food-outline', color: '#F59E0B', bg: '#FEF5E7' },
  { id: 'b3', name: 'Star Tech', icon: 'laptop-outline', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'b4', name: 'Yellow', icon: 'shirt-outline', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'b5', name: 'Daily Shopping', icon: 'basket-outline', color: '#059669', bg: '#ECFDF5' },
  { id: 'b6', name: 'Ryans', icon: 'hardware-chip-outline', color: '#6366F1', bg: '#EEF2FF' },
];

export const OffersSection = ({ navigation, onOpenQR }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const { t, isBangla } = useLanguage();

  const handleClaim = (offer) => {
    setSelectedOffer(offer);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    Alert.alert('Code Copied!', `Voucher code ${selectedOffer?.code} copied to clipboard.`);
  };

  const handleUseOffer = () => {
    const targetScreen = selectedOffer?.screen || 'MerchantPayment';
    setSelectedOffer(null);
    if (navigation) {
      navigation.navigate(targetScreen);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Rewards & Voucher QR Card Header (UbaCart style top banner) */}
      <View style={styles.rewardBannerContainer}>
        <LinearGradient
          colors={['#164E3D', '#0F2F24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rewardBanner}
        >
          <View style={styles.rewardTextWrap}>
            <View style={styles.rewardPill}>
              <Ionicons name="sparkles" size={12} color="#00D09C" />
              <Text style={styles.rewardPillText}>GENCASH PERKS</Text>
            </View>
            <Text style={styles.rewardTitle}>
              {isBangla ? 'কাউন্টারে স্ক্যান করে ছাড় পান' : 'Scan & Save at Checkout'}
            </Text>
            <Text style={styles.rewardSub}>
              {isBangla
                ? '৫,০০০+ রিটেইল আউটলেটে ২৫% পর্যন্ত ছাড় ও ক্যাশব্যাক'
                : 'Earn up to 25% instant cashback & discounts across 5,000+ retail stores'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rewardQrBtn}
            onPress={onOpenQR}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code" size={28} color="#00D09C" />
            <Text style={styles.rewardQrBtnText}>{isBangla ? 'কিউআর' : 'Show QR'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* 2. Special Offers Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t('specialOffers', 'Special Offers')}</Text>
        <TouchableOpacity onPress={() => Alert.alert('All Offers', 'Explore 50+ available offers & discounts.')}>
          <Text style={styles.seeAllText}>{t('seeAll', 'See All')}</Text>
        </TouchableOpacity>
      </View>

      {/* Special Offers Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersScroll}
      >
        {/* Leading "% Check Available Discounts" Accent Card */}
        <LinearGradient
          colors={['#1B4D3E', '#064E3B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentDiscountCard}
        >
          <View style={styles.percentCircle}>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
          <Text style={styles.accentCardTitle}>
            {isBangla ? 'উপলব্ধ ছাড়সমূহ দেখুন' : 'Check available discounts'}
          </Text>
          <Text style={styles.accentCardSub}>
            {isBangla ? 'প্রতিদিনের এক্সক্লুসিভ ডিল' : 'Daily exclusive partner deals'}
          </Text>
        </LinearGradient>

        {/* Product / Merchant Offer Cards */}
        {SPECIAL_OFFERS.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: offer.image }} style={styles.offerImage} resizeMode="cover" />
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{offer.discount}</Text>
              </View>
            </View>

            <View style={styles.offerContent}>
              <Text style={styles.offerTitle} numberOfLines={1}>
                {offer.title}
              </Text>
              <Text style={styles.offerSub} numberOfLines={1}>
                {offer.subtitle}
              </Text>

              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.75}
                onPress={() => handleClaim(offer)}
              >
                <Ionicons name="add" size={14} color="#FFFFFF" />
                <Text style={styles.addBtnText}>{t('claim', 'Claim')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 3. Combos & BOGO Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t('combosBogo', 'Combos & BOGO')}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Combos', 'Explore 1+1 and BOGO deals.')}>
          <Text style={styles.seeAllText}>{t('seeAll', 'View Deals')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.combosGrid}>
        {COMBOS.map((combo) => (
          <TouchableOpacity
            key={combo.id}
            style={styles.comboCard}
            activeOpacity={0.85}
            onPress={() => handleClaim(combo)}
          >
            <LinearGradient
              colors={combo.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.comboGradient}
            >
              <View style={styles.comboHeader}>
                <Text style={styles.comboTitle} numberOfLines={2}>
                  {combo.title}
                </Text>
                <View style={styles.bogoBadge}>
                  <Text style={styles.bogoBadgeText}>{combo.badgeText}</Text>
                </View>
              </View>

              <View style={styles.comboImageWrap}>
                <Image source={{ uri: combo.image }} style={styles.comboImage} resizeMode="cover" />
              </View>

              <View style={styles.comboFooter}>
                <Text style={styles.comboSavings}>{combo.savings}</Text>
                <View style={styles.comboActionBtn}>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Partner Brands Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t('featuredBrands', 'Featured Partner Brands')}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsScroll}
      >
        {BRANDS.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={styles.brandCard}
            activeOpacity={0.7}
            onPress={() => {
              if (navigation) navigation.navigate('MerchantPayment');
            }}
          >
            <View style={[styles.brandIconWrap, { backgroundColor: b.bg }]}>
              <Ionicons name={b.icon} size={20} color={b.color} />
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Modern Voucher / Offer Detail Bottom Sheet Modal */}
      {selectedOffer && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedOffer(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                <TouchableOpacity onPress={() => setSelectedOffer(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Image source={{ uri: selectedOffer.image }} style={styles.modalImage} resizeMode="cover" />

              <Text style={styles.modalDesc}>{selectedOffer.description}</Text>

              {/* Promo Code Box */}
              <View style={styles.codeBox}>
                <View>
                  <Text style={styles.codeLabel}>PROMO CODE</Text>
                  <Text style={styles.codeValue}>{selectedOffer.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                  <Ionicons
                    name={copiedCode ? 'checkmark' : 'copy-outline'}
                    size={16}
                    color="#1B4D3E"
                  />
                  <Text style={styles.copyBtnText}>{copiedCode ? 'Copied' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>

              {/* Barcode / Scan Simulation */}
              <View style={styles.barcodeBox}>
                <Text style={styles.barcodeDigits}>||||| | |||| ||| |||||| || ||||</Text>
                <Text style={styles.barcodeSub}>Scan this code or tap below to pay with offer</Text>
              </View>

              <TouchableOpacity style={styles.modalActionBtn} onPress={handleUseOffer}>
                <Text style={styles.modalActionBtnText}>Use Offer Now</Text>
                <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  rewardBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    shadowColor: '#164E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  rewardTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 156, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
    gap: 4,
  },
  rewardPillText: {
    color: '#00D09C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rewardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  rewardSub: {
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15,
  },
  rewardQrBtn: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 156, 0.3)',
  },
  rewardQrBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  seeAllText: {
    color: '#00D09C',
    fontSize: 12,
    fontWeight: '700',
  },

  // Special Offers Carousel
  offersScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 6,
    gap: 12,
  },
  accentDiscountCard: {
    width: 140,
    height: 200,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  percentCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentSymbol: {
    color: '#00D09C',
    fontSize: 22,
    fontWeight: '900',
  },
  accentCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  accentCardSub: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '500',
  },

  offerCard: {
    width: 150,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 95,
    position: 'relative',
    backgroundColor: '#F3F9F6',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#00D09C',
    fontSize: 10,
    fontWeight: '900',
  },
  offerContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  offerTitle: {
    color: '#0F2F24',
    fontSize: 12,
    fontWeight: '700',
  },
  offerSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B4D3E',
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    marginTop: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Combos Grid
  combosGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 14,
  },
  comboCard: {
    flex: 1,
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  comboGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  comboTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  bogoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bogoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  comboImageWrap: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 4,
  },
  comboImage: {
    width: '100%',
    height: '100%',
  },
  comboFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comboSavings: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  comboActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Brands Scroll
  brandsScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 10,
    marginBottom: 10,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    gap: 8,
  },
  brandIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    color: '#0F2F24',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalDesc: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    marginBottom: 12,
  },
  codeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  codeValue: {
    color: '#1B4D3E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  copyBtnText: {
    color: '#1B4D3E',
    fontSize: 12,
    fontWeight: '700',
  },
  barcodeBox: {
    alignItems: 'center',
    backgroundColor: '#F3F9F6',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  barcodeDigits: {
    fontFamily: 'monospace',
    fontSize: 18,
    letterSpacing: 2,
    color: '#0F2F24',
    fontWeight: '900',
  },
  barcodeSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
  modalActionBtn: {
    flexDirection: 'row',
    backgroundColor: '#1B4D3E',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
