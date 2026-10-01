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

export const HomeScreen = ({ navigation }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTxns, setRecentTxns] = useState([]);
  const [primaryInsight, setPrimaryInsight] = useState(null);
  const [offers, setOffers] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>Good Day,</Text>
            <Text style={styles.userNameText}>{user?.name || 'GenCash User'}</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AIHub')}
          >
            <Ionicons name="sparkles" size={20} color={colors.aiPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Notifications', `${unreadNotifCount} unread system notifications.`)}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
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
            tintColor={colors.primaryLight}
          />
        }
      >
        {/* Wallet Balance Card */}
        <BalanceCard
          balance={wallet?.balance || 0}
          currency={wallet?.currency || 'BDT'}
          onRefresh={onRefresh}
        />

        {/* Action Grid (6 Services) */}
        <ActionGrid onSelectAction={handleActionSelect} />

        {/* AI Insight Teaser Card */}
        {primaryInsight ? (
          <AIInsightCard
            insight={primaryInsight}
            onExplore={() => navigation.navigate('AIHub')}
            onFeedback={handleAIFeedback}
          />
        ) : null}

        {/* Active Offers Section */}
        {offers.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Exclusive Offers</Text>
              <TouchableOpacity onPress={() => Alert.alert('Offers', 'Explore all campaign promos.')}>
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
                    <Text style={styles.claimBtnText}>Use Offer</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textHighlight} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTxns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    justifyContent: 'center',
  },
  greetingText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  userNameText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
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
    marginHorizontal: 16,
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    color: colors.textHighlight,
    fontSize: 13,
    fontWeight: '600',
  },
  offersScroll: {
    paddingBottom: 6,
  },
  offerCard: {
    width: 240,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  offerBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  offerTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  offerDesc: {
    color: colors.textSecondary,
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
    color: colors.textHighlight,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
});
