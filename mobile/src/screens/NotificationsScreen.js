import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'mock_1',
    title: '৳50 Cashback Received',
    preview: 'Shwapno shopping cashback credited',
    message: 'Congratulations! You received ৳50.00 instant cashback on your grocery shopping payment at Shwapno Superstore.',
    type: 'CASHBACK',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actionScreen: 'MerchantPayment',
    actionLabel: 'Shop Again',
  },
  {
    id: 'mock_2',
    title: 'Money Received +৳500',
    preview: 'From Sadia Rahman (01822222222)',
    message: 'Sadia Rahman (01822222222) sent you ৳500.00.\n\nReference: Dinner split\nNew Balance: ৳12,500.00',
    type: 'TRANSACTION',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionScreen: 'Transactions',
    actionLabel: 'View Statement',
  },
  {
    id: 'mock_3',
    title: 'Recharge Done -৳100',
    preview: 'Grameenphone 01711000000',
    message: 'Your mobile recharge of ৳100.00 to 01711000000 (Grameenphone) has been processed.\n\nTxnID: TXN849201\nStatus: COMPLETED',
    type: 'TRANSACTION',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actionScreen: 'MobileRecharge',
    actionLabel: 'Recharge Again',
  },
  {
    id: 'mock_4',
    title: 'New Device Login Alert',
    preview: 'Android device detected in Dhaka',
    message: 'A new login session was detected from an Android device in Dhaka, Bangladesh.\n\nIf this was not you, please change your PIN immediately from Profile > Security.',
    type: 'SECURITY',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actionScreen: 'Profile',
    actionLabel: 'Security Settings',
  },
  {
    id: 'mock_5',
    title: 'Chillox 1+1 Deal Active',
    preview: 'Buy 1 get 1 burger free offer',
    message: 'Exclusive 1+1 BOGO deal is live at all Chillox outlets! Pay via GenCash counter QR to claim your free burger combo.',
    type: 'OFFER',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    actionScreen: 'MerchantPayment',
    actionLabel: 'Claim Deal',
  },
  {
    id: 'mock_6',
    title: 'Zero Fee on Add Money',
    preview: 'Deposit funds free via Visa/Mastercard',
    message: 'Enjoy 0% deposit fee on all Bank Transfers and Card deposits to your GenCash wallet. Instant settlement 24/7.',
    type: 'SYSTEM',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    actionScreen: 'AddMoney',
    actionLabel: 'Add Money Now',
  },
];

const FILTER_TABS = [
  { id: 'ALL', label: 'All', bn: 'সব' },
  { id: 'TRANSACTION', label: 'Transactions', bn: 'লেনদেন' },
  { id: 'CASHBACK', label: 'Cashback & Deals', bn: 'ক্যাশব্যাক' },
  { id: 'SECURITY', label: 'Security', bn: 'সিকিউরিটি' },
];

export const NotificationsScreen = ({ navigation }) => {
  const { isBangla } = useLanguage();
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const serverNotifs = await api.getNotifications();
      if (Array.isArray(serverNotifs) && serverNotifs.length > 0) {
        const merged = [
          ...serverNotifs.map((n) => ({
            id: n.id.toString(),
            title: n.title,
            preview: n.message ? n.message.slice(0, 40) + '...' : 'Tap for details',
            message: n.message,
            type: n.type || 'TRANSACTION',
            is_read: Boolean(n.is_read),
            created_at: n.created_at || new Date().toISOString(),
            actionScreen: 'Transactions',
            actionLabel: 'View Details',
          })),
          ...DEFAULT_NOTIFICATIONS.filter(
            (m) => !serverNotifs.some((s) => s.title === m.title)
          ),
        ];
        setNotifications(merged);
      }
    } catch (e) {
      console.warn('Backend fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    Alert.alert('Done', 'All notifications marked as read.');
  };

  const handleNotificationPress = async (item) => {
    // Mark as read immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );
    if (!item.id.toString().startsWith('mock_')) {
      try {
        await api.markNotificationRead(item.id);
      } catch (e) {}
    }
    setSelectedItem(item);
  };

  const handleAction = () => {
    const screen = selectedItem?.actionScreen;
    setSelectedItem(null);
    if (screen && navigation) {
      navigation.navigate(screen);
    }
  };

  const filteredList = useMemo(() => {
    if (selectedFilter === 'ALL') return notifications;
    if (selectedFilter === 'CASHBACK') {
      return notifications.filter((n) => n.type === 'CASHBACK' || n.type === 'OFFER');
    }
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const formatShortTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays === 1) return '1d';
      return `${diffDays}d`;
    } catch (e) {
      return '';
    }
  };

  const getCategoryMeta = (type) => {
    switch (type) {
      case 'CASHBACK':
      case 'OFFER':
        return {
          icon: 'gift-outline',
          color: '#00D09C',
          bg: '#E6F8F3',
          badge: 'Reward',
        };
      case 'TRANSACTION':
        return {
          icon: 'swap-horizontal',
          color: '#1B4D3E',
          bg: '#E8F7F0',
          badge: 'Wallet',
        };
      case 'SECURITY':
        return {
          icon: 'shield-checkmark-outline',
          color: '#F59E0B',
          bg: '#FEF3C7',
          badge: 'Security',
        };
      case 'SYSTEM':
      default:
        return {
          icon: 'information-circle-outline',
          color: '#3B82F6',
          bg: '#EFF6FF',
          badge: 'System',
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F2F24" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{isBangla ? 'নোটিফিকেশন' : 'Notifications'}</Text>
          {unreadCount > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{String(unreadCount)} {isBangla ? 'নতুন' : 'New'}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="checkmark-done"
            size={18}
            color={unreadCount > 0 ? '#0F4D3C' : '#CBD5E1'}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                selectedFilter === tab.id && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === tab.id && styles.filterTextActive,
                ]}
              >
                {isBangla ? tab.bn : tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sleek & Compact Notification Feed */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D09C"
          />
        }
        renderItem={({ item }) => {
          const meta = getCategoryMeta(item.type);
          const previewText = String(item.preview || item.message || '');
          const titleText = String(item.title || '');
          const timeText = String(formatShortTime(item.created_at) || '');
          const isRead = Boolean(item.is_read);

          return (
            <TouchableOpacity
              style={[
                styles.compactItem,
                !isRead && styles.compactItemUnread,
              ]}
              activeOpacity={0.7}
              onPress={() => handleNotificationPress(item)}
            >
              {/* Category Icon */}
              <View style={[styles.compactIconBox, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>

              {/* Title & 1-line short preview */}
              <View style={styles.compactContent}>
                <View style={styles.compactTopRow}>
                  <Text
                    style={[
                      styles.compactTitle,
                      !isRead && styles.compactTitleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {titleText}
                  </Text>
                  <Text style={styles.compactTime}>{timeText}</Text>
                </View>

                <View style={styles.compactBottomRow}>
                  <Text style={styles.compactPreview} numberOfLines={1}>
                    {previewText}
                  </Text>
                  {!isRead ? <View style={styles.compactDot} /> : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              You have no notifications in this category.
            </Text>
          </View>
        }
      />

      {/* Comprehensive Details Modal */}
      {selectedItem ? (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.modalIconWrap, { backgroundColor: getCategoryMeta(selectedItem.type).bg }]}>
                  <Ionicons
                    name={getCategoryMeta(selectedItem.type).icon}
                    size={24}
                    color={getCategoryMeta(selectedItem.type).color}
                  />
                </View>
                <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{String(selectedItem.title || '')}</Text>
              <Text style={styles.modalTime}>
                {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : ''}
              </Text>

              <View style={styles.modalBodyCard}>
                <Text style={styles.modalMessage}>{String(selectedItem.message || '')}</Text>
              </View>

              <View style={styles.modalActionRow}>
                {selectedItem.actionScreen ? (
                  <TouchableOpacity style={styles.modalActionBtn} onPress={handleAction}>
                    <Text style={styles.modalActionBtnText}>
                      {String(selectedItem.actionLabel || 'View Details')}
                    </Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.modalDismissBtn,
                    !selectedItem.actionScreen && { width: '100%' },
                  ]}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.modalDismissBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EDF7F4',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#0F4D3C',
    fontSize: 18,
    fontWeight: '800',
  },
  headerBadge: {
    backgroundColor: '#0F4D3C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  markAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterWrapper: {
    backgroundColor: '#EDF7F4',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  filterPillActive: {
    backgroundColor: '#0F4D3C',
    borderColor: '#0F4D3C',
  },
  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },

  // Sleek & Compact Item (Notification Style)
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  compactItemUnread: {
    borderColor: '#A7F3D0',
    backgroundColor: '#FAFFFD',
  },
  compactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  compactTitle: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  compactTitleUnread: {
    color: '#0F2F24',
    fontWeight: '800',
  },
  compactTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  compactBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactPreview: {
    color: '#64748B',
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  compactDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00D09C',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },

  // Modal Card
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 14,
    fontWeight: '500',
  },
  modalBodyCard: {
    backgroundColor: '#F8FCFA',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    marginBottom: 18,
  },
  modalMessage: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1B4D3E',
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalDismissBtn: {
    flex: 1,
    backgroundColor: '#F6F9F8',
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  modalDismissBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
});
