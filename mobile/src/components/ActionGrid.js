import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const SERVICES = [
  {
    id: 'recharge',
    translationKey: 'recharge',
    title: 'Recharge',
    type: 'ionicon',
    icon: 'flash-outline',
    screen: 'MobileRecharge',
  },
  {
    id: 'bill_pay',
    translationKey: 'billPay',
    title: 'Bill Pay',
    type: 'material',
    icon: 'receipt-text-outline',
    screen: 'MerchantPayment',
    params: { mode: 'bill_pay' },
  },
  {
    id: 'bank_transfer',
    translationKey: 'bankTransfer',
    title: 'Bank Transfer',
    type: 'material',
    icon: 'bank-outline',
    screen: 'SendMoney',
  },
  {
    id: 'savings',
    translationKey: 'savings',
    title: 'Savings',
    type: 'material',
    icon: 'piggy-bank-outline',
    screen: 'AddMoney',
  },
  {
    id: 'electricity',
    translationKey: 'electricity',
    title: 'Electricity',
    type: 'ionicon',
    icon: 'bulb-outline',
    screen: 'MerchantPayment',
    params: { mode: 'bill_pay' },
  },
  {
    id: 'movie',
    translationKey: 'movie',
    title: 'Movie',
    type: 'material',
    icon: 'movie-open-outline',
    screen: 'MerchantPayment',
    params: { mode: 'merchant' },
  },
  {
    id: 'merchant',
    translationKey: 'merchant',
    title: 'Merchant',
    type: 'material',
    icon: 'storefront-outline',
    screen: 'MerchantPayment',
    params: { mode: 'merchant' },
  },
];

export const ActionGrid = ({ onSelectAction }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('otherServices', 'Other Services')}</Text>
      <View style={styles.grid}>
        {SERVICES.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            style={styles.tileItem}
            onPress={() => onSelectAction && onSelectAction(item.screen, item.params || {})}
          >
            <View style={styles.iconBox}>
              {item.type === 'material' ? (
                <MaterialCommunityIcons name={item.icon} size={24} color="#0F4D3C" />
              ) : (
                <Ionicons name={item.icon} size={24} color="#0F4D3C" />
              )}
            </View>
            <Text style={styles.tileTitle} numberOfLines={1}>
              {t(item.translationKey, item.title)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginLeft: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tileItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E8F3EE',
    borderWidth: 1,
    borderColor: '#D4EAE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tileTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F2F24',
    textAlign: 'center',
  },
});
