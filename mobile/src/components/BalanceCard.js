import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const BalanceCard = ({ balance = 0, currency = 'BDT', onRefresh }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleToggle = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      // Auto hide balance after 6 seconds
      setTimeout(() => {
        setIsRevealed(false);
      }, 6000);
    } else {
      setIsRevealed(false);
    }
  };

  const formattedBalance = Number(balance || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>MFS Active Wallet</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleToggle}
        style={styles.balancePill}
      >
        <View style={styles.pillIconContainer}>
          <Ionicons
            name={isRevealed ? "eye-off" : "eye"}
            size={18}
            color={colors.primaryLight}
          />
        </View>

        {isRevealed ? (
          <View style={styles.balanceContent}>
            <Text style={styles.currencySymbol}>৳</Text>
            <Text style={styles.balanceText}>{formattedBalance}</Text>
          </View>
        ) : (
          <View style={styles.hiddenContent}>
            <Text style={styles.tapToRevealText}>Tap for Balance</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.subHint}>
        {isRevealed ? "Tap again or wait to hide" : "Available in your primary account"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  badgeText: {
    color: colors.textHighlight,
    fontSize: 12,
    fontWeight: '600',
  },
  refreshBtn: {
    padding: 4,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignSelf: 'flex-start',
    minWidth: 200,
  },
  pillIconContainer: {
    marginRight: 10,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    color: colors.success,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 4,
  },
  balanceText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hiddenContent: {
    justifyContent: 'center',
  },
  tapToRevealText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  subHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
});
