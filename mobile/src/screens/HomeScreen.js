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
import { api } from '../services/api';
import AppHeader from '../components/AppHeader';
import { BalanceCard } from '../components/BalanceCard';
import { ActionGrid } from '../components/ActionGrid';
import { OffersSection } from '../components/OffersSection';
import { QRScannerModal } from '../components/QRScannerModal';
import { UserReceiveQRModal } from '../components/UserReceiveQRModal';

const RECENT_CONTACTS = [
  { id: '1', name: 'Sadia', fullName: 'Sadia Rahman', phone: '01822222222', initials: 'SS', color: '#7C3AED', bg: '#EDE9FE' },
  { id: '2', name: 'Rafiqul', fullName: 'Rafiqul Islam', phone: '01933333333', initials: 'RA', color: '#0D9488', bg: '#CCFBF1' },
  { id: '3', name: 'Chillox', fullName: 'Chillox Burger', phone: '01788888888', initials: 'CH', color: '#4338CA', bg: '#E0E7FF' },
  { id: '4', name: 'Star Tech', fullName: 'Star Tech Ltd', phone: '01755555555', initials: 'ST', color: '#8B5CF6', bg: '#F3E8FF' },
  { id: '5', name: 'Agent Point', fullName: 'Authorized Agent', phone: '01799999999', initials: 'AP', color: '#064E3B', bg: '#D1FAE5' },
];

export const HomeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showUserQR, setShowUserQR] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      await refreshWallet();

      // Load notifications count
      const notifData = await api.getNotifications();
      const unread = Array.isArray(notifData) ? notifData.filter((n) => !n.is_read).length : 0;
      setUnreadNotifCount(unread);
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    }
  }, [refreshWallet]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
          unreadNotifCount={unreadNotifCount}
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

        {/* 4. Dedicated AI Financial Insight Teaser Card (SRS / Hackathon Requirement) */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.aiInsightCard}
          onPress={() => navigation.navigate('AIHub')}
        >
          <View style={styles.aiInsightHeader}>
            <View style={styles.aiBadgePill}>
              <Ionicons name="sparkles" size={13} color="#064E3B" style={{ marginRight: 4 }} />
              <Text style={styles.aiBadgeText}>✦ AI Financial Insight</Text>
            </View>
            <View style={styles.aiConfidencePill}>
              <Text style={styles.aiConfidenceText}>89% Confidence</Text>
            </View>
          </View>

          <Text style={styles.aiInsightTitle}>Spending Anomaly Detected</Text>
          <Text style={styles.aiInsightSub}>
            Your food & dining expenses are 18% higher than usual this week.
          </Text>

          <View style={styles.aiInsightFooter}>
            <Text style={styles.aiInsightActionText}>Review Budget Insights</Text>
            <Ionicons name="arrow-forward" size={14} color="#064E3B" />
          </View>
        </TouchableOpacity>

        {/* 5. Additional Offers & Deals */}
        <OffersSection
          navigation={navigation}
          onOpenQR={() => setShowQRScanner(true)}
          hideTopBanner={true}
        />
      </ScrollView>

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
  aiBadgeText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
  },
  aiConfidencePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiConfidenceText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
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
