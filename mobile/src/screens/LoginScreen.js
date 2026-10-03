import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { DEMO_ACCOUNTS } from '../constants/config';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { ServerConfigModal } from '../components/ServerConfigModal';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('01711111111');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showServerModal, setShowServerModal] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      setErrorMessage('Please enter your mobile number and PIN.');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      await login(phone, password);
      navigation.replace('Main');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (account) => {
    setPhone(account.phone);
    setPassword(account.pin);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header with Server Config */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.serverBtn}
            onPress={() => setShowServerModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="server-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.serverBtnText}>Server IP</Text>
          </TouchableOpacity>
        </View>

        {/* Top Branding */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={32} color={colors.primaryLight} />
          </View>
          <Text style={styles.title}>Welcome to GenCash</Text>
          <Text style={styles.subtitle}>Log in to access your smart digital wallet</Text>
        </View>

        {/* Error Banner */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Form */}
        <View style={styles.form}>
          <CustomInput
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <CustomInput
            label="PIN / Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your PIN"
            icon="lock-closed-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={20}
          />

          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => Alert.alert('Demo Mode', 'Use demo PIN: 123456')}>
              <Text style={styles.forgotText}>Forgot PIN?</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="Log In"
            onPress={handleLogin}
            isLoading={loading}
            iconRight="arrow-forward"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* One-Tap Demo Accounts */}
        <View style={styles.demoSection}>
          <View style={styles.demoDivider}>
            <View style={styles.line} />
            <Text style={styles.demoDividerText}>OR QUICK DEMO LOGIN</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={[
                  styles.demoCard,
                  phone === acc.phone && styles.demoCardSelected,
                ]}
                onPress={() => handleSelectDemoUser(acc)}
              >
                <View style={styles.demoAvatar}>
                  <Text style={styles.demoAvatarText}>
                    {acc.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.demoInfo}>
                  <Text style={styles.demoName}>{acc.name}</Text>
                  <Text style={styles.demoPhone}>{acc.phone}</Text>
                  <Text style={styles.demoBalance}>Simulated: {acc.balance}</Text>
                </View>
                {phone === acc.phone && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.success}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Registration Link */}
        <View style={styles.registerFooter}>
          <Text style={styles.footerText}>Don't have a GenCash account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Server Config Modal */}
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignSelf: 'flex-end',
  },
  serverBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    color: colors.textHighlight,
    fontSize: 12,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 24,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  demoDividerText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  demoGrid: {
    gap: 8,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  demoCardSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(30, 111, 159, 0.08)',
  },
  demoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  demoAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  demoPhone: {
    color: colors.textMuted,
    fontSize: 11,
  },
  demoBalance: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  registerFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  registerLink: {
    color: colors.textHighlight,
    fontSize: 13,
    fontWeight: '700',
  },
});
