import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import GenCashLogo from './GenCashLogo';

const HERITAGE_BG = require('../assets/header_bangladesh_heritage.jpg');

const getTimeGreeting = (isBangla) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return isBangla ? 'শুভ সকাল!' : 'Good Morning!';
  } else if (hour >= 12 && hour < 17) {
    return isBangla ? 'শুভ দুপুর!' : 'Good Afternoon!';
  } else if (hour >= 17 && hour < 21) {
    return isBangla ? 'শুভ সন্ধ্যা!' : 'Good Evening!';
  } else {
    return isBangla ? 'শুভ রাত্রি!' : 'Good Night!';
  }
};

export default function AppHeader({
  userName = 'Tanvir',
  userAvatar = null,
  unreadNotifCount = 3,
  onOpenProfile,
  onOpenNotif,
  onOpenSettings,
  t: customT,
}) {
  const { toggleLanguage, isBangla, t: contextT } = useLanguage();
  const t = customT || contextT;

  // Dynamically account for Android status bar without redundant extra margin
  const statusBarHeight =
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  return (
    <View style={[styles.headerContainer, { paddingTop: statusBarHeight + 2 }]}>
      {/* 1. Background Artwork & Gradient Overlay */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={HERITAGE_BG}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Linear Gradient Overlay: Fades smoothly to screen background color */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(237, 247, 244, 0.15)',
            'rgba(237, 247, 244, 0.75)',
            '#EDF7F4',
          ]}
          locations={[0, 0.45, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Tier 1: Top Utility Action Bar with Brand Logo */}
      <View style={styles.topUtilityRow}>
        {/* Brand Logo Wordmark */}
        <View style={styles.logoWrapper}>
          <GenCashLogo width={115} height={23} />
        </View>

        {/* Right Utility Actions */}
        <View style={styles.topActionGroup}>
          {/* Language Switch Capsule (ENG | বাং) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleLanguage}
            style={styles.langToggle}
          >
            <Text
              style={[
                styles.langText,
                !isBangla && styles.activeLangText,
              ]}
            >
              ENG
            </Text>
            <Text style={styles.langDivider}>|</Text>
            <Text
              style={[
                styles.langText,
                isBangla && styles.activeLangText,
              ]}
            >
              বাং
            </Text>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenNotif}
            style={styles.iconCircle}
          >
            <Ionicons name="notifications-outline" size={18} color="#0F4D3C" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {String(unreadNotifCount > 0 ? unreadNotifCount : 3)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Settings Gear */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSettings}
            style={styles.iconCircle}
          >
            <Ionicons name="settings-outline" size={18} color="#0F4D3C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Tier 2: User Profile & Greeting Row (Full width & unobstructed) */}
      <View style={styles.profileRow}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatarPhoto}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarText}>
              {userName ? userName.charAt(0).toUpperCase() : 'T'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.greetingContainer}
          onPress={onOpenProfile}
          activeOpacity={0.9}
        >
          <View style={styles.textPill}>
            <Text style={styles.greetingSub} numberOfLines={1}>
              {isBangla ? 'হ্যালো' : 'Hello'} {userName},
            </Text>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              {getTimeGreeting(isBangla)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 2,
    justifyContent: 'flex-start',
    position: 'relative',
    backgroundColor: '#EDF7F4',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.88,
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 4,
    marginBottom: 8,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    elevation: 2,
    shadowColor: '#0F4D3C',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 2,
  },
  activeLangText: {
    color: '#0A4435',
    fontWeight: '800',
  },
  langDivider: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 1,
  },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFEFE8',
    elevation: 2,
    shadowColor: '#0F4D3C',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  greetingContainer: {
    marginLeft: 10,
    flex: 1,
  },
  textPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  greetingSub: {
    fontSize: 12,
    color: '#0F4D3C',
    fontWeight: '600',
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#083327',
    letterSpacing: -0.2,
  },
});
