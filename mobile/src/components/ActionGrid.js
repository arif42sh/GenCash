import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const SERVICES = [
  {
    id: 'recharge',
    title: 'Recharge',
    icon: 'phone-portrait-outline',
    iconColor: '#10B981',
    bgColor: '#E8F7F0',
    screen: 'MobileRecharge',
  },
  {
    id: 'bill_pay',
    title: 'Bill Pay',
    icon: 'receipt-outline',
    iconColor: '#F59E0B',
    bgColor: '#FEF5E7',
    screen: 'MerchantPayment',
  },
  {
    id: 'bank_transfer',
    title: 'Bank Transfer',
    icon: 'business-outline',
    iconColor: '#F43F5E',
    bgColor: '#FCEEF0',
    screen: 'SendMoney',
  },
  {
    id: 'savings',
    title: 'Savings',
    icon: 'shield-checkmark-outline',
    iconColor: '#8B5CF6',
    bgColor: '#F0EDFA',
    screen: 'AIHub',
  },
  {
    id: 'electricity',
    title: 'Electricity',
    icon: 'flash-outline',
    iconColor: '#EF4444',
    bgColor: '#FDEEEE',
    screen: 'MerchantPayment',
  },
  {
    id: 'movie',
    title: 'Movie',
    icon: 'film-outline',
    iconColor: '#A855F7',
    bgColor: '#F4EEFA',
    screen: 'MerchantPayment',
  },
  {
    id: 'add_money',
    title: 'Add Money',
    icon: 'card-outline',
    iconColor: '#00D09C',
    bgColor: '#EAF6F5',
    screen: 'AddMoney',
  },
  {
    id: 'others',
    title: 'Others',
    icon: 'sparkles-outline',
    iconColor: '#D97706',
    bgColor: '#FEFBE8',
    screen: 'AIHub',
    badge: 'AI',
  },
];

export const ActionGrid = ({ onSelectAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Other Services</Text>
      <View style={styles.grid}>
        {SERVICES.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={styles.tileItem}
            onPress={() => onSelectAction(item.screen)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={22} color={item.iconColor} />
              {item.badge && (
                <View style={styles.tileBadge}>
                  <Text style={styles.tileBadgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.tileTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
    marginLeft: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  tileTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  tileBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00D09C',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tileBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
});
