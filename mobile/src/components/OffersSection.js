import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const OFFER_CATEGORIES = [
  { id: 'all', labelEn: 'All Deals', labelBn: 'সকল অফার', icon: 'grid-outline' },
  { id: 'Food', labelEn: 'Food & Dining', labelBn: 'খাবার ও ক্যাফে', icon: 'fast-food-outline' },
  { id: 'Grocery', labelEn: 'Groceries', labelBn: 'সুপারশপ', icon: 'cart-outline' },
  { id: 'Recharge', labelEn: 'Mobile Recharge', labelBn: 'রিচার্জ প্যাক', icon: 'phone-portrait-outline' },
  { id: 'Tech', labelEn: 'Electronics', labelBn: 'গ্যাজেট ও টেক', icon: 'laptop-outline' },
  { id: 'Fashion', labelEn: 'Lifestyle', labelBn: 'ফ্যাশন ও শপিং', icon: 'shirt-outline' },
];

const SPECIAL_OFFERS = [
  {
    id: 'off_1',
    title: 'Shwapno Superstore',
    subtitle: 'Min spend ৳1,000 via GenCash QR',
    discount: '20% CASHBACK',
    badge: 'GROCERY',
    code: 'SHWAPNO20',
    validity: 'Valid till 31 Oct',
    description: 'Get flat 20% instant cashback on fresh groceries, household items, and pantry staples when paying with GenCash QR.',
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    merchant: 'Shwapno Superstore',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_2',
    title: 'Chillox Gourmet Burger',
    subtitle: 'Any Burger + Fries + Drinks',
    discount: '35% DISCOUNT',
    badge: 'HOT DEAL',
    code: 'CHILLOX35',
    validity: 'Valid till 25 Oct',
    description: 'Enjoy 35% instant discount on all burger meals across all branches in Dhaka, Chittagong & Sylhet with GenCash Pay.',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    merchant: 'Chillox Burger Hub',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_3',
    title: 'Grameenphone 30GB Powerpack',
    subtitle: '30GB + 500 Min for 30 Days',
    discount: '৳100 CASHBACK',
    badge: 'RECHARGE',
    code: 'GPMEGA100',
    validity: 'Valid till 30 Oct',
    description: 'Exclusive ৳100 cashback recharge bonus on Grameenphone 30GB 30-day all-purpose internet powerpack.',
    category: 'Recharge',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500&auto=format&fit=crop&q=80',
    merchant: 'Grameenphone',
    screen: 'MobileRecharge',
  },
  {
    id: 'off_4',
    title: 'Star Tech Tech Peripherals',
    subtitle: 'Mechanical Keyboards, Mice & Audio',
    discount: '15% OFF',
    badge: 'ELECTRONICS',
    code: 'STARTECH15',
    validity: 'Valid till 15 Nov',
    description: 'Upgrade your gaming setup or work desk with 15% instant discount on premium computer accessories.',
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
    merchant: 'Star Tech Ltd',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_5',
    title: 'Yellow by Beximco',
    subtitle: 'Autumn Fashion Collection',
    discount: '25% OFF',
    badge: 'FASHION',
    code: 'YELLOW25',
    validity: 'Valid till 05 Nov',
    description: 'Get 25% flat discount on selected shirts, panjabis, kurtis and western apparel at Yellow outlets nationwide.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80',
    merchant: 'Yellow Lifestyle',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_6',
    title: 'KFC Bangladesh',
    subtitle: 'Zinger Box + 4pc Hot Wings',
    discount: '৳180 SAVINGS',
    badge: 'FOOD',
    code: 'KFCCRUNCH',
    validity: 'Valid till 28 Oct',
    description: 'Order your favorite crispy chicken meal and save ৳180 instantly on in-store GenCash QR payment.',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&auto=format&fit=crop&q=80',
    merchant: 'KFC Bangladesh',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_7',
    title: 'Daily Shopping Outlets',
    subtitle: 'Min grocery bill ৳800',
    discount: '৳120 OFF',
    badge: 'GROCERY',
    code: 'DAILY120',
    validity: 'Valid till 31 Oct',
    description: 'Save ৳120 on your weekly groceries and kitchen essentials at all Daily Shopping neighbourhood stores.',
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
    merchant: 'Daily Shopping',
    screen: 'MerchantPayment',
  },
  {
    id: 'off_8',
    title: 'Daraz Online Shopping',
    subtitle: 'Mega Electronics & Home Deals',
    discount: '৳250 VOUCHER',
    badge: 'ONLINE',
    code: 'DARAZCASH',
    validity: 'Valid till 10 Nov',
    description: 'Extra ৳250 voucher on minimum order of ৳1,800 when paying with GenCash online gateway.',
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=80',
    merchant: 'Daraz Bangladesh',
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=80',
    gradient: ['#1E3A8A', '#3B82F6'],
    screen: 'MerchantPayment',
  },
  {
    id: 'combo_2',
    title: 'Crispy Snack & Dip Duo',
    badgeText: '1+1',
    savings: 'Save ৳180',
    code: 'DORITO1PLUS1',
    validity: 'Valid this week',
    description: 'Buy 1 Large Party Nacho pack and get Cheesy Jalapeno dip absolutely free on partner outlets.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    gradient: ['#164E3D', '#00D09C'],
    screen: 'MerchantPayment',
  },
];

const BRANDS = [
  { id: 'b1', name: 'Shwapno', icon: 'cart-outline', color: '#10B981', bg: '#E8F7F0', category: 'Grocery' },
  { id: 'b2', name: 'Chillox', icon: 'fast-food-outline', color: '#F59E0B', bg: '#FEF5E7', category: 'Food' },
  { id: 'b3', name: 'Star Tech', icon: 'laptop-outline', color: '#3B82F6', bg: '#EFF6FF', category: 'Tech' },
  { id: 'b4', name: 'Yellow', icon: 'shirt-outline', color: '#EC4899', bg: '#FDF2F8', category: 'Fashion' },
  { id: 'b5', name: 'KFC', icon: 'restaurant-outline', color: '#EF4444', bg: '#FEF2F2', category: 'Food' },
  { id: 'b6', name: 'Daraz', icon: 'bag-handle-outline', color: '#F97316', bg: '#FFF7ED', category: 'Tech' },
];

export const OffersSection = ({ navigation, onOpenQR }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const { t, isBangla } = useLanguage();

  const handleClaim = (offer) => {
    setSelectedOffer(offer);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    Alert.alert(
      isBangla ? 'কুপন কোড কপি হয়েছে!' : 'Promo Code Copied!',
      isBangla
        ? `কুপন কোড "${selectedOffer?.code}" ক্লিপবোর্ডে কপি করা হয়েছে।`
        : `Voucher code "${selectedOffer?.code}" copied to clipboard.`
    );
  };

  const handleUseOffer = () => {
    const targetScreen = selectedOffer?.screen || 'MerchantPayment';
    setSelectedOffer(null);
    setShowAllModal(false);
    if (navigation?.navigate) {
      navigation.navigate(targetScreen);
    }
  };

  // Filtered offers for All-Offers Modal
  const modalFilteredOffers = useMemo(() => {
    return SPECIAL_OFFERS.filter((offer) => {
      const matchesCategory =
        activeCategory === 'all' || offer.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        offer.title.toLowerCase().includes(q) ||
        offer.subtitle.toLowerCase().includes(q) ||
        offer.merchant.toLowerCase().includes(q) ||
        offer.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 1. Rewards & Voucher QR Card Header */}
      <View style={styles.rewardBannerContainer}>
        <LinearGradient
          colors={['#164E3D', '#0F2F24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rewardBanner}
        >
          <View style={styles.rewardTextWrap}>
            <View style={styles.rewardPill}>
              <Ionicons name="sparkles" size={11} color="#00D09C" />
              <Text style={styles.rewardPillText}>GENCASH PERKS</Text>
            </View>
            <Text style={styles.rewardTitle}>
              {isBangla ? 'কাউন্টারে স্ক্যান করে ছাড় পান' : 'Scan & Save at Checkout'}
            </Text>
            <Text style={styles.rewardSub}>
              {isBangla
                ? '৫,০০০+ পার্টনার আউটলেটে ৩৫% পর্যন্ত ইনস্ট্যান্ট ছাড় ও ক্যাশব্যাক'
                : 'Earn up to 35% instant cashback & discounts across 5,000+ retail stores'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rewardQrBtn}
            onPress={onOpenQR}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code" size={26} color="#00D09C" />
            <Text style={styles.rewardQrBtnText}>{isBangla ? 'কিউআর' : 'Show QR'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* 2. Special Offers Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>{t('specialOffers', 'Special Offers')}</Text>
          <View style={styles.offerBadgeCount}>
            <Text style={styles.offerBadgeCountText}>{SPECIAL_OFFERS.length} Deals</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowAllModal(true)}
          activeOpacity={0.7}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>{t('seeAll', 'See All')}</Text>
          <Ionicons name="chevron-forward" size={14} color="#00D09C" />
        </TouchableOpacity>
      </View>

      {/* Special Offers Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersScroll}
      >
        {/* Leading "% Check Available Discounts" Accent Card - CLICKABLE */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setShowAllModal(true)}
          style={styles.accentCardTouchable}
        >
          <LinearGradient
            colors={['#043227', '#064E3B', '#0D5E4A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.accentDiscountCard}
          >
            <View style={styles.percentCircle}>
              <Text style={styles.percentSymbol}>%</Text>
            </View>
            <View>
              <Text style={styles.accentCardTitle}>
                {isBangla ? 'উপলব্ধ ছাড়সমূহ দেখুন' : 'Explore All Discounts'}
              </Text>
              <Text style={styles.accentCardSub}>
                {isBangla ? 'দৈনিক এক্সক্লুসিভ ডিল ও ক্যাশব্যাক' : 'Daily exclusive partner deals & vouchers'}
              </Text>
            </View>
            <View style={styles.accentCardArrowRow}>
              <Text style={styles.accentCardArrowText}>{isBangla ? 'সব দেখুন' : 'View All'}</Text>
              <Ionicons name="arrow-forward" size={14} color="#00D09C" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Product / Merchant Offer Cards - ENTIRE CARD IS CLICKABLE */}
        {SPECIAL_OFFERS.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            style={styles.offerCard}
            activeOpacity={0.85}
            onPress={() => handleClaim(offer)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: offer.image }} style={styles.offerImage} resizeMode="cover" />
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{offer.discount}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{offer.category}</Text>
              </View>
            </View>

            <View style={styles.offerContent}>
              <View>
                <Text style={styles.offerTitle} numberOfLines={1}>
                  {offer.title}
                </Text>
                <Text style={styles.offerSub} numberOfLines={1}>
                  {offer.subtitle}
                </Text>
              </View>

              <View style={styles.offerFooterRow}>
                <Text style={styles.validityText}>{offer.validity}</Text>
                <View style={styles.addBtn}>
                  <Text style={styles.addBtnText}>{t('claim', 'Claim')}</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. Combos & BOGO Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>{t('combosBogo', 'Combos & BOGO')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAllModal(true)}
          activeOpacity={0.7}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>{t('seeAll', 'View Deals')}</Text>
          <Ionicons name="chevron-forward" size={14} color="#00D09C" />
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
              setActiveCategory(b.category);
              setShowAllModal(true);
            }}
          >
            <View style={[styles.brandIconWrap, { backgroundColor: b.bg }]}>
              <Ionicons name={b.icon} size={20} color={b.color} />
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Complete "All Special Offers & Deals" Explorer Modal */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.allOffersModalContainer}>
          {/* Modal Top Header */}
          <LinearGradient
            colors={['#043227', '#064E3B', '#0D5E4A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.allOffersHeader}
          >
            <View style={styles.allOffersTopNav}>
              <TouchableOpacity
                onPress={() => setShowAllModal(false)}
                style={styles.allOffersCloseBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.allOffersHeaderTitle}>
                {isBangla ? 'সকল স্পেশাল অফার ও ক্যাশব্যাক' : 'All Offers & Discounts'}
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {/* In-Modal Search Bar */}
            <View style={styles.allOffersSearchBar}>
              <Ionicons name="search" size={18} color="#A7F3D0" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.allOffersSearchInput}
                placeholder={
                  isBangla
                    ? 'অফার বা ব্র্যান্ড খুঁজুন (যেমন: শপ্ন, বার্গার, রিচার্জ...)'
                    : 'Search brand or offer (e.g. Shwapno, Burger...)'
                }
                placeholderTextColor="#74B49C"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#A7F3D0" />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.allOffersCategoryScroll}
            >
              {OFFER_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.allOffersCatChip,
                      isActive && styles.allOffersCatChipActive,
                    ]}
                    onPress={() => setActiveCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={14}
                      color={isActive ? '#043227' : '#FFFFFF'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.allOffersCatText,
                        isActive && styles.allOffersCatTextActive,
                      ]}
                    >
                      {isBangla ? cat.labelBn : cat.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>

          {/* Offers List */}
          <ScrollView
            contentContainerStyle={styles.allOffersListScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.allOffersCountRow}>
              <Text style={styles.allOffersCountText}>
                {modalFilteredOffers.length}{' '}
                {isBangla ? 'টি অফার পাওয়া গেছে' : 'offers available'}
              </Text>
            </View>

            {modalFilteredOffers.length === 0 ? (
              <View style={styles.emptyOffersBox}>
                <Ionicons name="pricetag-outline" size={42} color="#94A3B8" />
                <Text style={styles.emptyOffersTitle}>
                  {isBangla ? 'কোনো অফার পাওয়া যায়নি' : 'No matching offers found'}
                </Text>
                <Text style={styles.emptyOffersSub}>
                  {isBangla
                    ? 'অন্য কোনো ক্যাটাগরি বেছে নিন অথবা ভিন্ন শব্দ দিয়ে সার্চ করুন।'
                    : 'Try selecting a different category or search keyword.'}
                </Text>
              </View>
            ) : (
              modalFilteredOffers.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.modalOfferCard}
                  activeOpacity={0.85}
                  onPress={() => handleClaim(offer)}
                >
                  <Image source={{ uri: offer.image }} style={styles.modalOfferCardImage} resizeMode="cover" />
                  <View style={styles.modalOfferCardContent}>
                    <View style={styles.modalOfferCardHeader}>
                      <View style={styles.modalOfferTag}>
                        <Text style={styles.modalOfferTagText}>{offer.category}</Text>
                      </View>
                      <View style={styles.modalDiscountPill}>
                        <Text style={styles.modalDiscountPillText}>{offer.discount}</Text>
                      </View>
                    </View>

                    <Text style={styles.modalOfferCardTitle} numberOfLines={1}>
                      {offer.title}
                    </Text>
                    <Text style={styles.modalOfferCardSub} numberOfLines={2}>
                      {offer.subtitle}
                    </Text>

                    <View style={styles.modalOfferCardFooter}>
                      <Text style={styles.modalOfferValidity}>{offer.validity}</Text>
                      <View style={styles.modalClaimActionBtn}>
                        <Text style={styles.modalClaimActionText}>{t('claim', 'Claim Offer')}</Text>
                        <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* 6. Modern Voucher / Offer Detail Bottom Sheet Modal */}
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
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={styles.detailMerchantRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#00D09C" />
                    <Text style={styles.detailMerchantText}>{selectedOffer.merchant || 'GenCash Partner'}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOffer(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalImageWrap}>
                <Image source={{ uri: selectedOffer.image }} style={styles.modalImage} resizeMode="cover" />
                {selectedOffer.discount && (
                  <View style={styles.modalImageDiscountBadge}>
                    <Text style={styles.modalImageDiscountText}>{selectedOffer.discount}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.modalDesc}>{selectedOffer.description}</Text>

              {/* Promo Code Box */}
              <View style={styles.codeBox}>
                <View>
                  <Text style={styles.codeLabel}>PROMO CODE / ভাউচার কোড</Text>
                  <Text style={styles.codeValue}>{selectedOffer.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.8}>
                  <Ionicons
                    name={copiedCode ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color="#064E3B"
                  />
                  <Text style={styles.copyBtnText}>
                    {copiedCode ? (isBangla ? 'কপি হয়েছে' : 'Copied') : (isBangla ? 'কপি করুন' : 'Copy')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Barcode / Scan Simulation */}
              <View style={styles.barcodeBox}>
                <Text style={styles.barcodeDigits}>||||| | |||| ||| |||||| || ||||</Text>
                <Text style={styles.barcodeSub}>
                  {isBangla ? 'কাউন্টারে কোডটি দেখান অথবা নিচে ট্যাপ করুন' : 'Show code at merchant counter or tap below'}
                </Text>
              </View>

              <TouchableOpacity style={styles.modalActionBtn} onPress={handleUseOffer} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#043227', '#064E3B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalActionGradient}
                >
                  <Text style={styles.modalActionBtnText}>
                    {isBangla ? 'অফারটি এখনই ব্যবহার করুন' : 'Use Offer Now'}
                  </Text>
                  <Ionicons name="flash" size={16} color="#00D09C" style={{ marginLeft: 6 }} />
                </LinearGradient>
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
    width: 66,
    height: 66,
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
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#0B251E',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  offerBadgeCount: {
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  offerBadgeCountText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '800',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: '#00D09C',
    fontSize: 12,
    fontWeight: '700',
  },

  // Carousel
  offersScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    gap: 12,
  },
  accentCardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  accentDiscountCard: {
    width: 145,
    height: 215,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  percentCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 208, 156, 0.2)',
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
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 4,
  },
  accentCardSub: {
    color: '#A7F3D0',
    fontSize: 10,
    lineHeight: 14,
  },
  accentCardArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accentCardArrowText: {
    color: '#00D09C',
    fontSize: 11,
    fontWeight: '800',
  },

  offerCard: {
    width: 160,
    height: 215,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 105,
    position: 'relative',
    backgroundColor: '#F6F9F8',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#064E3B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#00D09C',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  offerContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  offerTitle: {
    color: '#0B251E',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  offerSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  offerFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  validityText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
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
    height: 165,
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
    color: '#0B251E',
    fontSize: 12,
    fontWeight: '700',
  },

  // All Offers Full Modal
  allOffersModalContainer: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  allOffersHeader: {
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  allOffersTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  allOffersCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allOffersHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  allOffersSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: 14,
  },
  allOffersSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  allOffersCategoryScroll: {
    gap: 8,
  },
  allOffersCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  allOffersCatChipActive: {
    backgroundColor: '#00D09C',
    borderColor: '#00D09C',
  },
  allOffersCatText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  allOffersCatTextActive: {
    color: '#043227',
    fontWeight: '800',
  },
  allOffersListScroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  allOffersCountRow: {
    marginBottom: 4,
  },
  allOffersCountText: {
    color: '#47665C',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyOffersBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    marginTop: 20,
  },
  emptyOffersTitle: {
    color: '#0B251E',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyOffersSub: {
    color: '#7B968D',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  modalOfferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    height: 120,
  },
  modalOfferCardImage: {
    width: 115,
    height: '100%',
  },
  modalOfferCardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  modalOfferCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOfferTag: {
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalOfferTagText: {
    color: '#064E3B',
    fontSize: 9,
    fontWeight: '800',
  },
  modalDiscountPill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalDiscountPillText: {
    color: '#00D09C',
    fontSize: 9,
    fontWeight: '900',
  },
  modalOfferCardTitle: {
    color: '#0B251E',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  modalOfferCardSub: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
  },
  modalOfferCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modalOfferValidity: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  modalClaimActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  modalClaimActionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Detail Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailMerchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailMerchantText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
  },
  modalTitle: {
    color: '#0B251E',
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalImageWrap: {
    width: '100%',
    height: 145,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImageDiscountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalImageDiscountText: {
    color: '#00D09C',
    fontSize: 11,
    fontWeight: '900',
  },
  modalDesc: {
    color: '#47665C',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2E6DC',
    marginBottom: 12,
  },
  codeLabel: {
    color: '#7B968D',
    fontSize: 9,
    fontWeight: '800',
  },
  codeValue: {
    color: '#064E3B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#00D09C',
  },
  copyBtnText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
  },
  barcodeBox: {
    alignItems: 'center',
    backgroundColor: '#F6F9F8',
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
  },
  barcodeDigits: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    letterSpacing: 2,
    color: '#0B251E',
    fontWeight: '900',
  },
  barcodeSub: {
    color: '#7B968D',
    fontSize: 10,
    marginTop: 4,
  },
  modalActionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalActionGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
