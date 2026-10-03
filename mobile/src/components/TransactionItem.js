import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const TYPE_CONFIG = {
  SEND_MONEY: {
    icon: 'paper-plane',
    label: 'Send Money',
    tagColor: '#00B887',
    avatarBg: '#E8F7F0',
  },
  CASH_OUT: {
    icon: 'cash',
    label: 'Cashout',
    tagColor: '#F43F5E',
    avatarBg: '#FCEEF0',
  },
  RECHARGE: {
    icon: 'phone-portrait',
    label: 'Recharge',
    tagColor: '#10B981',
    avatarBg: '#E8F7F0',
  },
  ADD_MONEY: {
    icon: 'card',
    label: 'Add Money',
    tagColor: '#00D09C',
    avatarBg: '#EAF6F5',
  },
  MERCHANT_PAYMENT: {
    icon: 'cart',
    label: 'Payment',
    tagColor: '#8B5CF6',
    avatarBg: '#F0EDFA',
  },
  RECEIVE_MONEY: {
    icon: 'arrow-down-circle',
    label: 'Received',
    tagColor: '#10B981',
    avatarBg: '#E8F7F0',
  },
  BILL_PAYMENT: {
    icon: 'flash',
    label: 'Bill Pay',
    tagColor: '#7C3AED',
    avatarBg: '#EDE9FE',
  },
};

export const TransactionItem = ({ transaction, onPress }) => {
  if (!transaction) return null;

  const config = TYPE_CONFIG[transaction.transaction_type] || {
    icon: 'receipt',
    label: transaction.transaction_type,
    tagColor: '#00B887',
    avatarBg: '#E8F7F0',
  };

  const isCredit = transaction.direction === 'CREDIT';
  const amountFormatted = Number(transaction.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const getDisplayName = () => {
    if (transaction.transaction_type === 'SEND_MONEY') {
      return isCredit
        ? (transaction.sender_name || transaction.sender_phone || 'Customer')
        : (transaction.receiver_name || transaction.receiver_phone || 'Recipient');
    }
    if (transaction.transaction_type === 'RECHARGE') {
      return transaction.operator ? `${transaction.operator} Top-up` : (transaction.recipient_phone || 'Mobile Topup');
    }
    if (transaction.transaction_type === 'MERCHANT_PAYMENT') {
      return transaction.merchant_name || 'Merchant Store';
    }
    if (transaction.transaction_type === 'BILL_PAYMENT') {
      return transaction.note || 'Utility Bill Payment';
    }
    if (transaction.transaction_type === 'ADD_MONEY') {
      return transaction.note || 'Bank Deposit';
    }
    if (transaction.transaction_type === 'CASH_OUT') {
      return transaction.recipient_phone ? `Agent (${transaction.recipient_phone})` : 'Agent Cashout';
    }
    return config.label;
  };

  const dateObj = new Date(transaction.transaction_time || transaction.created_at);
  const timeStr = dateObj.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const initialLetter = getDisplayName().charAt(0).toUpperCase() || 'T';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => onPress && onPress(transaction)}
    >
      {/* Left Avatar circle */}
      <View style={[styles.avatarCircle, { backgroundColor: config.avatarBg }]}>
        <Text style={[styles.avatarLetter, { color: config.tagColor }]}>
          {initialLetter}
        </Text>
      </View>

      {/* Center Details */}
      <View style={styles.details}>
        <Text style={styles.personName} numberOfLines={1}>
          {getDisplayName()}
        </Text>
        <Text style={[styles.typeTag, { color: config.tagColor }]}>
          {config.label}
        </Text>
      </View>

      {/* Right Amount & Timestamp */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isCredit ? styles.creditAmount : styles.debitAmount,
          ]}
        >
          {isCredit ? '+৳' : '-৳'}{amountFormatted}
        </Text>
        <Text style={styles.timestamp}>{timeStr}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  personName: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  typeTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  creditAmount: {
    color: '#10B981',
  },
  debitAmount: {
    color: '#F43F5E',
  },
  timestamp: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
});
