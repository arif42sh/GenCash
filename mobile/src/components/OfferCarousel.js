import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const BANNERS = [
  {
    id: 'banner_1',
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
  },
  {
    id: 'banner_2',
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
  },
  {
    id: 'banner_3',
    category: 'PAYMENT',
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
    gradient: ['#831843', '#9D174D', '#BE185D'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'banner_4',
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
    gradient: ['#064E3B', '#065F46', '#047857'],
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
  },
];

export default function OfferCarousel({ navigation, onOpenAllOffers }) {
  const { isBangla } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const isInteracting = useRef(false);

  // Auto-slide every 3.8 seconds with smooth scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInteracting.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        flatListRef.current?.scrollToOffset({
          offset: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumScrollEnd = (e) => {
    isInteracting.current = false;
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < BANNERS.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    isInteracting.current = true;
  };

  const handlePressBanner = (item) => {
    if (navigation && item.targetScreen) {
      navigation.navigate(item.targetScreen);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>
            {isBangla ? 'প্রমোশন ও অফার' : 'Promotions & Offers'}
          </Text>
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>{BANNERS.length} {isBangla ? 'অফার' : 'Deals'}</Text>
          </View>
        </View>
        {onOpenAllOffers && (
          <TouchableOpacity
            onPress={onOpenAllOffers}
            activeOpacity={0.7}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>{isBangla ? 'সব দেখুন' : 'See All'}</Text>
            <Ionicons name="chevron-forward" size={13} color="#00D09C" />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Sliding Banner FlatList */}
      <FlatList
        ref={flatListRef}
        data={BANNERS}
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
              style={styles.bannerCard}
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
                  <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                    <Text style={styles.badgeText}>
                      {isBangla ? item.badgeText : item.badgeTextEn}
                    </Text>
                  </View>

                  <Text style={styles.headlineText} numberOfLines={2}>
                    {isBangla ? item.headline : item.headlineEn}
                  </Text>

                  <Text style={styles.subText} numberOfLines={1}>
                    {isBangla ? item.sub : item.subEn}
                  </Text>

                  <View style={styles.actionPill}>
                    <Text style={styles.actionPillText}>
                      {isBangla ? item.btnText : item.btnTextEn}
                    </Text>
                    <Ionicons name="arrow-forward" size={11} color="#0F172A" style={{ marginLeft: 3 }} />
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
        {BANNERS.map((_, idx) => {
          const isActive = activeIndex === idx;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
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
  hotBadge: {
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C2EADF',
  },
  hotBadgeText: {
    color: '#0F4D3C',
    fontSize: 10,
    fontWeight: '800',
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
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  actionPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
