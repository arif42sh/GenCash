import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const TYPE_CONFIG = {
  SEND_MONEY: {
    icon: 'paper-plane',
    label: 'Send Money',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  CASH_OUT: {
    icon: 'cash',
    label: 'Cash Out',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  RECHARGE: {
    icon: 'phone-portrait',
    label: 'Recharge',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  ADD_MONEY: {
    icon: 'card',
    label: 'Add Money',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  MERCHANT_PAYMENT: {
    icon: 'cart',
    label: 'Payment',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  RECEIVE_MONEY: {
    icon: 'arrow-down-circle',
    label: 'Received',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
};

export const TransactionItem = ({ transaction, onPress }) => {
  if (!transaction) return null;

  const config = TYPE_CONFIG[transaction.transaction_type] || {
    icon: 'receipt',
    label: transaction.transaction_type,
    color: colors.primary,
    bgColor: 'rgba(37, 99, 235, 0.15)',
  };

  const isCredit = transaction.direction === 'CREDIT';
  const amountFormatted = Number(transaction.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const displayTitle = () => {
    if (transaction.transaction_type === 'SEND_MONEY') {
      return isCredit
        ? `Received from ${transaction.sender_name || transaction.sender_phone || 'User'}`
        : `Sent to ${transaction.receiver_name || transaction.receiver_phone || 'User'}`;
    }
    if (transaction.transaction_type === 'RECHARGE') {
      return `Recharge • ${transaction.operator || transaction.recipient_phone || 'Mobile'}`;
    }
    if (transaction.transaction_type === 'MERCHANT_PAYMENT') {
      return `Paid to ${transaction.merchant_name || 'Merchant'}`;
    }
    if (transaction.transaction_type === 'ADD_MONEY') {
      return 'Added to Wallet';
    }
    if (transaction.transaction_type === 'CASH_OUT') {
      return `Cash Out (${transaction.recipient_phone || 'Agent'})`;
    }
    return config.label;
  };

  const dateObj = new Date(transaction.transaction_time || transaction.created_at);
  const timeStr = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => onPress && onPress(transaction)}
    >
      <View style={[styles.iconWrapper, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle()}
        </Text>
        <Text style={styles.timestamp}>{timeStr}</Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>
            💬 {transaction.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isCredit ? styles.creditAmount : styles.debitAmount,
          ]}
        >
          {isCredit ? '+৳' : '-৳'} {amountFormatted}
        </Text>
        {transaction.fee > 0 && !isCredit && (
          <Text style={styles.feeText}>Fee: ৳{transaction.fee.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  creditAmount: {
    color: colors.success,
  },
  debitAmount: {
    color: colors.danger,
  },
  feeText: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
