import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import api, { api as namedApi } from '../services/api';
const apiService = api || namedApi;


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const BANNERS = [
  {
    id: 'off_merchant_discount',
    category: 'MERCHANT_PAY',
    badgeText: 'ডাইনিং ও ফ্যাশন',
    badgeTextEn: 'Dining & Retail',
    badgeBg: '#DC2626',
    headline: 'মার্চেন্ট পেমেন্টে ১৫% ছাড়',
    headlineEn: '15% Off on Merchant QR Pay',
    highlight: '১৫% পর্যন্ত ছাড়',
    highlightEn: 'Up to 15% Off',
    sub: 'স্বপ্ন, আড়ং ও বাটায় কিউআর স্ক্যান করলেই',
    subEn: 'At 5,000+ retail outlets nationwide',
    btnText: 'পেমেন্ট করুন',
    btnTextEn: 'Pay Now',
    targetScreen: 'MerchantPayment',
    targetParams: { mode: 'merchant' },
    gradient: ['#831843', '#9D174D', '#BE185D'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: true,
    aiReasonBn: 'আপনার শপিং ও ডাইনিং খরচের উপর সর্বোচ্চ ১৫% পর্যন্ত ছাড় নিশ্চিত করতে এটি সাজেস্ট করা হয়েছে।',
    aiReasonEn: 'Selected because your retail and food transactions match our 5,000+ partner merchant outlets.',
    conversionProb: 98,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_gp_recharge',
    category: 'RECHARGE',
    badgeText: 'গ্রামীণফোন স্পেশাল',
    badgeTextEn: 'GP Special',
    badgeBg: '#0284C7',
    headline: '৳৭৯৯ রিচার্জে ৳৭৯ ক্যাশব্যাক',
    headlineEn: '৳79 Cashback on ৳799 Recharge',
    highlight: '৳৭৯ ক্যাশব্যাক',
    highlightEn: '৳79 Cashback',
    sub: 'যেকোনো প্রিপেইড নাম্বারে তাৎক্ষণিক বোনাস',
    subEn: 'Instant cashback to your wallet',
    btnText: 'রিচার্জ করুন',
    btnTextEn: 'Recharge Now',
    targetScreen: 'MobileRecharge',
    gradient: ['#073E31', '#0B5443', '#0F6B55'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'বিগত ৩০ দিনে আপনার ৮টি মোবাইল রিচার্জ এবং নিয়মিত ব্যবহারের ওপর ভিত্তি করে এই অফারটি নির্বাচিত।',
    aiReasonEn: 'Selected because you completed 8 mobile recharges this month and your typical cycle is due soon.',
    conversionProb: 96,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_card_add_money',
    category: 'ADD_MONEY',
    badgeText: 'ব্যাংক ও কার্ড পার্টনারশিপ',
    badgeTextEn: 'Bank & Card Offer',
    badgeBg: '#D97706',
    headline: 'অ্যাড মানি করলেই ৳১০০ ক্যাশব্যাক',
    headlineEn: '৳100 Cashback on Add Money',
    highlight: '৳১০০ ক্যাশব্যাক',
    highlightEn: '৳100 Cashback',
    sub: 'ভিসা ও মাস্টারকার্ড থেকে ৳৫,০০০ যোগে',
    subEn: 'On ৳5,000 deposit via Visa/Mastercard',
    btnText: 'টাকা যোগ করুন',
    btnTextEn: 'Add Money',
    targetScreen: 'AddMoney',
    gradient: ['#1E3A8A', '#1E40AF', '#2563EB'],
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'কার্ড বা ব্যাংক থেকে ওয়ালেটে টাকা যোগে ১০০% ফ্রি চার্জ ও বোনাস পাওয়ার জন্য এটি আপনার জন্য সেরা।',
    aiReasonEn: 'Recommended because adding money via Bank/Card gives you flat instant cashback with zero transaction fee.',
    conversionProb: 94,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_robi_combo',
    category: 'RECHARGE',
    badgeText: 'রবি স্পেশাল',
    badgeTextEn: 'Robi Special',
    badgeBg: '#DC2626',
    headline: 'রবি ৪৪৯ টাকার কম্বো রিচার্জে ৳৫০ ক্যাশব্যাক',
    headlineEn: '৳50 Cashback on Robi ৳449 Combo',
    highlight: '৳৫০ ক্যাশব্যাক',
    highlightEn: '৳50 Cashback',
    sub: 'যেকোনো রবি নাম্বারে তাৎক্ষণিক ক্যাশব্যাক',
    subEn: 'Instant cashback to your wallet',
    btnText: 'রিচার্জ করুন',
    btnTextEn: 'Recharge Now',
    targetScreen: 'MobileRecharge',
    gradient: ['#991B1B', '#B91C1C', '#DC2626'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'বিগত ৩০ দিনে আপনার রবি সিমে নিয়মিত রিচার্জ ও ব্যবহারের ওপর ভিত্তি করে নির্বাচিত।',
    aiReasonEn: 'Selected based on your recent Robi recharge pattern.',
    conversionProb: 85,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_bl_combo',
    category: 'RECHARGE',
    badgeText: 'বাংলালিংক স্পেশাল',
    badgeTextEn: 'Banglalink Special',
    badgeBg: '#EA580C',
    headline: 'বাংলালিংক ৩৯৯ টাকার ডাটা প্যাকে ৳৪৫ ক্যাশব্যাক',
    headlineEn: '৳45 Cashback on Banglalink ৳399 Pack',
    highlight: '৳৪৫ ক্যাশব্যাক',
    highlightEn: '৳45 Cashback',
    sub: 'বাংলালিংক সিমে দ্রুততম ইন্টারনেট ডাটা প্যাক',
    subEn: 'Fastest 4G internet package',
    btnText: 'রিচার্জ করুন',
    btnTextEn: 'Recharge Now',
    targetScreen: 'MobileRecharge',
    gradient: ['#C2410C', '#EA580C', '#F97316'],
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'বিগত ৩০ দিনে আপনার Banglalink সিমে সফল রিচার্জ ও ব্যবহারের ওপর ভিত্তি করে নির্বাচিত।',
    aiReasonEn: 'Selected based on your recent Banglalink recharge pattern.',
    conversionProb: 85,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_unimart_grocery',
    category: 'MERCHANT_PAY',
    badgeText: 'সুপারস্টোর গ্রোসারি',
    badgeTextEn: 'Superstore Grocery',
    badgeBg: '#15803D',
    headline: 'ইউনিমার্ট মেগাস্টোরে ৳১৫০ ক্যাশব্যাক',
    headlineEn: '৳150 Cashback at Unimart Mega Store',
    highlight: '৳১৫০ ক্যাশব্যাক',
    highlightEn: '৳150 Cashback',
    sub: '২,০০০ টাকার কেনাকাটায় কিউআর স্ক্যানে',
    subEn: 'On min spend of ৳2,000 at Unimart',
    btnText: 'পেমেন্ট করুন',
    btnTextEn: 'Pay Now',
    targetScreen: 'MerchantPayment',
    targetParams: { mode: 'merchant' },
    gradient: ['#166534', '#15803D', '#22C55E'],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'বিগত ৩০ দিনে আপনার ইউনিমার্ট মেগাস্টোরে নিয়মিত কেনাকাটার ওপর ভিত্তি করে নির্বাচিত।',
    aiReasonEn: 'Selected because of your regular purchases at Unimart Mega Store.',
    conversionProb: 85,
    upliftSegment: 'PERSUADABLE',
  },
  {
    id: 'off_desco_bill_pay',
    category: 'BILL_PAY',
    badgeText: 'ইউটিলিটি বিল',
    badgeTextEn: 'Utility Bills',
    badgeBg: '#059669',
    headline: 'বিদ্যুৎ বিলে ৳৩০ ক্যাশব্যাক',
    headlineEn: '৳30 Cashback on Electricity',
    highlight: '৳৩০ ক্যাশব্যাক',
    highlightEn: '৳30 Cashback',
    sub: 'ডেসকো, ডিপিডিসি ও নেসকো বিলে ০% ফি',
    subEn: 'Zero processing fee 24/7',
    btnText: 'বিল পে করুন',
    btnTextEn: 'Pay Bill',
    targetScreen: 'MerchantPayment',
    targetParams: { mode: 'bill_pay', phone: '01700200001' },
    gradient: ['#064E3B', '#065F46', '#047857'],
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
    isAiRecommended: false,
    aiReasonBn: 'বিদ্যুৎ ও গ্যাস বিল পরিশোধে ০% সার্ভিস ফি এবং ক্যাশব্যাক সুবিধার জন্য এটি নির্বাচিত।',
    aiReasonEn: 'Recommended because utility bills pay perks give you flat ৳30 cashback with zero late fee.',
    conversionProb: 80,
    upliftSegment: 'PERSUADABLE',
  },
];

export default function OfferCarousel({ navigation, onOpenAllOffers }) {
  const { isBangla } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [bannerList, setBannerList] = useState(BANNERS);
  const [selectedAiOffer, setSelectedAiOffer] = useState(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [fatigueShield, setFatigueShield] = useState(null);
  const flatListRef = useRef(null);
  const isInteracting = useRef(false);

  // Fetch ML Next-Best-Offer from backend and rank the carousel
  useEffect(() => {
    let isMounted = true;
    async function loadAIOffers() {
      try {
        if (!apiService?.getNextBestOffers) return;
        const res = await apiService.getNextBestOffers();
        if (isMounted && res && res.top_recommended_offer) {
          const topOffer = res.top_recommended_offer;
          const updated = BANNERS.map((banner) => {
            const isMatch =
              banner.id === topOffer.offer_id ||
              banner.category === topOffer.category ||
              (banner.category === 'MERCHANT_PAY' && (topOffer.category === 'MERCHANT_PAY' || topOffer.category === 'PAYMENT')) ||
              (banner.category === 'BILL_PAY' && (topOffer.category === 'BILL_PAY' || topOffer.category === 'UTILITY'));

            if (isMatch) {
              return {
                ...banner,
                isAiRecommended: true,
                aiReasonBn: topOffer.reason_bn || banner.aiReasonBn,
                aiReasonEn: topOffer.reason_en || banner.aiReasonEn,
                conversionProb: Math.round((topOffer.conversion_probability || 0.88) * 100),
                upliftSegment: topOffer.uplift_segment || 'PERSUADABLE',
              };
            }
            return {
              ...banner,
              isAiRecommended: false,
            };
          });

          // Ensure at least one is marked AI recommended
          if (!updated.some(b => b.isAiRecommended)) {
            updated[0].isAiRecommended = true;
          }

          // Sort so the AI recommended offer is ranked first at index 0
          updated.sort((a, b) => (b.isAiRecommended ? 1 : 0) - (a.isAiRecommended ? 1 : 0));
          setBannerList(updated);
          if (res.fatigue_shield) {
            setFatigueShield(res.fatigue_shield);
          }
        }
      } catch (err) {
        // Fallback to default BANNERS safely
        console.log('NBO load fallback:', err);
      }
    }
    loadAIOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-slide every 4.2 seconds with smooth scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInteracting.current || bannerList.length <= 1) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % bannerList.length;
        flatListRef.current?.scrollToOffset({
          offset: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [bannerList.length]);

  const handleMomentumScrollEnd = (e) => {
    isInteracting.current = false;
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < bannerList.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    isInteracting.current = true;
  };

  const handlePressBanner = (item) => {
    if (navigation && item.targetScreen) {
      navigation.navigate(item.targetScreen, item.targetParams || {});
    }
  };

  const openExplainableModal = (item) => {
    setSelectedAiOffer(item);
    setAiModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>
            {isBangla ? 'স্মার্ট প্রমোশন ও অফার' : 'Smart Promotions & Offers'}
          </Text>
        </View>
        {Boolean(onOpenAllOffers) ? (
          <TouchableOpacity
            onPress={onOpenAllOffers}
            activeOpacity={0.7}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>{isBangla ? 'সব দেখুন' : 'See All'}</Text>
            <Ionicons name="chevron-forward" size={13} color="#00D09C" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Horizontal Sliding Banner FlatList */}
      <FlatList
        ref={flatListRef}
        data={bannerList}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.slidePage}>
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.bannerCard,
                Boolean(item.isAiRecommended) ? styles.aiBannerCardHighlight : null,
              ]}
              onPress={() => handlePressBanner(item)}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.85 }}
                style={styles.bannerGradient}
              >
                {/* Left Column: Text & Action Button */}
                <View style={styles.textColumn}>
                  {/* Top Badges Row */}
                  <View style={styles.badgesRow}>
                    <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                      <Text style={styles.badgeText}>
                        {isBangla ? item.badgeText : item.badgeTextEn}
                      </Text>
                    </View>

                    {Boolean(item.isAiRecommended) ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openExplainableModal(item)}
                        style={styles.aiChoiceBadge}
                      >
                        <Ionicons name="sparkles" size={10} color="#003B2E" />
                        <Text style={styles.aiChoiceBadgeText}>
                          {isBangla ? 'AI চয়েস' : 'AI Pick'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <Text style={styles.headlineText} numberOfLines={2}>
                    {isBangla ? item.headline : item.headlineEn}
                  </Text>

                  <Text style={styles.subText} numberOfLines={1}>
                    {isBangla ? item.sub : item.subEn}
                  </Text>

                  <View style={styles.actionButtonsRow}>
                    <View style={styles.actionPill}>
                      <Text style={styles.actionPillText}>
                        {isBangla ? item.btnText : item.btnTextEn}
                      </Text>
                      <Ionicons name="arrow-forward" size={11} color="#0F172A" style={{ marginLeft: 3 }} />
                    </View>

                    {/* Always visible "Why this offer?" button for AI explainability */}
                    <TouchableOpacity
                      style={styles.whyThisBtn}
                      onPress={() => openExplainableModal(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="sparkles" size={12} color="#00D09C" />
                      <Text style={styles.whyThisText}>
                        {isBangla ? 'কেন এই অফার?' : 'Why this offer?'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Right Column: Real Human Model with soft overlay gradient */}
                <View style={styles.imageColumn}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.personImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={[item.gradient[0], 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.55, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modern Nagad-style Dots Indicator */}
      <View style={styles.dotsRow}>
        {bannerList.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <View
              key={item.id || idx}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
                Boolean(item.isAiRecommended && isActive) ? styles.aiActiveDot : null,
              ]}
            />
          );
        })}
      </View>

      {/* Explainable AI Modal */}
      <Modal
        visible={aiModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalSparkleWrap}>
                  <Ionicons name="gift-outline" size={16} color="#00D09C" />
                </View>
                <View>
                  <Text style={styles.modalHeading}>
                    {isBangla ? 'অফার ও ক্যাশব্যাক বিবরণ' : 'Offer & Cashback Details'}
                  </Text>
                  <Text style={styles.modalSubheading}>
                    {isBangla ? 'আপনার অ্যাকাউন্টের জন্য প্রযোজ্য অফার' : 'Exclusive offer for your account'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setAiModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Score & Uplift Segment */}
              <View style={styles.probCard}>
                <View style={styles.probScoreBlock}>
                  <Text style={styles.probValue}>
                    {selectedAiOffer?.conversionProb || 88}%
                  </Text>
                  <Text style={styles.probLabel}>
                    {isBangla ? 'ম্যাচ স্কোর' : 'Match Score'}
                  </Text>
                </View>
                <View style={styles.probDivider} />
                <View style={styles.probSegmentBlock}>
                  <View style={styles.upliftPill}>
                    <Ionicons name="trending-up" size={12} color="#047857" />
                    <Text style={styles.upliftPillText}>
                      {selectedAiOffer?.upliftSegment === 'PERSUADABLE'
                        ? (isBangla ? 'Persuadable গ্রাহক' : 'Persuadable Segment')
                        : (selectedAiOffer?.upliftSegment || 'Persuadable')}
                    </Text>
                  </View>
                  <Text style={styles.upliftDesc}>
                    {isBangla
                      ? 'অযথা স্প্যাম নয়—সঠিক সময় ও ক্যাটাগরির অফার।'
                      : 'Targeted uplift via Recency, Frequency & Balance.'}
                  </Text>
                </View>
              </View>

              {/* Natural Bengali / English Reason */}
              <View style={styles.reasonCard}>
                <View style={styles.reasonHeader}>
                  <Ionicons name="information-circle-outline" size={17} color="#00D09C" />
                  <Text style={styles.reasonTitle}>
                    {isBangla ? 'এই অফারটি বাছাই করার কারণ:' : 'Why this offer was selected:'}
                  </Text>
                </View>
                <Text style={styles.reasonBody}>
                  {isBangla
                    ? (selectedAiOffer?.aiReasonBn ||
                      'আপনার গত ৩০ দিনের লেনদেন বিশ্লেষণ অনুযায়ী আপনি নিয়মিত রিচার্জ সেবা ব্যবহার করেন। এই অফারে রিচার্জ করলে আপনি সর্বোচ্চ ৳৭৯ তাৎক্ষণিক ক্যাশব্যাক সঞ্চয় করতে পারবেন।')
                    : (selectedAiOffer?.aiReasonEn ||
                      'Based on your recharge habits in the last 30 days, this campaign maximizes your cash savings with an instant ৳79 bonus.')}
                </Text>
              </View>

              {/* Explainable Feature Checklist */}
              <View style={styles.factorsList}>
                <Text style={styles.factorsHeading}>
                  {isBangla ? 'মডেলের মূল বিবেচ্য বিষয়সমূহ:' : 'Key Factors Evaluated:'}
                </Text>
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={15} color="#00D09C" />
                  <Text style={styles.factorText}>
                    {isBangla ? 'উচ্চ রিচার্জ ব্যবহার ও রিসেন্সি স্কোর' : 'High recharge frequency & recency score'}
                  </Text>
                </View>
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={15} color="#00D09C" />
                  <Text style={styles.factorText}>
                    {isBangla ? 'অফার গ্রহণের মতো প্রয়োজনীয় ওয়ালেট ব্যালেন্স' : 'Sufficient wallet balance for bundle'}
                  </Text>
                </View>
                <View style={styles.factorItem}>
                  <Ionicons
                    name={fatigueShield?.is_cooloff_active ? "shield-checkmark" : "checkmark-circle"}
                    size={15}
                    color={fatigueShield?.is_cooloff_active ? "#F59E0B" : "#00D09C"}
                  />
                  <Text style={styles.factorText}>
                    {fatigueShield?.is_cooloff_active
                      ? (isBangla
                          ? `ফ্যাটিগ শিল্ড সক্রিয়: ${fatigueShield.status_bn}`
                          : `Fatigue Shield Active: ${fatigueShield.status_en}`)
                      : (isBangla
                          ? `নোটিফিকেশন ফ্যাটিগ পেনাল্টি শূন্য (${fatigueShield?.unresponsive_streak || 0} ইগনোর)`
                          : `No fatigue penalty detected (${fatigueShield?.unresponsive_streak || 0} streak)`)}
                  </Text>
                </View>
              </View>

              {/* Direct Claim Button */}
              <TouchableOpacity
                style={styles.claimBtn}
                activeOpacity={0.88}
                onPress={() => {
                  setAiModalVisible(false);
                  if (selectedAiOffer?.targetScreen && navigation) {
                    navigation.navigate(selectedAiOffer.targetScreen);
                  }
                }}
              >
                <LinearGradient
                  colors={['#00D09C', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.claimGradient}
                >
                  <Text style={styles.claimBtnText}>
                    {isBangla ? 'অফারটি ব্যবহার করুন' : 'Claim This Offer'}
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color="#0F172A" />
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  aiTagText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#00D09C',
  },
  flatListContent: {
    alignItems: 'center',
  },
  slidePage: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#073E31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  aiBannerCardHighlight: {
    borderWidth: 1.5,
    borderColor: '#00D09C',
  },
  bannerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  textColumn: {
    flex: 1.35,
    paddingLeft: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    zIndex: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aiChoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  aiChoiceBadgeText: {
    color: '#064E3B',
    fontSize: 9.5,
    fontWeight: '800',
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 19.5,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 9,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionPillText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  whyThisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 208, 156, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 156, 0.4)',
  },
  whyThisText: {
    color: '#00D09C',
    fontSize: 10,
    fontWeight: '700',
  },
  imageColumn: {
    flex: 0.95,
    height: '100%',
    position: 'relative',
  },
  personImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#0F4D3C',
  },
  aiActiveDot: {
    backgroundColor: '#00D09C',
    width: 22,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalSparkleWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubheading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    marginTop: 14,
  },
  probCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  probScoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  probValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F4D3C',
  },
  probLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  probDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  probSegmentBlock: {
    flex: 1,
  },
  upliftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  upliftPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  upliftDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  reasonCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3.5,
    borderLeftColor: '#00D09C',
    marginBottom: 14,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
  },
  reasonBody: {
    fontSize: 12.5,
    color: '#1E293B',
    lineHeight: 18.5,
  },
  factorsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 18,
  },
  factorsHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  factorText: {
    fontSize: 11.5,
    color: '#334155',
  },
  claimBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  claimGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 6,
  },
  claimBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
