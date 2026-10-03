import React, { useState, useMemo, useCallback } from 'react';
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
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

const FILTER_TABS = [
  { id: 'ALL', label: 'All', bn: 'সব' },
  { id: 'TRANSACTION', label: 'Transactions', bn: 'লেনদেন' },
  { id: 'OFFER', label: 'Cashback & Offers', bn: 'অফার ও ক্যাশব্যাক' },
  { id: 'SECURITY', label: 'Security', bn: 'নিরাপত্তা' },
  { id: 'SYSTEM', label: 'Notices', bn: 'নোটিশ' },
];

export const getNotificationMeta = (item, isBangla = false) => {
  const type = String(item.type || '').toUpperCase();
  const title = String(item.title || '').toLowerCase();
  const msg = String(item.message || '').toLowerCase();

  // 1. Mobile Recharge
  if (type === 'RECHARGE' || title.includes('recharge') || title.includes('রিচার্জ')) {
    return {
      icon: 'phone-portrait-outline',
      color: '#2563EB',
      bg: '#EFF6FF',
      badge: isBangla ? 'রিচার্জ' : 'Recharge',
      badgeBg: '#DBEAFE',
      badgeColor: '#1D4ED8',
      category: 'TRANSACTION',
      defaultActionScreen: 'MobileRecharge',
      defaultActionLabel: isBangla ? 'আবার রিচার্জ করুন' : 'Recharge Again',
    };
  }

  // 2. Received Money / Cash In / Add Money
  if (
    type === 'RECEIVED' ||
    title.includes('received') ||
    title.includes('add money') ||
    title.includes('cash in') ||
    title.includes('জমা') ||
    title.includes('গ্রহণ') ||
    title.includes('+৳')
  ) {
    return {
      icon: 'arrow-down-circle-outline',
      color: '#059669',
      bg: '#ECFDF5',
      badge: isBangla ? 'টাকা গ্রহণ' : 'Received',
      badgeBg: '#D1FAE5',
      badgeColor: '#047857',
      category: 'TRANSACTION',
      defaultActionScreen: 'Transactions',
      defaultActionLabel: isBangla ? 'স্টেটমেন্ট দেখুন' : 'View Statement',
    };
  }

  // 3. Send Money / Cash Out / Transfer
  if (
    type === 'SENT' ||
    type === 'SEND_MONEY' ||
    type === 'CASH_OUT' ||
    title.includes('send money') ||
    title.includes('cash out') ||
    title.includes('পাঠানো') ||
    title.includes('-৳')
  ) {
    return {
      icon: 'arrow-up-circle-outline',
      color: '#0D9488',
      bg: '#F0FDFA',
      badge: isBangla ? 'টাকা পাঠানো' : 'Send Money',
      badgeBg: '#CCFBF1',
      badgeColor: '#0F766E',
      category: 'TRANSACTION',
      defaultActionScreen: 'SendMoney',
      defaultActionLabel: isBangla ? 'আবার পাঠান' : 'Send Again',
    };
  }

  // 4. Cashback, Promos, Discounts & Offers
  if (
    type === 'CASHBACK' ||
    type === 'OFFER' ||
    type === 'DISCOUNT' ||
    type === 'REWARD' ||
    title.includes('cashback') ||
    title.includes('offer') ||
    title.includes('deal') ||
    title.includes('sale') ||
    title.includes('promo') ||
    title.includes('ক্যাশব্যাক') ||
    title.includes('অফার')
  ) {
    return {
      icon: 'gift-outline',
      color: '#D97706',
      bg: '#FFFBEB',
      badge: isBangla ? 'ক্যাশব্যাক ও অফার' : 'Cashback & Deal',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      category: 'OFFER',
      defaultActionScreen: 'MerchantPayment',
      defaultActionLabel: isBangla ? 'অফার ব্যবহার করুন' : 'Claim Offer',
    };
  }

  // 5. Merchant Payment
  if (
    type === 'PAYMENT' ||
    type === 'MERCHANT_PAYMENT' ||
    title.includes('payment') ||
    title.includes('merchant') ||
    title.includes('পেমেন্ট')
  ) {
    return {
      icon: 'bag-handle-outline',
      color: '#7C3AED',
      bg: '#F5F3FF',
      badge: isBangla ? 'পেমেন্ট' : 'Payment',
      badgeBg: '#EDE9FE',
      badgeColor: '#6D28D9',
      category: 'TRANSACTION',
      defaultActionScreen: 'MerchantPayment',
      defaultActionLabel: isBangla ? 'মার্চেন্ট পেমেন্ট' : 'Pay Merchant',
    };
  }

  // 6. Security, Device Login, KYC, PIN
  if (
    type === 'SECURITY' ||
    title.includes('security') ||
    title.includes('device') ||
    title.includes('login') ||
    title.includes('kyc') ||
    title.includes('pin') ||
    title.includes('verification') ||
    title.includes('নিরাপত্তা') ||
    title.includes('সতর্কতা')
  ) {
    return {
      icon: 'shield-checkmark-outline',
      color: '#DC2626',
      bg: '#FEF2F2',
      badge: isBangla ? 'নিরাপত্তা' : 'Security Alert',
      badgeBg: '#FEE2E2',
      badgeColor: '#B91C1C',
      category: 'SECURITY',
      defaultActionScreen: 'Profile',
      defaultActionLabel: isBangla ? 'নিরাপত্তা সেটিংস' : 'Security Settings',
    };
  }

  // 7. General Notice & System Announcements
  return {
    icon: 'notifications-outline',
    color: '#0F766E',
    bg: '#F0FDFA',
    badge: isBangla ? 'নোটিশ' : 'Notice',
    badgeBg: '#E6F4EA',
    badgeColor: '#0F5132',
    category: 'SYSTEM',
    defaultActionScreen: null,
    defaultActionLabel: null,
  };
};

export const NotificationsScreen = ({ navigation }) => {
  const { isBangla } = useLanguage();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsRead();
    Alert.alert(
      isBangla ? 'সম্পন্ন হয়েছে' : 'Done',
      isBangla ? 'সব নোটিফিকেশন পড়া হিসেবে চিহ্নিত করা হয়েছে।' : 'All notifications marked as read.'
    );
  };

  const handleNotificationPress = async (item) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
    }
    setSelectedItem(item);
  };

  const handleAction = () => {
    if (!selectedItem) return;
    const meta = getNotificationMeta(selectedItem, isBangla);
    const targetScreen = selectedItem.actionScreen || meta.defaultActionScreen;
    setSelectedItem(null);
    if (targetScreen && navigation) {
      navigation.navigate(targetScreen);
    }
  };

  const filteredList = useMemo(() => {
    if (selectedFilter === 'ALL') return notifications;
    return notifications.filter((item) => {
      const meta = getNotificationMeta(item, isBangla);
      return meta.category === selectedFilter || item.type === selectedFilter;
    });
  }, [notifications, selectedFilter, isBangla]);

  const formatShortTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return isBangla ? 'এইমাত্র' : 'Just now';
      if (diffMins < 60) return isBangla ? `${diffMins} মি` : `${diffMins}m ago`;
      if (diffHours < 24) return isBangla ? `${diffHours} ঘণ্টা` : `${diffHours}h ago`;
      if (diffDays === 1) return isBangla ? 'গতকাল' : 'Yesterday';
      return isBangla ? `${diffDays} দিন` : `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  const statusBarHeight =
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF7F4" translucent />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F4D3C" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isBangla ? 'নোটিফিকেশন' : 'Notifications'}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {String(unreadCount)} {isBangla ? 'নতুন' : 'New'}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.markAllBtn, unreadCount === 0 && styles.markAllBtnDisabled]}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="checkmark-done"
            size={19}
            color={unreadCount > 0 ? '#0F4D3C' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFilter(tab.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {isBangla ? tab.bn : tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification Feed */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor="#00D09C"
            colors={['#0F4D3C', '#00D09C']}
          />
        }
        renderItem={({ item }) => {
          const meta = getNotificationMeta(item, isBangla);
          const previewText = String(item.preview || item.message || '').replace(/\n+/g, ' ');
          const titleText = String(item.title || '');
          const timeText = formatShortTime(item.created_at);
          const isRead = Boolean(item.is_read);

          return (
            <TouchableOpacity
              style={[styles.cardItem, !isRead && styles.cardItemUnread]}
              activeOpacity={0.75}
              onPress={() => handleNotificationPress(item)}
            >
              {/* Unread Left Border Accent */}
              {!isRead && <View style={styles.unreadAccentBar} />}

              {/* Dynamic Category Icon */}
              <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>

              {/* Content Block */}
              <View style={styles.contentWrap}>
                <View style={styles.topMetaRow}>
                  {/* Category Chip */}
                  <View style={[styles.categoryChip, { backgroundColor: meta.badgeBg }]}>
                    <Text style={[styles.categoryChipText, { color: meta.badgeColor }]}>
                      {meta.badge}
                    </Text>
                  </View>

                  {/* Timestamp & Status Dot */}
                  <View style={styles.timeWrap}>
                    <Text style={[styles.timeText, !isRead && styles.timeTextUnread]}>
                      {timeText}
                    </Text>
                    {!isRead ? <View style={styles.statusDot} /> : null}
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={[styles.cardTitle, !isRead && styles.cardTitleUnread]}
                  numberOfLines={1}
                >
                  {titleText}
                </Text>

                {/* Message preview snippet */}
                <Text style={styles.cardPreview} numberOfLines={2}>
                  {previewText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={32} color="#0F4D3C" />
            </View>
            <Text style={styles.emptyTitle}>
              {isBangla ? 'কোন নোটিফিকেশন নেই' : 'No Notifications'}
            </Text>
            <Text style={styles.emptySub}>
              {isBangla
                ? 'আপনার লেনদেন ও অফার সম্পর্কিত যাবতীয় নোটিফিকেশন এখানে পাওয়া যাবে।'
                : 'You are all caught up! Updates regarding your transactions and offers will appear here.'}
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
              {/* Header row */}
              <View style={styles.modalHeaderRow}>
                {(() => {
                  const meta = getNotificationMeta(selectedItem, isBangla);
                  return (
                    <View style={styles.modalHeaderLeft}>
                      <View style={[styles.modalIconWrap, { backgroundColor: meta.bg }]}>
                        <Ionicons name={meta.icon} size={22} color={meta.color} />
                      </View>
                      <View style={[styles.categoryChip, { backgroundColor: meta.badgeBg, marginLeft: 10 }]}>
                        <Text style={[styles.categoryChipText, { color: meta.badgeColor }]}>
                          {meta.badge}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Title & Timestamp */}
              <Text style={styles.modalTitle}>{String(selectedItem.title || '')}</Text>
              <Text style={styles.modalTime}>
                {selectedItem.created_at
                  ? new Date(selectedItem.created_at).toLocaleString()
                  : ''}
              </Text>

              {/* Message body */}
              <View style={styles.modalBodyCard}>
                <Text style={styles.modalMessage}>{String(selectedItem.message || '')}</Text>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionRow}>
                {(() => {
                  const meta = getNotificationMeta(selectedItem, isBangla);
                  const targetScreen = selectedItem.actionScreen || meta.defaultActionScreen;
                  const label = selectedItem.actionLabel || meta.defaultActionLabel;

                  if (targetScreen && label) {
                    return (
                      <TouchableOpacity
                        style={styles.modalActionBtn}
                        onPress={handleAction}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalActionBtnText}>{label}</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color="#FFFFFF"
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    );
                  }
                  return null;
                })()}

                <TouchableOpacity
                  style={[
                    styles.modalDismissBtn,
                    !(selectedItem.actionScreen || getNotificationMeta(selectedItem, isBangla).defaultActionScreen) && {
                      width: '100%',
                    },
                  ]}
                  onPress={() => setSelectedItem(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalDismissBtnText}>
                    {isBangla ? 'বন্ধ করুন' : 'Close'}
                  </Text>
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
    paddingVertical: 12,
    backgroundColor: '#EDF7F4',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: '#0F4D3C',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  markAllBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  markAllBtnDisabled: {
    opacity: 0.6,
  },
  filterWrapper: {
    backgroundColor: '#EDF7F4',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  filterPillActive: {
    backgroundColor: '#0F4D3C',
    borderColor: '#0F4D3C',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
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
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },

  // Premium Card Layout
  cardItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cardItemUnread: {
    backgroundColor: '#FCFFFE',
    borderColor: '#A7F3D0',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: '#00D09C',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentWrap: {
    flex: 1,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
  },
  timeTextUnread: {
    color: '#0F766E',
    fontWeight: '700',
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#00D09C',
  },
  cardTitle: {
    color: '#334155',
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  cardTitleUnread: {
    color: '#0F2F24',
    fontWeight: '800',
  },
  cardPreview: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 16.5,
  },

  // Empty State
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  // Details Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 47, 36, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#0F4D3C',
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
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
    borderRadius: 14,
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
    backgroundColor: '#0F4D3C',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalDismissBtn: {
    flex: 1,
    backgroundColor: '#F6F9F8',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  modalDismissBtnText: {
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
