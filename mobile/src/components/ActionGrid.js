import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const ACTIONS = [
  {
    id: 'send_money',
    title: 'Send Money',
    subtitle: 'Free P2P',
    icon: 'paper-plane-outline',
    color: '#064E3B',
    bgColor: colors.surfaceLight,
    screen: 'SendMoney',
  },
  {
    id: 'recharge',
    title: 'Recharge',
    subtitle: '10% Cashback',
    icon: 'phone-portrait-outline',
    color: '#00D09C',
    bgColor: colors.surfaceLight,
    screen: 'MobileRecharge',
    badge: 'Offer',
  },
  {
    id: 'cash_out',
    title: 'Cash Out',
    subtitle: 'Agent Point',
    icon: 'cash-outline',
    color: '#043227',
    bgColor: colors.surfaceLight,
    screen: 'CashOut',
  },
  {
    id: 'add_money',
    title: 'Add Money',
    subtitle: 'Bank / Card',
    icon: 'card-outline',
    color: '#0D9488',
    bgColor: colors.surfaceLight,
    screen: 'AddMoney',
  },
  {
    id: 'payment',
    title: 'Payment',
    subtitle: 'Merchant QR',
    icon: 'cart-outline',
    color: '#065F46',
    bgColor: colors.surfaceLight,
    screen: 'MerchantPayment',
  },
  {
    id: 'ai_hub',
    title: 'AI Insights',
    subtitle: 'Smart Intel',
    icon: 'sparkles-outline',
    color: '#00D09C',
    bgColor: 'rgba(0, 208, 156, 0.18)',
    screen: 'AIHub',
    badge: 'AI ✨',
  },
];

export const ActionGrid = ({ onSelectAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.grid}>
        {ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={styles.actionCard}
            onPress={() => onSelectAction(item.screen)}
          >
            {item.badge && (
              <View style={[styles.actionBadge, item.id === 'ai_hub' ? styles.aiBadge : null]}>
                <Text style={styles.actionBadgeText}>{item.badge}</Text>
              </View>
            )}
            <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.danger,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  aiBadge: {
    backgroundColor: colors.aiPrimary,
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
