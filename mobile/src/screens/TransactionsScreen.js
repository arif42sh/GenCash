import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { TransactionItem } from '../components/TransactionItem';

const FILTERS = [
  { id: 'ALL', label: 'All', bn: 'সব' },
  { id: 'SEND_MONEY', label: 'Send Money', bn: 'সেন্ড মানি' },
  { id: 'RECHARGE', label: 'Recharge', bn: 'রিচার্জ' },
  { id: 'CASH_OUT', label: 'Cash Out', bn: 'ক্যাশ আউট' },
  { id: 'RECEIVED', label: 'Received', bn: 'প্রাপ্ত মানি' },
  { id: 'MERCHANT_PAYMENT', label: 'Payment', bn: 'পেমেন্ট' },
  { id: 'ADD_MONEY', label: 'Add Money', bn: 'টাকা যোগ' },
];

export const TransactionsScreen = ({ navigation }) => {
  const { isBangla } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions(selectedFilter === 'ALL' ? null : selectedFilter, 100, 0);
      setTransactions(res.transactions || []);
    } catch (e) {
      console.warn('Failed to load transactions:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Monthly Analytics Calculation (Money In vs Money Out)
  const monthlyStats = useMemo(() => {
    let moneyIn = 0;
    let moneyOut = 0;

    transactions.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.direction === 'CREDIT' || t.transaction_type === 'ADD_MONEY' || t.transaction_type === 'RECEIVED') {
        moneyIn += amt;
      } else {
        moneyOut += amt;
      }
    });

    const total = moneyIn + moneyOut;
    const inPercent = total > 0 ? (moneyIn / total) * 100 : 50;
    const outPercent = total > 0 ? (moneyOut / total) * 100 : 50;

    return {
      moneyIn,
      moneyOut,
      net: moneyIn - moneyOut,
      inPercent,
      outPercent,
    };
  }, [transactions]);

  const filteredTxns = transactions.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (t.transaction_code && t.transaction_code.toLowerCase().includes(query)) ||
      (t.recipient_phone && t.recipient_phone.includes(query)) ||
      (t.sender_name && t.sender_name.toLowerCase().includes(query)) ||
      (t.receiver_name && t.receiver_name.toLowerCase().includes(query)) ||
      (t.merchant_name && t.merchant_name.toLowerCase().includes(query)) ||
      (t.note && t.note.toLowerCase().includes(query))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {navigation?.canGoBack?.() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#0F4D3C" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 10 }} />
        )}
        <Text style={styles.headerTitle}>{isBangla ? 'লেনদেন বিবরণী' : 'Transaction History'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredTxns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={(txn) => setSelectedTxn(txn)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1B4D3E"
          />
        }
        ListHeaderComponent={
          <View>
            {/* Monthly Money In vs Money Out Analytics Widget */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <View style={styles.analyticsTitleWrap}>
                  <Ionicons name="bar-chart-outline" size={16} color="#1B4D3E" />
                  <Text style={styles.analyticsTitle}>Monthly Money Flow</Text>
                </View>
                <Text style={styles.monthBadge}>This Month</Text>
              </View>

              <View style={styles.flowRow}>
                {/* Money In */}
                <View style={styles.flowBox}>
                  <View style={styles.flowLabelRow}>
                    <Ionicons name="arrow-down-circle" size={16} color="#00D09C" />
                    <Text style={styles.flowLabel}>Money In</Text>
                  </View>
                  <Text style={styles.moneyInAmount}>
                    +৳{monthlyStats.moneyIn.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Money Out */}
                <View style={styles.flowBox}>
                  <View style={styles.flowLabelRow}>
                    <Ionicons name="arrow-up-circle" size={16} color="#EF4444" />
                    <Text style={styles.flowLabel}>Money Out</Text>
                  </View>
                  <Text style={styles.moneyOutAmount}>
                    -৳{monthlyStats.moneyOut.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>

              {/* Visual Comparison Ratio Bar */}
              <View style={styles.ratioBarContainer}>
                <View style={[styles.ratioBarIn, { flex: monthlyStats.inPercent || 1 }]} />
                <View style={[styles.ratioBarOut, { flex: monthlyStats.outPercent || 1 }]} />
              </View>

              <View style={styles.ratioLabelRow}>
                <Text style={styles.ratioLabelText}>{Math.round(monthlyStats.inPercent)}% Inflow</Text>
                <Text style={styles.ratioLabelText}>{Math.round(monthlyStats.outPercent)}% Outflow</Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search TxnID, number, or note..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Horizontal Scroll */}
            <View style={styles.filterScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.filterPill,
                      selectedFilter === f.id && styles.filterPillActive,
                    ]}
                    onPress={() => setSelectedFilter(f.id)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === f.id && styles.filterTextActive,
                      ]}
                    >
                      {isBangla ? f.bn : f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? 'No transactions matching your search term.'
                  : 'You have not made any transactions in this category yet.'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setSelectedTxn(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <TouchableOpacity onPress={() => setSelectedTxn(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalAmountBanner}>
                <Text style={styles.modalAmountLabel}>
                  {selectedTxn.direction === 'CREDIT' ? 'Credited to Wallet' : 'Debited from Wallet'}
                </Text>
                <Text
                  style={[
                    styles.modalAmount,
                    selectedTxn.direction === 'CREDIT' ? styles.creditText : styles.debitText,
                  ]}
                >
                  {selectedTxn.direction === 'CREDIT' ? '+৳ ' : '-৳ '}
                  {Number(selectedTxn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.modalDetailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{selectedTxn.transaction_type}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{selectedTxn.status || 'COMPLETED'}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={[styles.detailValue, styles.codeHighlight]}>{selectedTxn.transaction_code}</Text>
                </View>

                {selectedTxn.fee > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Fee</Text>
                    <Text style={styles.detailValue}>৳ {Number(selectedTxn.fee).toFixed(2)}</Text>
                  </View>
                )}

                {selectedTxn.recipient_phone && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Recipient / Mobile</Text>
                    <Text style={styles.detailValue}>{selectedTxn.recipient_phone}</Text>
                  </View>
                )}

                {selectedTxn.operator && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Operator</Text>
                    <Text style={styles.detailValue}>{selectedTxn.operator}</Text>
                  </View>
                )}

                {selectedTxn.note && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Note</Text>
                    <Text style={styles.detailValue}>{selectedTxn.note}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedTxn.transaction_time || selectedTxn.created_at || Date.now()).toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedTxn(null)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerTitle: {
    color: '#0F4D3C',
    fontSize: 18,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analyticsTitle: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '800',
  },
  monthBadge: {
    backgroundColor: '#E8F6F1',
    color: '#0F4D3C',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flowBox: {
    flex: 1,
  },
  flowLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  flowLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  moneyInAmount: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '900',
  },
  moneyOutAmount: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '900',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#DFEFE8',
    marginHorizontal: 16,
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#DFEFE8',
    marginBottom: 6,
  },
  ratioBarIn: {
    backgroundColor: '#059669',
  },
  ratioBarOut: {
    backgroundColor: '#EF4444',
  },
  ratioLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioLabelText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F2F24',
    fontSize: 13,
  },
  filterScrollWrapper: {
    marginBottom: 12,
  },
  filtersScroll: {
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#0F2F24',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalAmountBanner: {
    backgroundColor: '#F8FCFA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  modalAmountLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  modalAmount: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  creditText: {
    color: '#00D09C',
  },
  debitText: {
    color: '#EF4444',
  },
  modalDetailsCard: {
    backgroundColor: '#F8FCFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  detailValue: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '600',
  },
  codeHighlight: {
    color: '#1B4D3E',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  statusPill: {
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: '#00D09C',
    fontSize: 11,
    fontWeight: '800',
  },
  modalCloseBtn: {
    backgroundColor: '#1B4D3E',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
