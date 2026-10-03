import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// High-resolution real lifestyle images tailored by category
const CATEGORY_IMAGES = {
  MERCHANT_PAY: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
  RECHARGE: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  ADD_MONEY: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
  BILL_PAY: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  SEND_MONEY: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
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

  const category = (offer.category || 'RECHARGE').toUpperCase();
  const heroImage = offer.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.RECHARGE;

  const headline = isBangla
    ? (offer.headline || offer.title || 'বিশেষ ক্যাশব্যাক অফার')
    : (offer.headlineEn || offer.titleEn || offer.title || 'Special Cashback Offer');

  const sub = isBangla
    ? (offer.sub || offer.description || 'আপনার অ্যাকাউন্টের জন্য নির্ধারিত প্রিমিয়াম রিওয়ার্ড।')
    : (offer.subEn || offer.descriptionEn || 'Exclusive reward selected for your account.');

  const btnText = isBangla
    ? (offer.btnText || 'অফারটি উপভোগ করুন')
    : (offer.btnTextEn || 'Grab Offer Now');

  const reason = isBangla
    ? (offer.reason_bn || offer.aiReasonBn || 'বিগত ৩০ দিনের ব্যবহারের ভিত্তিতে এটি আপনার জন্য সেরা অফার।')
    : (offer.reason_en || offer.aiReasonEn || 'Selected based on your 30-day activity pattern.');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* 1. Hero Image with Gradient Overlay */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Tag */}
            <View style={styles.topBadge}>
              <Ionicons name="flame" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.topBadgeText}>
                {isBangla ? 'বিশেষ অফার' : 'Exclusive Deal'}
              </Text>
            </View>

            {/* Close Button X */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Value Callout on Image Bottom */}
            <View style={styles.imageBottomTextWrap}>
              <Text style={styles.highlightBadgeText} numberOfLines={1}>
                {isBangla ? 'সীমিত সময়ের সুযোগ' : 'Limited Time Privilege'}
              </Text>
            </View>
          </View>

          {/* 2. Content Body */}
          <View style={styles.body}>
            <Text style={styles.headline} numberOfLines={2}>
              {headline}
            </Text>

            <Text style={styles.subtitle} numberOfLines={2}>
              {sub}
            </Text>

            {/* Why This Offer Box */}
            <View style={styles.reasonBox}>
              <View style={styles.reasonHeader}>
                <Ionicons name="shield-checkmark" size={14} color="#0F4D3C" style={{ marginRight: 5 }} />
                <Text style={styles.reasonTitle}>
                  {isBangla ? 'আপনার জন্য কেন উপযুক্ত?' : 'Why this offer?'}
                </Text>
              </View>
              <Text style={styles.reasonText} numberOfLines={2}>
                {reason}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.88}
              onPress={() => onAccept && onAccept(offer)}
            >
              <LinearGradient
                colors={['#0F4D3C', '#137158']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionBtnText}>{btnText}</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary footer links */}
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
    width: Math.min(width * 0.88, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#0F4D3C',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  topBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  imageBottomTextWrap: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  highlightBadgeText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  reasonBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  reasonTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F4D3C',
  },
  reasonText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
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
