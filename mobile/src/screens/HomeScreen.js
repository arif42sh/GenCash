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
import { api } from '../services/api';
import { BalanceCard } from '../components/BalanceCard';
import { ActionGrid } from '../components/ActionGrid';
import { AIInsightCard } from '../components/AIInsightCard';
import { TransactionItem } from '../components/TransactionItem';
import { QRScannerModal } from '../components/QRScannerModal';

export const HomeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTxns, setRecentTxns] = useState([]);
  const [primaryInsight, setPrimaryInsight] = useState(null);
  const [offers, setOffers] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      await refreshWallet();

      // Load recent transactions
      const txnData = await api.getTransactions(null, 5, 0);
      setRecentTxns(txnData.transactions || []);

      // Load AI intelligence
      const aiData = await api.getAIRecommendations();
      if (aiData && aiData.primary_insight) {
        setPrimaryInsight(aiData.primary_insight);
      }

      // Load offers
      const offerData = await api.getOffers();
      setOffers(offerData || []);

      // Load notifications count
      const notifData = await api.getNotifications();
      const unread = notifData.filter((n) => !n.is_read).length;
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

  const handleAIFeedback = async (insightId, action) => {
    try {
      await api.submitAIFeedback(insightId, action);
      Alert.alert('Thank you!', 'Your feedback helps train the GenCash AI engine.');
    } catch (e) {}
  };

  const handleQRScanned = (scannedData) => {
    setShowQRScanner(false);
    navigation.navigate('MerchantPayment');
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Jixan';

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <View style={styles.userProfileRow}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>Hello {userName},</Text>
            <Text style={styles.userNameText}>Welcome Back!</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Notifications', `${unreadNotifCount} unread system notifications.`)}
          >
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifCount}</Text>
              </View>
            )}
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
        {/* Wallet Balance Card (Pine Green Hero Card) */}
        <BalanceCard
          balance={wallet?.balance || 0}
          currency={wallet?.currency || 'BDT'}
          onRefresh={onRefresh}
          onAction={handleActionSelect}
          onOpenQR={() => setShowQRScanner(true)}
        />

        {/* Other Services (8 Pastel Icon Grid) */}
        <ActionGrid onSelectAction={handleActionSelect} />

        {/* AI Insight Teaser Card */}
        {primaryInsight ? (
          <AIInsightCard
            insight={primaryInsight}
            onExplore={() => navigation.navigate('AIHub')}
            onFeedback={handleAIFeedback}
          />
        ) : null}

        {/* Great Deals / Offers Section */}
        {offers.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Great Deals</Text>
              <TouchableOpacity onPress={() => Alert.alert('Deals', 'Explore all deals & discounts.')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersScroll}>
              {offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>{offer.offer_type}</Text>
                  </View>
                  <Text style={styles.offerTitle} numberOfLines={2}>
                    {offer.title}
                  </Text>
                  <Text style={styles.offerDesc} numberOfLines={2}>
                    {offer.description}
                  </Text>
                  <TouchableOpacity
                    style={styles.claimBtn}
                    onPress={() => {
                      if (offer.offer_type === 'CASHBACK') {
                        navigation.navigate('MobileRecharge');
                      } else {
                        navigation.navigate('SendMoney');
                      }
                    }}
                  >
                    <Text style={styles.claimBtnText}>Claim Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#00B887" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Transactions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTxns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyText}>No recent transactions found.</Text>
            </View>
          ) : (
            recentTxns.map((txn) => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                onPress={() => navigation.navigate('Transactions')}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
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
    backgroundColor: '#F3F9F6',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F3F9F6',
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
  sectionContainer: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 16,
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  seeAllText: {
    color: '#00B887',
    fontSize: 13,
    fontWeight: '600',
  },
  offersScroll: {
    paddingLeft: 16,
    paddingBottom: 6,
  },
  offerCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 208, 156, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  offerBadgeText: {
    color: '#00B887',
    fontSize: 10,
    fontWeight: '700',
  },
  offerTitle: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  offerDesc: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  claimBtnText: {
    color: '#00B887',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
});
