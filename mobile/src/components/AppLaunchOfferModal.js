import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// High-resolution commercial campaign visuals
const CAMPAIGN_IMAGES = {
  MERCHANT_PAY:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', // Juicy gourmet burger feast
  RECHARGE:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80', // Cheerful person with phone
  ADD_MONEY:
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80', // Modern digital banking
  BILL_PAY:
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', // Utility bill payments
  SEND_MONEY:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
};

export const AppLaunchOfferModal = ({
  visible,
  offer,
  onClose,
  onAccept,
  onViewAllOffers,
}) => {
  const { isBangla } = useLanguage();

  if (!offer) return null;

  const category = (offer.category || 'MERCHANT_PAY').toUpperCase();
  const heroImage =
    offer.image || CAMPAIGN_IMAGES[category] || CAMPAIGN_IMAGES.MERCHANT_PAY;

  // Clean, commercial advertisement copy
  const headline = isBangla
    ? (offer.headline || offer.title || 'চিলক্স বার্গারে আকর্ষণীয় ছাড়!')
    : (offer.headlineEn || offer.titleEn || offer.title || 'Special Offer at Chillox Burger!');

  const sub = isBangla
    ? (offer.sub || 'জেনক্যাশ দিয়ে পেমেন্ট করলেই উপভোগ করুন আকর্ষণীয় ইনস্ট্যান্ট ক্যাশব্যাক।')
    : (offer.subEn || 'Pay with GenCash QR code and enjoy instant cashback on your bill.');

  const discountBadge = offer.discount || (isBangla ? '১৫% ক্যাশব্যাক' : '15% Cashback');
  const campaignTag = offer.badge || (isBangla ? 'লাভের অফার' : 'Special Offer');
  const validityText = offer.validity || (isBangla ? 'সীমিত সময়ের জন্য • শর্ত প্রযোজ্য' : 'Limited time promo • T&C apply');

  const btnText = offer.btnText
    ? offer.btnText
    : isBangla
    ? 'অফারটি উপভোগ করুন'
    : 'Grab Offer Now';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss touch */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Campaign Banner Card Container */}
        <View style={styles.cardContainer}>
          {/* 1. Floating Clean Circular Close Button */}
          <TouchableOpacity
            style={styles.floatingCloseBtn}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={18} color="#0F2F24" />
          </TouchableOpacity>

          {/* 2. Top Promotional Banner Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Smooth Cinematic Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(15, 77, 60, 0.85)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Top-Left: "লাভের ঘণ্টা / অফার" Campaign Ribbon */}
            <View style={styles.campaignRibbon}>
              <Ionicons name="alarm" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.campaignRibbonText}>{campaignTag}</Text>
            </View>

            {/* Bottom-Left: Punchy Discount Badge on Banner */}
            <View style={styles.bannerBottomRow}>
              <View style={styles.discountBadge}>
                <Ionicons name="gift" size={13} color="#F59E0B" style={{ marginRight: 5 }} />
                <Text style={styles.discountBadgeText}>{discountBadge}</Text>
              </View>
            </View>
          </View>

          {/* 3. Simple & Elegant Commercial Content Body */}
          <View style={styles.body}>
            {/* Offer Headline */}
            <Text style={styles.headline} numberOfLines={2}>
              {headline}
            </Text>

            {/* Human & Inviting Promotional Subtitle */}
            <Text style={styles.subtitle} numberOfLines={2}>
              {sub}
            </Text>

            {/* Campaign Validity / Terms Note */}
            <View style={styles.validityRow}>
              <Ionicons name="time-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.validityText}>{validityText}</Text>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.88}
              onPress={() => onAccept && onAccept(offer)}
            >
              <LinearGradient
                colors={['#0F4D3C', '#009B72']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionBtnText}>{btnText}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Link: View All Offers */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  if (onViewAllOffers) onViewAllOffers();
                }}
                activeOpacity={0.7}
                style={styles.seeAllLink}
              >
                <Text style={styles.seeAllLinkText}>
                  {isBangla ? 'সকল অফার দেখুন ➔' : 'View All Offers ➔'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 23, 18, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  cardContainer: {
    width: Math.min(width * 0.88, 350),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 20,
    position: 'relative',
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 185,
    position: 'relative',
    backgroundColor: '#0F4D3C',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  campaignRibbon: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  campaignRibbonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bannerBottomRow: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 77, 60, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  headline: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2F24',
    lineHeight: 23,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  validityText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  seeAllLink: {
    paddingVertical: 4,
  },
  seeAllLinkText: {
    color: '#0F4D3C',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
