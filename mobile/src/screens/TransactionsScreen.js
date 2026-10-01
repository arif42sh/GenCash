import React, { useState, useEffect, useCallback } from 'react';
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
import { api } from '../services/api';
import { TransactionItem } from '../components/TransactionItem';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'SEND_MONEY', label: 'Send Money' },
  { id: 'RECHARGE', label: 'Recharge' },
  { id: 'CASH_OUT', label: 'Cash Out' },
  { id: 'MERCHANT_PAYMENT', label: 'Payment' },
  { id: 'ADD_MONEY', label: 'Add Money' },
];

export const TransactionsScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search TxnID, number, or note..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
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
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
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
            tintColor={colors.primaryLight}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={colors.textMuted} />
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
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
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
                    <Text style={styles.statusText}>{selectedTxn.status}</Text>
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
                    {new Date(selectedTxn.transaction_time || selectedTxn.created_at).toLocaleString()}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  filterScrollWrapper: {
    marginBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalAmountBanner: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAmountLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  modalAmount: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  creditText: {
    color: colors.success,
  },
  debitText: {
    color: colors.danger,
  },
  modalDetailsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  codeHighlight: {
    color: colors.textHighlight,
    fontFamily: 'monospace',
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
