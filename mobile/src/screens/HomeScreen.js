import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import AppHeader from '../components/AppHeader';
import { BalanceCard } from '../components/BalanceCard';
import { ActionGrid } from '../components/ActionGrid';
import { OffersSection } from '../components/OffersSection';
import { QRScannerModal } from '../components/QRScannerModal';
import { UserReceiveQRModal } from '../components/UserReceiveQRModal';
import { AppLaunchOfferModal } from '../components/AppLaunchOfferModal';

let sessionLaunchPopupDismissed = false;

const RECENT_CONTACTS = [
  { id: '1', name: 'Sadia', fullName: 'Sadia Rahman', phone: '01822222222', initials: 'SS', color: '#7C3AED', bg: '#EDE9FE' },
  { id: '2', name: 'Rafiqul', fullName: 'Rafiqul Islam', phone: '01933333333', initials: 'RA', color: '#0D9488', bg: '#CCFBF1' },
  { id: '3', name: 'Chillox', fullName: 'Chillox Burger', phone: '01788888888', initials: 'CH', color: '#4338CA', bg: '#E0E7FF' },
  { id: '4', name: 'Star Tech', fullName: 'Star Tech Ltd', phone: '01755555555', initials: 'ST', color: '#8B5CF6', bg: '#F3E8FF' },
  { id: '5', name: 'Agent Point', fullName: 'Authorized Agent', phone: '01799999999', initials: 'AP', color: '#064E3B', bg: '#D1FAE5' },
];

export const HomeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const { unreadCount, fetchNotifications: refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showUserQR, setShowUserQR] = useState(false);
  const [showLaunchOfferModal, setShowLaunchOfferModal] = useState(false);
  const [launchOffer, setLaunchOffer] = useState(null);
  const [spendingAnomaly, setSpendingAnomaly] = useState(null);
  const [openAllOffersTrigger, setOpenAllOffersTrigger] = useState(0);

  const loadDashboardData = useCallback(async () => {
    try {
      await refreshWallet();
      await refreshNotifications();

      // Load dynamic Spending Anomaly Offer Pipeline
      const nboRes = await api.getNextBestOffers();
      if (nboRes?.spending_anomaly) {
        setSpendingAnomaly(nboRes.spending_anomaly);
      }
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    }
  }, [refreshWallet, refreshNotifications]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // bKash / Nagad style Personalized NBO App-Launch Pop-up Trigger
  useEffect(() => {
    let isMounted = true;
    const fetchTopOfferForPopup = async () => {
      if (sessionLaunchPopupDismissed) return;
      try {
        const nboRes = await api.getNextBestOffers();
        const top = nboRes?.top_recommended_offer;
        if (top && isMounted) {
          const formatted = {
            id: top.offer_id,
            category: top.category,
            title: top.title,
            titleEn: top.title,
            headline: top.title,
            sub: isBangla ? top.reason_bn : top.reason_en,
            reason_bn: top.reason_bn,
            reason_en: top.reason_en,
            discount: `৳${top.discount_value || 50} ক্যাশব্যাক`,
            targetScreen:
              top.category === 'RECHARGE'
                ? 'MobileRecharge'
                : top.category === 'MERCHANT_PAY'
                ? 'MerchantPayment'
                : top.category === 'BILL_PAY'
                ? 'MerchantPayment'
                : 'AddMoney',
            targetParams:
              top.category === 'BILL_PAY'
                ? { mode: 'utility' }
                : top.category === 'MERCHANT_PAY'
                ? { mode: 'merchant' }
                : {},
            btnText:
              top.category === 'RECHARGE'
                ? 'রিচার্জ করুন'
                : top.category === 'MERCHANT_PAY'
                ? 'পেমেন্ট করুন'
                : 'অফারটি উপভোগ করুন',
            btnTextEn:
              top.category === 'RECHARGE'
                ? 'Recharge Now'
                : top.category === 'MERCHANT_PAY'
                ? 'Pay Now'
                : 'Grab Offer',
          };
          setLaunchOffer(formatted);
          sessionLaunchPopupDismissed = true;
          setTimeout(() => {
            if (isMounted) setShowLaunchOfferModal(true);
          }, 700);
        }
      } catch (err) {
        console.warn('Failed to load launch popup offer:', err);
      }
    };

    fetchTopOfferForPopup();
    return () => {
      isMounted = false;
    };
  }, [isBangla]);

  const handleAcceptLaunchOffer = (offer) => {
    setShowLaunchOfferModal(false);
    sessionLaunchPopupDismissed = true;
    if (offer?.targetScreen) {
      navigation.navigate(offer.targetScreen, offer.targetParams || {});
    }
  };

  const handleDismissLaunchOffer = () => {
    setShowLaunchOfferModal(false);
    sessionLaunchPopupDismissed = true;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleActionSelect = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  const handleQuickSend = (contact) => {
    navigation.navigate('SendMoney');
  };

  const handleQRScanned = (scannedData) => {
    setShowQRScanner(false);
    navigation.navigate('MerchantPayment');
  };

  const { t, isBangla } = useLanguage();
  const userName = user?.name ? user.name.split(' ')[0] : 'Tanvir';

  return (
    <View style={styles.screenContainer}>
      {/* Translucent status bar so background art reaches the top edge */}
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D09C"
          />
        }
      >
        {/* Top Header: Pattern & utilities scroll naturally inside ScrollView */}
        <AppHeader
          userName={userName}
          userAvatar={user?.avatar || user?.profile_image || null}
          unreadNotifCount={unreadCount}
          onOpenProfile={() => navigation.navigate('Profile')}
          onOpenNotif={() => navigation.navigate('Notifications')}
          onOpenSettings={() => navigation.navigate('Settings')}
          t={t}
        />

        {/* 1. Wallet Balance Card with Dark Pine Gradient */}
        <BalanceCard
          balance={wallet?.balance || 0}
          currency={wallet?.currency || 'BDT'}
          onRefresh={onRefresh}
          onAction={handleActionSelect}
          onOpenQR={() => setShowUserQR(true)}
        />

        {/* 2. "Send Again" Vertical Contact Chips */}
        <View style={styles.quickSendSection}>
          <View style={styles.quickSendHeader}>
            <Text style={styles.quickSendTitle}>{t('sendAgain', 'Send Again')}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contactsScroll}
          >
            {RECENT_CONTACTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.contactItem}
                activeOpacity={0.75}
                onPress={() => handleQuickSend(c)}
              >
                <View style={[styles.contactAvatar, { backgroundColor: c.bg }]}>
                  <Text style={[styles.contactInitials, { color: c.color }]}>{c.initials}</Text>
                </View>
                <Text style={styles.contactName} numberOfLines={1}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Other Services (7 Professional Mint Icons Grid) */}
        <ActionGrid onSelectAction={handleActionSelect} />

        {/* 4. Dedicated Financial Insight Card -> Dynamic Spending Anomaly Offer Pipeline */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.aiInsightCard}
          onPress={() => {
            const offer = spendingAnomaly?.recommended_offer;
            if (offer?.target_screen) {
              navigation.navigate(offer.target_screen, offer.target_params || {});
            } else {
              navigation.navigate('AIHub');
            }
          }}
        >
          <View style={styles.aiInsightHeader}>
            <View style={[styles.aiBadgePill, spendingAnomaly?.has_anomaly && styles.aiBadgeAlertPill]}>
              <Ionicons
                name={spendingAnomaly?.has_anomaly ? "warning-outline" : "trending-up"}
                size={13}
                color={spendingAnomaly?.has_anomaly ? "#DC2626" : "#064E3B"}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.aiBadgeText, spendingAnomaly?.has_anomaly && styles.aiBadgeAlertText]}>
                {spendingAnomaly?.has_anomaly
                  ? (isBangla ? 'খরচের এনোমালি' : 'Spending Anomaly')
                  : (isBangla ? 'ফিন্যান্সিয়াল ইনসাইট' : 'Financial Insight')}
              </Text>
            </View>
            <View style={[styles.aiConfidencePill, spendingAnomaly?.has_anomaly && styles.aiConfidenceAlertPill]}>
              <Text style={[styles.aiConfidenceText, spendingAnomaly?.has_anomaly && styles.aiConfidenceAlertText]}>
                {spendingAnomaly?.has_anomaly
                  ? (isBangla ? `+${spendingAnomaly.increase_pct}% বৃদ্ধি` : `+${spendingAnomaly.increase_pct}% Surge`)
                  : (isBangla ? 'সাপ্তাহিক বিশ্লেষণ' : 'Weekly Analysis')}
              </Text>
            </View>
          </View>

          <Text style={styles.aiInsightTitle}>
            {spendingAnomaly
              ? (isBangla ? spendingAnomaly.title_bn : spendingAnomaly.title_en)
              : (isBangla ? 'খরচের সতর্কতা পাওয়া গেছে' : 'Spending Anomaly Detected')}
          </Text>
          <Text style={styles.aiInsightSub}>
            {spendingAnomaly
              ? (isBangla ? spendingAnomaly.description_bn : spendingAnomaly.description_en)
              : (isBangla
                  ? 'এই সপ্তাহে আপনার কেনাকাটা ও খাবার খরচ সাধারণের তুলনায় বেশি।'
                  : 'Your food & dining expenses are higher than usual this week.')}
          </Text>

          <View style={styles.aiInsightFooter}>
            <Text style={[styles.aiInsightActionText, spendingAnomaly?.has_anomaly && { color: '#B91C1C' }]}>
              {spendingAnomaly?.recommended_offer
                ? (isBangla
                    ? spendingAnomaly.recommended_offer.action_label_bn
                    : spendingAnomaly.recommended_offer.action_label_en)
                : (isBangla ? 'বাজেট ইনসাইট দেখুন' : 'Review Budget Insights')}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={spendingAnomaly?.has_anomaly ? "#B91C1C" : "#064E3B"}
            />
          </View>
        </TouchableOpacity>

        {/* 5. Additional Offers & Deals */}
        <OffersSection
          navigation={navigation}
          onOpenQR={() => setShowQRScanner(true)}
          hideTopBanner={true}
          openAllModalTrigger={openAllOffersTrigger}
        />
      </ScrollView>

      {/* App Launch Personalized NBO Pop-up Modal (bKash/Nagad style) */}
      <AppLaunchOfferModal
        visible={showLaunchOfferModal}
        offer={launchOffer}
        onClose={handleDismissLaunchOffer}
        onAccept={handleAcceptLaunchOffer}
        onViewAllOffers={() => {
          handleDismissLaunchOffer();
          setOpenAllOffersTrigger((prev) => prev + 1);
        }}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScanned}
      />

      {/* Personal User Receive QR Code Modal */}
      <UserReceiveQRModal
        visible={showUserQR}
        onClose={() => setShowUserQR(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#EDF7F4',
  },
  scrollContent: {
    paddingBottom: 135,
  },
  // Send Again Carousel
  quickSendSection: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  quickSendHeader: {
    marginBottom: 12,
  },
  quickSendTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactsScroll: {
    paddingVertical: 2,
    gap: 14,
  },
  contactItem: {
    alignItems: 'center',
    width: 58,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },

  // AI Financial Insight Card
  aiInsightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7EAE0',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiBadgePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadgeAlertPill: {
    backgroundColor: '#FEE2E2',
  },
  aiBadgeText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
  },
  aiBadgeAlertText: {
    color: '#991B1B',
  },
  aiConfidencePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiConfidenceAlertPill: {
    backgroundColor: '#FEE2E2',
  },
  aiConfidenceText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
  },
  aiConfidenceAlertText: {
    color: '#B91C1C',
  },
  aiInsightTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  aiInsightSub: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  aiInsightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  aiInsightActionText: {
    color: '#064E3B',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
