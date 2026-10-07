import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      setErrorMessage('Please fill in all required fields (Name, Phone, PIN).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('PIN/Password and Confirm PIN do not match.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('PIN must be at least 4 digits.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      await register(name.trim(), phone.trim(), email.trim() || null, password);
      navigation.replace('Main');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create GenCash Account</Text>
          <Text style={styles.subtitle}>
            Register today to experience AI-powered digital transactions
          </Text>
        </View>

        {/* Demo Bonus Highlight Banner */}
        <View style={styles.bonusBanner}>
          <Ionicons name="gift-outline" size={24} color="#FBBF24" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bonusTitle}>৳5,000 Demo Bonus</Text>
            <Text style={styles.bonusDesc}>
              Instant simulated wallet credit allocated automatically upon registration!
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <CustomInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Arif Shahriar"
            icon="person-outline"
          />

          <CustomInput
            label="Mobile Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <CustomInput
            label="Email Address (Optional)"
            value={email}
            onChangeText={setEmail}
            placeholder="tanvir@example.com"
            icon="mail-outline"
            keyboardType="email-address"
          />

          <CustomInput
            label="Create PIN / Password *"
            value={password}
            onChangeText={setPassword}
            placeholder="4-6 digit numeric PIN"
            icon="lock-closed-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={10}
          />

          <CustomInput
            label="Confirm PIN *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter PIN"
            icon="shield-checkmark-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={10}
          />

          <CustomButton
            title="Create Account & Get ৳5,000"
            onPress={handleRegister}
            isLoading={loading}
            iconRight="sparkles"
            style={{ marginTop: 14 }}
          />
        </View>

        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  bonusTitle: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '800',
  },
  bonusDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
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
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: colors.textHighlight,
    fontSize: 13,
    fontWeight: '700',
  },
});
