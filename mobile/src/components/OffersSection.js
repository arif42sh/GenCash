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
import OfferCarousel from './OfferCarousel';
import { OPERATOR_LOGOS } from '../assets/operatorLogos';

const OFFER_CATEGORIES = [
  { id: 'all', labelEn: 'All Offers', labelBn: 'সকল অফার', icon: 'grid-outline' },
  { id: 'Recharge', labelEn: 'Mobile Recharge', labelBn: 'মোবাইল রিচার্জ', icon: 'phone-portrait-outline' },
  { id: 'AddMoney', labelEn: 'Add Money', labelBn: 'টাকা যোগ বোনাস', icon: 'card-outline' },
  { id: 'SendMoney', labelEn: 'Send Money', labelBn: 'সেন্ড মানি অফার', icon: 'paper-plane-outline' },
  { id: 'Payment', labelEn: 'QR Payment', labelBn: 'মার্চেন্ট পেমেন্ট', icon: 'qr-code-outline' },
  { id: 'BillPay', labelEn: 'Bill Pay', labelBn: 'বিল পে ক্যাশব্যাক', icon: 'receipt-outline' },
  { id: 'CashOut', labelEn: 'Cash Out', labelBn: 'ক্যাশ আউট রেট', icon: 'cash-outline' },
];

const SPECIAL_OFFERS = [
  {
    id: 'off_rc_1',
    title: '১০০ টাকা রিচার্জে ২০ টাকা বোনাস',
    titleEn: '৳20 Bonus on ৳100 Recharge',
    subtitle: 'যেকোনো সিমে তাৎক্ষণিক ২০ টাকা ক্যাশব্যাক',
    subtitleEn: 'Instant ৳20 cashback on any prepaid SIM',
    discount: '৳২০ বোনাস',
    discountEn: '৳20 BONUS',
    badge: 'RECHARGE',
    code: 'RECHARGE20',
    validity: '৩১ অক্টোবর পর্যন্ত',
    validityEn: 'Valid till 31 Oct',
    description: 'যেকোনো প্রিপেইড নম্বরে ১০০ টাকা বা তার বেশি মোবাইল রিচার্জ করলে সাথে সাথে ২০ টাকা ক্যাশব্যাক বোনাস আপনার ওয়ালেটে জমা হবে।',
    descriptionEn: 'Recharge ৳100 or more to any prepaid number and get flat ৳20 instant cashback bonus credited to your wallet.',
    category: 'Recharge',
    filterType: 'bonus',
    gradient: ['#00D09C', '#059669'],
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=80',
    merchant: 'Mobile Recharge (All Operators)',
    screen: 'MobileRecharge',
    btnTextBn: 'এখনই রিচার্জ করুন',
    btnTextEn: 'Recharge Now',
  },
  {
    id: 'off_rc_2',
    title: '২০৯ টাকা রিচার্জে ৫জিবি ডাটা + ১৫ টাকা ক্যাশব্যাক',
    titleEn: '৳209 Recharge: 5GB + ৳15 Cashback',
    subtitle: '৭ দিন মেয়াদি স্পেশাল ইন্টারনেট প্যাক',
    subtitleEn: '7-Day high speed 4G data bundle',
    discount: '৳১৫ ক্যাশব্যাক',
    discountEn: '৳15 CASHBACK',
    badge: 'INTERNET PACK',
    code: 'DATA5GB',
    validity: '১৫ নভেম্বর পর্যন্ত',
    validityEn: 'Valid till 15 Nov',
    description: 'জিপি, রবি, বাংলালিংক নম্বরে ২০৯ টাকা রিচার্জে উপভোগ করুন ৫ জিবি ইন্টারনেট ও সাথে নিশ্চিত ১৫ টাকা ক্যাশব্যাক রিওয়ার্ড।',
    descriptionEn: 'Recharge ৳209 on GP, Robi or Banglalink to activate 5GB internet pack and receive ৳15 direct cashback.',
    category: 'Recharge',
    filterType: 'cashback',
    gradient: ['#0284C7', '#0369A1'],
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500&auto=format&fit=crop&q=80',
    merchant: 'Grameenphone / Robi / BL',
    screen: 'MobileRecharge',
    btnTextBn: 'প্যাক কিনুন',
    btnTextEn: 'Get Pack Now',
  },
  {
    id: 'off_am_1',
    title: '১,০০০ টাকা অ্যাড মানিতে ৫০ টাকা ক্যাশব্যাক',
    titleEn: '৳50 Cashback on ৳1,000 Add Money',
    subtitle: 'ভিসা/মাস্টারকার্ড ও ব্যাংক ট্রান্সফারে',
    subtitleEn: 'From Visa, Mastercard or Bank Transfer',
    discount: '৳৫০ ক্যাশব্যাক',
    discountEn: '৳50 CASHBACK',
    badge: 'ADD MONEY',
    code: 'ADD50CASH',
    validity: '১৫ নভেম্বর পর্যন্ত',
    validityEn: 'Valid till 15 Nov',
    description: 'যেকোনো ব্যাংক বা কার্ড থেকে ন্যূনতম ১,০০০ টাকা ওয়ালেটে যোগ করলেই ৫০ টাকা বোনাস সরাসরি ব্যালেন্সে যুক্ত হবে। সম্পূর্ণ ০% চার্জ।',
    descriptionEn: 'Deposit ৳1,000 or more from any Bank Account or Visa/Mastercard and receive ৳50 instant cashback. 100% Free.',
    category: 'AddMoney',
    filterType: 'cashback',
    gradient: ['#10B981', '#047857'],
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    merchant: 'Bank & Card Deposit',
    screen: 'AddMoney',
    btnTextBn: 'টাকা যোগ করুন',
    btnTextEn: 'Add Money Now',
  },
  {
    id: 'off_am_2',
    title: 'কার্ড বা ব্যাংক থেকে ৩,০০০ টাকায় ৭৫ টাকা রিওয়ার্ড',
    titleEn: '৳75 Bonus on ৳3,000 Deposit',
    subtitle: 'মাসিক সঞ্চয়ে অতিরিক্ত ক্যাশ রিওয়ার্ড',
    subtitleEn: 'Exclusive monthly deposit perk',
    discount: '৳৭৫ রিওয়ার্ড',
    discountEn: '৳75 BONUS',
    badge: 'BANK DEPOSIT',
    code: 'BANK75',
    validity: '৩০ নভেম্বর পর্যন্ত',
    validityEn: 'Valid till 30 Nov',
    description: 'সিটি ব্যাংক, ব্র্যাক বা ইস্টার্ন ব্যাংক অ্যাকাউন্ট লিংক করে ৩,০০০ টাকা বা তার বেশি অ্যাড মানি করলেই পেয়ে যান ৭৫ টাকা ক্যাশ রিওয়ার্ড।',
    descriptionEn: 'Link City, BRAC or EBL bank accounts and add ৳3,000 or more to claim ৳75 direct bonus reward.',
    category: 'AddMoney',
    filterType: 'bonus',
    gradient: ['#6366F1', '#4338CA'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
    merchant: 'Partner Banks Network',
    screen: 'AddMoney',
    btnTextBn: 'অ্যাড মানি করুন',
    btnTextEn: 'Deposit Now',
  },
  {
    id: 'off_sm_1',
    title: '৫টি প্রিয় নম্বরে ফ্রি সেন্ড মানি',
    titleEn: 'Free Send Money to 5 Priyo Numbers',
    subtitle: 'কোনো ফি ছাড়া আনলিমিটেড ফ্রি টাকা পাঠান',
    subtitleEn: 'Zero transaction charge every month',
    discount: '০ টাকা ফি (FREE)',
    discountEn: '৳0 FEE (FREE)',
    badge: 'SEND MONEY',
    code: 'PRIYOFREE',
    validity: 'সারাবছর প্রযোজ্য',
    validityEn: 'Available Always',
    description: 'আপনার পরিবারের ৫টি প্রিয় নম্বরে প্রতি মাসে ২৫,০০০ টাকা পর্যন্ত সম্পূর্ণ ফ্রি সেন্ড মানি করুন। কোনো চার্জ কাটা হবে না।',
    descriptionEn: 'Save 5 favorite family numbers and send money up to ৳25,000 every month with absolutely 0% transfer charge.',
    category: 'SendMoney',
    filterType: 'free',
    gradient: ['#F59E0B', '#D97706'],
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop&q=80',
    merchant: 'P2P Send Money',
    screen: 'SendMoney',
    btnTextBn: 'টাকা পাঠান',
    btnTextEn: 'Send Money',
  },
  {
    id: 'off_qr_1',
    title: 'কিউআর মার্চেন্ট পেমেন্টে ১৫% ক্যাশব্যাক',
    titleEn: '15% Instant Cashback on QR Pay',
    subtitle: 'আউটলেটে কিউআর স্ক্যান করে পেমেন্টে',
    subtitleEn: 'Scan counter QR at 5,000+ retail stores',
    discount: '১৫% ছাড়',
    discountEn: '15% CASHBACK',
    badge: 'PAYMENT',
    code: 'QRPAY15',
    validity: '৩০ অক্টোবর পর্যন্ত',
    validityEn: 'Valid till 30 Oct',
    description: 'স্বপ্ন, আড়ং, বাটা সহ দেশের ৫,০০০+ রিটেইল কাউন্টারে GenCash কিউআর স্ক্যান করে পেমেন্ট করলেই সর্বোচ্চ ১০০ টাকা পর্যন্ত তাৎক্ষণিক ক্যাশব্যাক।',
    descriptionEn: 'Get 15% instant cashback (up to ৳100) when scanning GenCash merchant counter QR codes across 5,000+ partner outlets.',
    category: 'Payment',
    filterType: 'cashback',
    gradient: ['#EC4899', '#BE185D'],
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&auto=format&fit=crop&q=80',
    merchant: 'Merchant QR Pay',
    screen: 'MerchantPayment',
    screenParams: { mode: 'merchant' },
    btnTextBn: 'কিউআর পেমেন্ট করুন',
    btnTextEn: 'Make Payment',
  },
  {
    id: 'off_qr_2',
    title: 'সুপারশপ ও রেস্টুরেন্টে সর্বোচ্চ ২০০ টাকা ক্যাশব্যাক',
    titleEn: 'Up to ৳200 Cashback on Dining & Grocery',
    subtitle: 'মাসের সেরা কিউআর অফার ক্যাম্পেইন',
    subtitleEn: 'Top retail supermarkets & cafes',
    discount: '৳২০০ ক্যাশব্যাক',
    discountEn: '৳200 CASHBACK',
    badge: 'SUPER DEALS',
    code: 'SUPER200',
    validity: '২৫ নভেম্বর পর্যন্ত',
    validityEn: 'Valid till 25 Nov',
    description: 'মীনাবাজার, ইউনিমার্ট ও কেএফসি কাউন্টারে ন্যূনতম ৫০০ টাকার কিউআর পেমেন্টে ২০% হারে সর্বোচ্চ ২০০ টাকা নিশ্চিত ক্যাশব্যাক।',
    descriptionEn: 'Pay ৳500 or more via QR scan at Meena Bazar, Unimart or KFC outlets and get 20% cashback up to ৳200.',
    category: 'Payment',
    filterType: 'cashback',
    gradient: ['#8B5CF6', '#6D28D9'],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    merchant: 'Shwapno, Meena Bazar, KFC',
    screen: 'MerchantPayment',
    screenParams: { mode: 'merchant' },
    btnTextBn: 'পেমেন্ট করুন',
    btnTextEn: 'Pay with QR',
  },
  {
    id: 'off_bp_1',
    title: 'বিদ্যুৎ ও গ্যাস বিল পেমেন্টে ৩০ টাকা বোনাস',
    titleEn: '৳30 Cashback on Utility Bill Pay',
    subtitle: 'ডেসকো, ডিপিডিসি ও পল্লী বিদ্যুৎ বিলে',
    subtitleEn: 'Pay DESCO, DPDC, Polli Bidyut with 0% fee',
    discount: '৳৩০ ক্যাশব্যাক',
    discountEn: '৳30 CASHBACK',
    badge: 'BILL PAY',
    code: 'BILLPAY30',
    validity: 'প্রতি মাসের ৫ তারিখ পর্যন্ত',
    validityEn: 'Valid till 5th of Month',
    description: 'ঘরে বসেই যেকোনো বিদ্যুৎ, পানি বা গ্যাস বিল পরিশোধ করুন সম্পূর্ণ ফ্রিতে এবং পেয়ে যান ৩০ টাকা নিশ্চিত ক্যাশব্যাক।',
    descriptionEn: 'Pay electricity, water or gas utility bills conveniently from home with 0% service charge and receive flat ৳30 cashback.',
    category: 'BillPay',
    filterType: 'bonus',
    gradient: ['#14B8A6', '#0F766E'],
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=80',
    merchant: 'Utility Bill Pay',
    screen: 'MerchantPayment',
    screenParams: { mode: 'bill_pay', phone: '01700200001', amount: '500' },
    btnTextBn: 'বিল পে করুন',
    btnTextEn: 'Pay Bill Now',
  },
  {
    id: 'off_co_1',
    title: 'প্রিয় এজেন্ট নম্বরে ক্যাশ আউটে বিশেষ ছাড়',
    titleEn: 'Low Cash Out Fee at Priyo Agent',
    subtitle: 'হাজারে মাত্র ১৪.৯০ টাকা ক্যাশ আউট রেট',
    subtitleEn: 'Lowest 1.49% agent withdrawal charge',
    discount: '১৪.৯০ রেট',
    discountEn: '৳14.90 / ৳1,000',
    badge: 'CASH OUT',
    code: 'PRIYOAGENT',
    validity: '৩১ ডিসেম্বর পর্যন্ত',
    validityEn: 'Valid till 31 Dec',
    description: 'আপনার নিকটস্থ ১টি প্রিয় এজেন্ট নম্বর সেট করুন এবং নিয়মিত ১.৮৫% চার্জের পরিবর্তে মাত্র ১.৪৯% (হাজারে ১৪.৯০ টাকা) রেটে ক্যাশ আউট করুন।',
    descriptionEn: 'Set your neighborhood favorite agent and enjoy the lowest 1.49% cash out fee (৳14.90 per ৳1,000) instead of regular 1.85%.',
    category: 'CashOut',
    filterType: 'free',
    gradient: ['#E11D48', '#9F1239'],
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=80',
    merchant: 'Authorized Agent Points',
    screen: 'CashOut',
    btnTextBn: 'ক্যাশ আউট করুন',
    btnTextEn: 'Cash Out Now',
  },
];

const COMBOS = [
  {
    id: 'combo_rc_1',
    title: '১০৭ টাকা রিচার্জে ২জিবি + ২০ টাকা ক্যাশব্যাক',
    titleEn: '৳107 Recharge: 2GB + ৳20 Cashback',
    badgeText: 'HOT DEAL',
    savings: 'সেভ ৳৩৫',
    savingsEn: 'Save ৳35',
    code: 'MEGA107',
    validity: '৭ দিন মেয়াদি স্পেশাল প্যাক',
    description: '১০৭ টাকা রিচার্জ করলেই পেয়ে যাচ্ছেন ২ জিবি ৭ দিন মেয়াদি ইন্টারনেট এবং সাথে সাথে ২০ টাকা ক্যাশব্যাক বোনাস।',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500&auto=format&fit=crop&q=80',
    gradient: ['#043227', '#064E3B'],
    screen: 'MobileRecharge',
  },
  {
    id: 'combo_am_2',
    title: 'কার্ড টু ওয়ালেটে ৫,০০০ টাকায় ১০০ টাকা বোনাস',
    titleEn: 'Add ৳5,000 from Card & Get ৳100',
    badgeText: 'DOUBLE BONUS',
    savings: 'বোনাস ৳১০০',
    savingsEn: 'Bonus ৳100',
    code: 'CARD100',
    validity: 'মাসে একবার প্রযোজ্য',
    description: 'ভিসা বা মাস্টারকার্ড থেকে ওয়ালেটে ৫,০০০ টাকা অ্যাড মানি করলেই পেয়ে যাবেন ১০০ টাকা নিশ্চিত রিওয়ার্ড বোনাস।',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    gradient: ['#0C4A6E', '#0284C7'],
    screen: 'AddMoney',
  },
];

const MFS_PARTNERS = [
  { id: 'p1', name: 'Grameenphone', logoKey: 'GP', icon: 'cellular-outline', color: '#0078FF', bg: '#EFF6FF', category: 'Recharge' },
  { id: 'p2', name: 'Robi', logoKey: 'ROBI', icon: 'phone-portrait-outline', color: '#DC2626', bg: '#FEF2F2', category: 'Recharge' },
  { id: 'p2b', name: 'Airtel', logoKey: 'AIRTEL', icon: 'phone-portrait-outline', color: '#ED1B24', bg: '#FEF2F2', category: 'Recharge' },
  { id: 'p3', name: 'Banglalink', logoKey: 'BL', icon: 'flash-outline', color: '#EA580C', bg: '#FFF7ED', category: 'Recharge' },
  { id: 'p3b', name: 'Teletalk', logoKey: 'TT', icon: 'leaf-outline', color: '#009944', bg: '#ECFDF5', category: 'Recharge' },
  { id: 'p4', name: 'City Bank', icon: 'business-outline', color: '#059669', bg: '#ECFDF5', category: 'AddMoney' },
  { id: 'p5', name: 'BRAC Bank', icon: 'card-outline', color: '#2563EB', bg: '#EFF6FF', category: 'AddMoney' },
  { id: 'p6', name: 'DESCO / DPDC', icon: 'bulb-outline', color: '#D97706', bg: '#FEF3C7', category: 'BillPay' },
];

export const OffersSection = ({ navigation, onOpenQR, hideTopBanner = false }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilterType, setActiveFilterType] = useState('all'); // 'all', 'cashback', 'bonus', 'free'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const { t, isBangla } = useLanguage();

  const handleClaim = (offer) => {
    setSelectedOffer(offer);
  };

  const handleCopyCode = (code) => {
    const targetCode = code || selectedOffer?.code;
    if (!targetCode) return;
    setCopiedCode(targetCode);
    Alert.alert(
      isBangla ? 'কুপন কোড কপি হয়েছে!' : 'Promo Code Copied!',
      isBangla
        ? `কুপন কোড "${targetCode}" কপি করা হয়েছে। লেনদেনের সময় স্বয়ংক্রিয় ছাড় পাবেন।`
        : `Voucher code "${targetCode}" copied to clipboard.`
    );
    setTimeout(() => {
      setCopiedCode(null);
    }, 3200);
  };

  const handleUseOffer = () => {
    const targetScreen = selectedOffer?.screen || 'MobileRecharge';
    const params = selectedOffer?.screenParams || {};
    setSelectedOffer(null);
    setShowAllModal(false);
    if (navigation?.navigate) {
      navigation.navigate(targetScreen, params);
    }
  };

  // Filtered offers for All-Offers Modal
  const modalFilteredOffers = useMemo(() => {
    return SPECIAL_OFFERS.filter((offer) => {
      const matchesCategory =
        activeCategory === 'all' || offer.category === activeCategory;
      const matchesType =
        activeFilterType === 'all' || offer.filterType === activeFilterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        offer.title.toLowerCase().includes(q) ||
        (offer.titleEn && offer.titleEn.toLowerCase().includes(q)) ||
        offer.subtitle.toLowerCase().includes(q) ||
        (offer.subtitleEn && offer.subtitleEn.toLowerCase().includes(q)) ||
        offer.merchant.toLowerCase().includes(q) ||
        offer.code.toLowerCase().includes(q) ||
        offer.category.toLowerCase().includes(q);
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [activeCategory, activeFilterType, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: SPECIAL_OFFERS.length };
    OFFER_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = SPECIAL_OFFERS.filter((o) => o.category === cat.id).length;
      }
    });
    return counts;
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. MFS Rewards & Perks Top Banner */}
      {!hideTopBanner && (
        <View style={styles.rewardBannerContainer}>
          <LinearGradient
            colors={['#043227', '#064E3B', '#0B5945']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rewardBanner}
          >
            <View style={styles.rewardTextWrap}>
              <View style={styles.rewardPill}>
                <Ionicons name="gift" size={11} color="#00D09C" />
                <Text style={styles.rewardPillText}>
                  {isBangla ? 'ক্যাশব্যাক ও রিওয়ার্ড' : 'MFS CASHBACK & DEALS'}
                </Text>
              </View>
              <Text style={styles.rewardTitle}>
                {isBangla ? 'রিচার্জ ও অ্যাড মানিতে ক্যাশব্যাক' : 'Recharge & Add Money Bonuses'}
              </Text>
              <Text style={styles.rewardSub}>
                {isBangla
                  ? '১০০ টাকা রিচার্জে ২০ টাকা বোনাস ও ফ্রি সেন্ড মানি অফার সক্রিয়'
                  : 'Get ৳20 recharge bonus, zero fee send money & deposit cashback'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.rewardQrBtn}
              onPress={onOpenQR}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code" size={24} color="#00D09C" />
              <Text style={styles.rewardQrBtnText}>{isBangla ? 'কিউআর' : 'Scan'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* 2. Nagad-Style Auto-Scrolling Promotions Carousel */}
      <OfferCarousel
        navigation={navigation}
        onOpenAllOffers={() => setShowAllModal(true)}
      />

      {/* 4. Partner Institutions & Telecom Operators */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {isBangla ? 'পার্টনার ব্যাংক ও টেলিকম' : 'Partner Banks & Telecoms'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsScroll}
      >
        {MFS_PARTNERS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.brandCard}
            activeOpacity={0.7}
            onPress={() => {
              setActiveCategory(p.category);
              setShowAllModal(true);
            }}
          >
            <View style={[styles.brandIconWrap, { backgroundColor: p.bg }]}>
              {p.logoKey && OPERATOR_LOGOS[p.logoKey] ? (
                <Image
                  source={OPERATOR_LOGOS[p.logoKey]}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name={p.icon} size={18} color={p.color} />
              )}
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Complete "All MFS Offers" Explorer Modal */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.allOffersModalContainer}>
          {/* Modal Top Header with Rich Emerald Banking Gradient */}
          <LinearGradient
            colors={['#02261E', '#064E3B', '#096950']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.allOffersHeader}
          >
            {/* Top Navigation Row */}
            <View style={styles.allOffersTopNav}>
              <TouchableOpacity
                onPress={() => setShowAllModal(false)}
                style={styles.allOffersCloseBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.allOffersTitleContainer}>
                <Text style={styles.allOffersHeaderTitle}>
                  {isBangla ? 'স্মার্ট প্রমোশন ও অফার' : 'Smart Promotions & Offers'}
                </Text>
                <View style={styles.allOffersSubBadge}>
                  <Ionicons name="sparkles" size={10} color="#00D09C" />
                  <Text style={styles.allOffersSubBadgeText}>
                    {isBangla ? 'AI কিউরেটেড ক্যাম্পেইন' : 'AI Curated Campaigns'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setActiveFilterType('all');
                }}
                style={styles.allOffersResetBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#A7F3D0" />
              </TouchableOpacity>
            </View>

            {/* In-Modal Search Bar */}
            <View style={styles.allOffersSearchBar}>
              <Ionicons name="search" size={18} color="#00D09C" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.allOffersSearchInput}
                placeholder={
                  isBangla
                    ? 'অফার, কুপন বা ক্যাটাগরি সার্চ করুন...'
                    : 'Search offer, code or merchant...'
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
                const count = categoryCounts[cat.id] || 0;
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
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.allOffersCatText,
                        isActive && styles.allOffersCatTextActive,
                      ]}
                    >
                      {isBangla ? cat.labelBn : cat.labelEn}
                    </Text>
                    <View style={[styles.catCountBadge, isActive && styles.catCountBadgeActive]}>
                      <Text style={[styles.catCountText, isActive && styles.catCountTextActive]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>

          {/* Quick Filter Segmented Bar */}
          <View style={styles.quickFilterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilterScroll}>
              {[
                { id: 'all', labelBn: 'সব অফার', labelEn: 'All Offers', icon: 'grid-outline' },
                { id: 'cashback', labelBn: 'ক্যাশব্যাক', labelEn: 'Cashback', icon: 'cash-outline' },
                { id: 'bonus', labelBn: 'বোনাস রিওয়ার্ড', labelEn: 'Bonus', icon: 'gift-outline' },
                { id: 'free', labelBn: '০% ফি অফার', labelEn: 'Zero Fee', icon: 'flash-outline' },
              ].map((filt) => {
                const isFiltActive = activeFilterType === filt.id;
                return (
                  <TouchableOpacity
                    key={filt.id}
                    style={[styles.quickFiltChip, isFiltActive && styles.quickFiltChipActive]}
                    onPress={() => setActiveFilterType(filt.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={filt.icon}
                      size={13}
                      color={isFiltActive ? '#FFFFFF' : '#47665C'}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.quickFiltText, isFiltActive && styles.quickFiltTextActive]}>
                      {isBangla ? filt.labelBn : filt.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Copy Code Floating Notification Toast */}
          {copiedCode && (
            <View style={styles.copyToastBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#00D09C" />
              <Text style={styles.copyToastText}>
                {isBangla
                  ? `কুপন কোড "${copiedCode}" কপি হয়েছে!`
                  : `Voucher code "${copiedCode}" copied!`}
              </Text>
            </View>
          )}

          {/* Offers List */}
          <ScrollView
            contentContainerStyle={styles.allOffersListScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.allOffersCountRow}>
              <Text style={styles.allOffersCountText}>
                {modalFilteredOffers.length}{' '}
                {isBangla ? 'টি অফার ও বোনাস সক্রিয়' : 'active campaign offers'}
              </Text>
              {(activeCategory !== 'all' || activeFilterType !== 'all' || searchQuery.length > 0) && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveCategory('all');
                    setActiveFilterType('all');
                    setSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearFilterText}>
                    {isBangla ? 'ফিল্টার রিসেট' : 'Reset Filters'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {modalFilteredOffers.length === 0 ? (
              <View style={styles.emptyOffersBox}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="gift-outline" size={36} color="#00D09C" />
                </View>
                <Text style={styles.emptyOffersTitle}>
                  {isBangla ? 'কোনো অফার পাওয়া যায়নি' : 'No matching offers found'}
                </Text>
                <Text style={styles.emptyOffersSub}>
                  {isBangla
                    ? 'অন্য কোনো ক্যাটাগরি বেছে নিন অথবা ভিন্ন শব্দ দিয়ে সার্চ করুন।'
                    : 'Try selecting a different category or search keyword.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setActiveCategory('all');
                    setActiveFilterType('all');
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyResetBtnText}>
                    {isBangla ? 'সব অফার দেখুন' : 'View All Offers'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              modalFilteredOffers.map((offer) => (
                <View key={offer.id} style={styles.modalOfferCard}>
                  {/* Top Image Banner with Gradient Overlay */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleClaim(offer)}
                    style={styles.cardImageContainer}
                  >
                    <Image source={{ uri: offer.image }} style={styles.modalOfferCardImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.15)', 'rgba(4, 50, 39, 0.85)']}
                      style={styles.cardImageOverlay}
                    />
                    
                    {/* Top Badges */}
                    <View style={styles.cardTopBadgeRow}>
                      <View style={styles.modalOfferTag}>
                        <Text style={styles.modalOfferTagText}>{offer.badge}</Text>
                      </View>
                      
                      <LinearGradient
                        colors={offer.gradient || ['#00D09C', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.modalDiscountPill}
                      >
                        <Ionicons name="sparkles" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.modalDiscountPillText}>
                          {isBangla ? offer.discount : offer.discountEn}
                        </Text>
                      </LinearGradient>
                    </View>

                    {/* Merchant Tag at bottom of banner */}
                    <View style={styles.cardMerchantPill}>
                      <Ionicons name="shield-checkmark" size={12} color="#00D09C" />
                      <Text style={styles.cardMerchantText} numberOfLines={1}>{offer.merchant}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Card Content */}
                  <View style={styles.modalOfferCardContent}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleClaim(offer)}>
                      <Text style={styles.modalOfferCardTitle} numberOfLines={1}>
                        {isBangla ? offer.title : offer.titleEn}
                      </Text>
                      <Text style={styles.modalOfferCardSub} numberOfLines={2}>
                        {isBangla ? offer.subtitle : offer.subtitleEn}
                      </Text>
                    </TouchableOpacity>

                    {/* Ticket Dotted Divider with Punch Notches */}
                    <View style={styles.ticketDividerContainer}>
                      <View style={styles.notchLeft} />
                      <View style={styles.dashedLine} />
                      <View style={styles.notchRight} />
                    </View>

                    {/* Footer with Code Box & Claim CTA */}
                    <View style={styles.modalOfferCardFooter}>
                      <TouchableOpacity
                        style={styles.codeSnippetBox}
                        onPress={() => handleCopyCode(offer.code)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="pricetag-outline" size={12} color="#064E3B" style={{ marginRight: 4 }} />
                        <Text style={styles.codeSnippetText}>{offer.code}</Text>
                        <Ionicons name="copy-outline" size={11} color="#00D09C" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>

                      <View style={styles.validityBox}>
                        <Ionicons name="time-outline" size={11} color="#7B968D" />
                        <Text style={styles.modalOfferValidity}>
                          {isBangla ? offer.validity : offer.validityEn}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.modalClaimActionBtn}
                        onPress={() => handleClaim(offer)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#043227', '#064E3B']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.claimBtnGradient}
                        >
                          <Text style={styles.modalClaimActionText}>
                            {isBangla ? offer.btnTextBn || 'অফার নিন' : offer.btnTextEn || 'Claim'}
                          </Text>
                          <Ionicons name="arrow-forward" size={12} color="#00D09C" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* 6. Voucher / Offer Detail Bottom Sheet Modal */}
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
                    <Ionicons name="shield-checkmark" size={15} color="#00D09C" />
                    <Text style={styles.detailMerchantText}>{selectedOffer.merchant || 'GenCash Official Campaign'}</Text>
                  </View>
                  <Text style={styles.modalTitle}>
                    {isBangla ? selectedOffer.title : (selectedOffer.titleEn || selectedOffer.title)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOffer(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalImageWrap}>
                <Image source={{ uri: selectedOffer.image }} style={styles.modalImage} resizeMode="cover" />
                {(selectedOffer.discount || selectedOffer.discountEn) && (
                  <View style={styles.modalImageDiscountBadge}>
                    <Text style={styles.modalImageDiscountText}>
                      {isBangla ? selectedOffer.discount : (selectedOffer.discountEn || selectedOffer.discount)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.modalDesc}>
                {isBangla ? selectedOffer.description : (selectedOffer.descriptionEn || selectedOffer.description)}
              </Text>

              {/* Promo Code Box */}
              <View style={styles.codeBox}>
                <View>
                  <Text style={styles.codeLabel}>PROMO CODE / অফার কোড</Text>
                  <Text style={styles.codeValue}>{selectedOffer.code}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleCopyCode(selectedOffer.code)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copiedCode === selectedOffer.code ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color="#064E3B"
                  />
                  <Text style={styles.copyBtnText}>
                    {copiedCode === selectedOffer.code ? (isBangla ? 'কপি হয়েছে' : 'Copied') : (isBangla ? 'কপি করুন' : 'Copy')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step instructions */}
              <View style={styles.stepsBox}>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                  <Text style={styles.stepText}>
                    {isBangla ? 'নিচের বাটনে ট্যাপ করে সংশ্লিষ্ট স্ক্রিনে যান' : 'Tap below to navigate to the service screen'}
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                  <Text style={styles.stepText}>
                    {isBangla ? 'কুপন কোড দিয়ে লেনদেন নিশ্চিত করুন' : 'Apply voucher code and confirm transaction'}
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                  <Text style={styles.stepText}>
                    {isBangla ? 'তাৎক্ষণিক ক্যাশব্যাক বা বোনাস আপনার ওয়ালেটে জমা হবে' : 'Cashback or bonus will be instantly credited to your wallet'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.modalActionBtn} onPress={handleUseOffer} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#043227', '#064E3B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalActionGradient}
                >
                  <Text style={styles.modalActionBtnText}>
                    {isBangla
                      ? (selectedOffer.btnTextBn || 'অফারটি এখনই ব্যবহার করুন')
                      : (selectedOffer.btnTextEn || 'Use Offer Now')}
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
    shadowColor: '#043227',
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
    backgroundColor: 'rgba(0, 208, 156, 0.2)',
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
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    width: 155,
    height: 222,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 208, 156, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 180,
    height: 222,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFECE6',
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
    backgroundColor: '#0F4D3C',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(4, 50, 39, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offerContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  offerTitle: {
    color: '#0B251E',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 17,
  },
  offerSub: {
    color: '#64748B',
    fontSize: 10.5,
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
    backgroundColor: '#0F4D3C',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
    gap: 2,
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
    fontSize: 12,
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
    fontSize: 9,
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
    borderColor: '#E2ECE7',
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
    backgroundColor: '#F4F7F6',
  },
  allOffersHeader: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#02261E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  allOffersTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  allOffersCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allOffersTitleContainer: {
    alignItems: 'center',
  },
  allOffersHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  allOffersSubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 156, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
    gap: 4,
  },
  allOffersSubBadgeText: {
    color: '#A7F3D0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  allOffersResetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allOffersSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 156, 0.35)',
    marginBottom: 14,
  },
  allOffersSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  allOffersCategoryScroll: {
    gap: 8,
    paddingRight: 10,
  },
  allOffersCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  allOffersCatChipActive: {
    backgroundColor: '#00D09C',
    borderColor: '#00D09C',
    elevation: 4,
    shadowColor: '#00D09C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  allOffersCatText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  allOffersCatTextActive: {
    color: '#043227',
    fontWeight: '900',
  },
  catCountBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  catCountBadgeActive: {
    backgroundColor: '#043227',
  },
  catCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  catCountTextActive: {
    color: '#00D09C',
  },

  // Quick Filter Segmented Bar
  quickFilterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECE7',
    paddingVertical: 9,
  },
  quickFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFiltChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0F5F3',
    borderWidth: 1,
    borderColor: '#D7E5DF',
  },
  quickFiltChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  quickFiltText: {
    color: '#47665C',
    fontSize: 11,
    fontWeight: '700',
  },
  quickFiltTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Toast Notification
  copyToastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#02261E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  copyToastText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },

  // Offers List & Cards
  allOffersListScroll: {
    padding: 16,
    paddingBottom: 50,
    gap: 14,
  },
  allOffersCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  allOffersCountText: {
    color: '#47665C',
    fontSize: 12.5,
    fontWeight: '700',
  },
  clearFilterText: {
    color: '#00D09C',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyOffersBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2ECE7',
    marginTop: 30,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E6F8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyOffersTitle: {
    color: '#072E25',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyOffersSub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  emptyResetBtn: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Luxury Ticket Voucher Card
  modalOfferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#DFECE6',
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#043227',
  },
  modalOfferCardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTopBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOfferTag: {
    backgroundColor: 'rgba(4, 50, 39, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalOfferTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalDiscountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalDiscountPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  cardMerchantPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 38, 30, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    gap: 5,
  },
  cardMerchantText: {
    color: '#E2ECE7',
    fontSize: 10.5,
    fontWeight: '700',
  },
  modalOfferCardContent: {
    padding: 14,
    paddingTop: 12,
  },
  modalOfferCardTitle: {
    color: '#072E25',
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 3,
  },
  modalOfferCardSub: {
    color: '#527267',
    fontSize: 11.5,
    lineHeight: 16,
  },
  ticketDividerContainer: {
    position: 'relative',
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#D7E5DF',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  notchLeft: {
    position: 'absolute',
    left: -22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F4F7F6',
    borderWidth: 1,
    borderColor: '#DFECE6',
  },
  notchRight: {
    position: 'absolute',
    right: -22,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F4F7F6',
    borderWidth: 1,
    borderColor: '#DFECE6',
  },
  modalOfferCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeSnippetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF8F4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BDE4D5',
  },
  codeSnippetText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  validityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  modalOfferValidity: {
    color: '#7B968D',
    fontSize: 10,
    fontWeight: '700',
  },
  modalClaimActionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  modalClaimActionText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Detail Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
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
    gap: 5,
    marginBottom: 4,
  },
  detailMerchantText: {
    color: '#064E3B',
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalTitle: {
    color: '#072E25',
    fontSize: 16.5,
    fontWeight: '800',
    lineHeight: 22,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  modalImageWrap: {
    width: '100%',
    height: 140,
    borderRadius: 18,
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
    bottom: 10,
    right: 10,
    backgroundColor: '#043227',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modalImageDiscountText: {
    color: '#00D09C',
    fontSize: 11.5,
    fontWeight: '900',
  },
  modalDesc: {
    color: '#47665C',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#00D09C',
    marginBottom: 14,
  },
  codeLabel: {
    color: '#7B968D',
    fontSize: 9.5,
    fontWeight: '800',
  },
  codeValue: {
    color: '#043227',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#00D09C',
    shadowColor: '#00D09C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  copyBtnText: {
    color: '#043227',
    fontSize: 11.5,
    fontWeight: '800',
  },
  stepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2ECE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#064E3B',
  },
  stepText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  modalActionBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#043227',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default OffersSection;
