import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export const BalanceCard = ({
  balance = 0,
  currency = 'BDT',
  onRefresh,
  onAction,
  onOpenQR,
}) => {
  const [isRevealed, setIsRevealed] = useState(true);
  const { t, toBengaliNumber, isBangla } = useLanguage();

  const handleToggle = () => {
    setIsRevealed((prev) => !prev);
  };

  const rawFormatted = Number(balance || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedBalance = toBengaliNumber(rawFormatted);

  return (
    <LinearGradient
      colors={['#164E3D', '#256F57']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardContainer}
    >
      {/* Top Row: Wallet label & QR Code button */}
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <Ionicons name="wallet-outline" size={16} color="#A7D8CA" style={{ marginRight: 6 }} />
          <Text style={styles.walletLabel}>{t('availableBalance', 'Your wallet Balance')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.qrButton}
          onPress={onOpenQR}
        >
          <Ionicons name="qr-code-outline" size={20} color="#34D399" />
        </TouchableOpacity>
      </View>

      {/* Middle Row: Large Balance */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleToggle}
        style={styles.balanceRow}
      >
        <Text style={styles.currencySymbol}>৳</Text>
        {isRevealed ? (
          <Text style={styles.balanceText}>{formattedBalance}</Text>
        ) : (
          <Text style={styles.balanceHiddenText}>••••••••</Text>
        )}
        <Ionicons
          name={isRevealed ? 'eye-outline' : 'eye-off-outline'}
          size={18}
          color="#A7D8CA"
          style={styles.eyeIcon}
        />
      </TouchableOpacity>

      {/* Bottom 5 Quick-Action Round Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={handleToggle}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="cash-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{isBangla ? 'ব্যালেন্স' : 'Balance'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('AddMoney')}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{t('addMoney', 'Add Money')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('SendMoney')}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{isBangla ? 'সেন্ড' : 'Send'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={onOpenQR}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="arrow-down" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{isBangla ? 'রিসিভ' : 'Receive'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('Transactions')}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="time-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{isBangla ? 'হিস্টোরি' : 'History'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#164E3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletLabel: {
    color: '#A7D8CA',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  qrButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginRight: 6,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceHiddenText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionLabel: {
    color: '#D1EFE6',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
