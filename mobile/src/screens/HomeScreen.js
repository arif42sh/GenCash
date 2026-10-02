import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { BalanceCard } from '../components/BalanceCard';
import { ActionGrid } from '../components/ActionGrid';
import { OffersSection } from '../components/OffersSection';
import { QRScannerModal } from '../components/QRScannerModal';

const RECENT_CONTACTS = [
  { id: '1', name: 'Sadia Rahman', phone: '01822222222', initials: 'SR', color: '#10B981', bg: '#E8F7F0' },
  { id: '2', name: 'Rafiqul Islam', phone: '01933333333', initials: 'RI', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '3', name: 'Chillox Burger', phone: '01788888888', initials: 'CB', color: '#F59E0B', bg: '#FEF5E7' },
  { id: '4', name: 'Star Tech', phone: '01755555555', initials: 'ST', color: '#8B5CF6', bg: '#F0EDFA' },
  { id: '5', name: 'Agent Point', phone: '01799999999', initials: 'AP', color: '#064E3B', bg: '#E8F6F0' },
];

export const HomeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);

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

  const handleActionSelect = (screenName) => {
    navigation.navigate(screenName);
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
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <View style={styles.userProfileRow}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>{t('hello', 'Hello')} {userName},</Text>
            <Text style={styles.userNameText}>{t('welcomeBack', 'Welcome Back!')}</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          {/* 1. Notification Bell */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Settings Gear */}
          <TouchableOpacity
            style={[styles.iconBtn, { marginLeft: 8 }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D09C"
          />
        }
      >
        {/* 1. Wallet Balance Card with LinearGradient */}
        <BalanceCard
          balance={wallet?.balance || 0}
          currency={wallet?.currency || 'BDT'}
          onRefresh={onRefresh}
          onAction={handleActionSelect}
          onOpenQR={() => setShowQRScanner(true)}
        />

        {/* 2. "Send Again" / Recent Contacts Carousel */}
        <View style={styles.quickSendSection}>
          <View style={styles.quickSendHeader}>
            <Text style={styles.quickSendTitle}>{t('sendAgain', 'Send Again')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SendMoney')}>
              <Text style={styles.quickSendSeeAll}>{t('newContact', 'New Contact +')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsScroll}>
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
                <Text style={styles.contactName} numberOfLines={1}>
                  {c.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Other Services (8 Pastel Icon Grid) */}
        <ActionGrid onSelectAction={handleActionSelect} />

        {/* 4. Professional Visual Offers, Combos & Partner Brands */}
        <OffersSection
          navigation={navigation}
          onOpenQR={() => setShowQRScanner(true)}
        />

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScanned}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F6F9F8',
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#00D09C',
  },
  avatarText: {
    color: '#064E3B',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    justifyContent: 'center',
  },
  greetingText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  userNameText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F43F5E',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // Send Again Carousel
  quickSendSection: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  quickSendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  quickSendSeeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D09C',
  },
  contactsScroll: {
    paddingVertical: 4,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 58,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInitials: {
    fontSize: 14,
    fontWeight: '800',
  },
  contactName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
