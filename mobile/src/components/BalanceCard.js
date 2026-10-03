import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

  const displayAmount = (balance !== undefined && balance !== null && !isNaN(Number(balance)))
    ? Number(balance)
    : 0.00;

  const rawFormatted = Number(displayAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedBalance = toBengaliNumber(rawFormatted);

  return (
    <LinearGradient
      colors={['#083D30', '#0B4D3D', '#0E5846']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardContainer}
    >
      {/* Top Row: "Your Wallet Balance" label & "Mini QR" pill */}
      <View style={styles.topRow}>
        <Text style={styles.walletLabel}>
          {isBangla ? 'আপনার ওয়ালেট ব্যালেন্স' : 'Your Wallet Balance'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.miniQrPill}
          onPress={onOpenQR}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={13} color="#C2E7DD" style={{ marginRight: 4 }} />
          <Text style={styles.miniQrText}>Mini QR</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Row: Large Balance with Eye Toggle */}
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
          size={20}
          color="#B8DFD5"
          style={styles.eyeIcon}
        />
      </TouchableOpacity>

      {/* Bottom Row: 4 Circular Quick Action Buttons (Add Money, Send, Receive, History) */}
      <View style={styles.actionsRow}>
        {/* 1. Add Money */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('AddMoney')}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="add" size={24} color="#34D399" />
          </View>
          <Text style={styles.actionLabel}>
            {isBangla ? 'অ্যাড মানি' : 'Add Money'}
          </Text>
        </TouchableOpacity>

        {/* 2. Send */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('SendMoney')}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons
              name="paper-plane-outline"
              size={20}
              color="#34D399"
              style={{ transform: [{ rotate: '-15deg' }] }}
            />
          </View>
          <Text style={styles.actionLabel}>
            {isBangla ? 'সেন্ড' : 'Send'}
          </Text>
        </TouchableOpacity>

        {/* 3. Receive */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={onOpenQR}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="download-outline" size={21} color="#34D399" />
          </View>
          <Text style={styles.actionLabel}>
            {isBangla ? 'রিসিভ' : 'Receive'}
          </Text>
        </TouchableOpacity>

        {/* 4. History */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.actionItem}
          onPress={() => onAction && onAction('Transactions')}
        >
          <View style={styles.actionIconCircle}>
            <MaterialCommunityIcons name="history" size={23} color="#34D399" />
          </View>
          <Text style={styles.actionLabel}>
            {isBangla ? 'হিস্টোরি' : 'History'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#073E31',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletLabel: {
    color: '#B8DFD5',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  miniQrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  miniQrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginRight: 6,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceHiddenText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 4,
  },
  eyeIcon: {
    marginLeft: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  actionLabel: {
    color: '#D1EFE6',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
