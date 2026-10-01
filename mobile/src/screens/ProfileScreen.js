import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, wallet, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of GenCash?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '01XXXXXXXXX'}</Text>
          {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}

          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.verifiedText}>AI-Verified Account</Text>
          </View>
        </View>

        {/* My Receive Money QR Code Simulator */}
        <View style={styles.qrCard}>
          <Text style={styles.qrCardTitle}>Receive Money QR Code</Text>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={120} color={colors.primaryLight} />
            <Text style={styles.qrPhoneText}>{user?.phone}</Text>
          </View>
          <Text style={styles.qrHint}>
            Friends can scan this QR code or use your phone number to send money instantly.
          </Text>
        </View>

        {/* Account Settings Menu */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Security', 'PIN changes enabled.')}
          >
            <Ionicons name="lock-closed-outline" size={20} color={colors.textHighlight} />
            <Text style={styles.menuText}>Change Account PIN</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('GenCash Platform', 'AI Hackathon 2026 Prototype (DIU CPC × upay)\nVersion 1.0.0')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#C084FC" />
            <Text style={styles.menuText}>About GenCash & Hackathon 2026</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Support Helpline', 'Simulated 24/7 Helpline: 16247')}
          >
            <Ionicons name="help-buoy-outline" size={20} color={colors.warning} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out of GenCash</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  userPhone: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  verifiedText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  qrCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  qrPhoneText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 4,
  },
  qrHint: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 260,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
