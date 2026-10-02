import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomButton } from '../components/CustomButton';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, toggleLanguage, t, isBangla } = useLanguage();

  // Active Modals: 'photo' | 'personal' | 'security' | 'notifications' | 'privacy' | 'help' | 'pinChange' | 'qr'
  const [activeModal, setActiveModal] = useState(null);

  // Security Toggles
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notifications Toggles
  const [pushNotifEnabled, setPushNotifEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [aiInsightsNotif, setAiInsightsNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);

  // Privacy Toggles
  const [maskBalanceDefault, setMaskBalanceDefault] = useState(false);
  const [hideAmountInNotif, setHideAmountInNotif] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(true);

  // Change PIN Inputs
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

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

  const handlePhotoOption = (type) => {
    setActiveModal(null);
    if (type === 'camera') {
      Alert.alert('Camera', 'Photo captured and set as profile picture.');
    } else if (type === 'gallery') {
      Alert.alert('Gallery', 'Photo selected from gallery.');
    } else {
      Alert.alert('Photo Removed', 'Default avatar restored.');
    }
  };

  const handleChangePinSubmit = () => {
    if (!oldPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all PIN fields.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Mismatch', 'New PIN and Confirm PIN do not match.');
      return;
    }
    if (newPin.length < 5) {
      Alert.alert('Invalid PIN', 'PIN must be at least 5 digits long.');
      return;
    }
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setActiveModal(null);
    Alert.alert('Success', 'Your account PIN has been updated successfully.');
  };

  const userName = user?.name || 'Tanvir Ahmed';
  const userPhone = user?.phone || '01711111111';
  const userEmail = user?.email || 'tanvir@gencash.com';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Profile</Text>
        <TouchableOpacity
          style={styles.headerQrBtn}
          onPress={() => setActiveModal('qr')}
        >
          <Ionicons name="qr-code-outline" size={20} color="#064E3B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Hero Profile Card with Photo Upload & Camera Badge */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={() => setActiveModal('photo')}
            >
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          <View style={styles.kycBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#00D09C" />
            <Text style={styles.kycBadgeText}>Smart KYC Tier-1 Verified</Text>
          </View>
        </View>

        {/* 2. Menu Section: Personal Information & Security */}
        <Text style={styles.sectionLabel}>Account & Credentials</Text>
        <View style={styles.menuCard}>
          {/* Personal Information */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setActiveModal('personal')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E8F7F0' }]}>
              <Ionicons name="person-outline" size={20} color="#064E3B" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>Personal Information</Text>
              <Text style={styles.menuSubtitle}>NID, email, birth date & address</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Security */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setActiveModal('security')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FCEEF0' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#F43F5E" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>Security & Credentials</Text>
              <Text style={styles.menuSubtitle}>Change PIN, biometrics & devices</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 3. Menu Section: Notifications, Language & Privacy */}
        <Text style={styles.sectionLabel}>{isBangla ? 'পছন্দসমূহ ও ভাষা' : 'Preferences'}</Text>
        <View style={styles.menuCard}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={toggleLanguage}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E6F8F3' }]}>
              <Ionicons name="globe-outline" size={20} color="#1B4D3E" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>{isBangla ? 'ভাষা (Language)' : 'App Language'}</Text>
              <Text style={styles.menuSubtitle}>
                {isBangla ? 'বর্তমানে বাংলা চালু (ট্যাপ করে English করুন)' : 'English active (Tap to switch to বাংলা)'}
              </Text>
            </View>
            <View style={{
              backgroundColor: '#1B4D3E',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{ color: '#00D09C', fontSize: 11, fontWeight: '800' }}>
                {language === 'bn' ? 'বাংলা' : 'ENG'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F6F9F8' }]}>
              <Ionicons name="settings-outline" size={20} color="#1B4D3E" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>{isBangla ? 'সেটিংস' : 'Settings'}</Text>
              <Text style={styles.menuSubtitle}>
                {isBangla ? 'নিরাপত্তা, নোটিফিকেশন ও হেল্পলাইন' : 'Preferences, security & customer care'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Notifications */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setActiveModal('notifications')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF5E7' }]}>
              <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>{isBangla ? 'নোটিফিকেশন অ্যালার্ট' : 'Notifications'}</Text>
              <Text style={styles.menuSubtitle}>{isBangla ? 'এসএমএস, পুশ ও অ্যালার্ট' : 'Transaction SMS, push & AI alerts'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Privacy */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setActiveModal('privacy')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F0EDFA' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>{isBangla ? 'প্রাইভেসি' : 'Privacy'}</Text>
              <Text style={styles.menuSubtitle}>{isBangla ? 'ব্যালেন্স হাইড ও ডেটা সুরক্ষা' : 'Balance masking & data sharing'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. Menu Section: Help & Support */}
        <Text style={styles.sectionLabel}>{isBangla ? 'সাপোর্ট ও তথ্য' : 'Support & Info'}</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EAF6F5' }]}>
              <Ionicons name="help-buoy-outline" size={20} color="#0D9488" />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle}>{isBangla ? 'হেল্প ও লাইভ সাপোর্ট' : 'Help & Support'}</Text>
              <Text style={styles.menuSubtitle}>{isBangla ? '১৬২৪৭ হেল্পলাইন, এফএকিউ ও লাইভ চ্যাট' : '24/7 Helpline 16247, Chat & FAQs'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 5. Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>GenCash v1.0.0 • AI Hackathon 2026</Text>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ================= MODALS ================= */}

      {/* 1. Photo Upload Sheet Modal */}
      <Modal visible={activeModal === 'photo'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionRow} onPress={() => handlePhotoOption('camera')}>
              <Ionicons name="camera-outline" size={22} color="#064E3B" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => handlePhotoOption('gallery')}>
              <Ionicons name="images-outline" size={22} color="#064E3B" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => handlePhotoOption('remove')}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Personal Information Modal */}
      <Modal visible={activeModal === 'personal'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Legal Name</Text>
                <Text style={styles.infoValue}>{userName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{userPhone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registered Email</Text>
                <Text style={styles.infoValue}>{userEmail}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>National ID (Smart Card)</Text>
                <Text style={styles.infoValue}>1994 •••• •••• 8219</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>14 March, 1996</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Permanent Address</Text>
                <Text style={styles.infoValue}>Dhanmondi, Dhaka, Bangladesh</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '800' }]}>
                  Tier-1 Citizen Verified ✅
                </Text>
              </View>
            </ScrollView>

            <CustomButton
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* 3. Security Modal */}
      <Modal visible={activeModal === 'security'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security & Credentials</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setActiveModal('pinChange')}
            >
              <View style={styles.actionCardLeft}>
                <Ionicons name="key-outline" size={20} color="#064E3B" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.actionCardTitle}>Change Account PIN</Text>
                  <Text style={styles.actionCardDesc}>Update your secret transaction PIN</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Biometric Authentication</Text>
                <Text style={styles.switchDesc}>Enable Face ID or Fingerprint login</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Two-Factor Security (2FA)</Text>
                <Text style={styles.switchDesc}>Require SMS OTP for large transactions</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.deviceBox}>
              <Ionicons name="phone-portrait-outline" size={18} color="#064E3B" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.deviceName}>Active Session (This Device)</Text>
                <Text style={styles.deviceStatus}>Android Expo Client • Verified IP</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. PIN Change Modal */}
      <Modal visible={activeModal === 'pinChange'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Wallet PIN</Text>
              <TouchableOpacity onPress={() => setActiveModal('security')}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current PIN</Text>
            <TextInput
              style={styles.modalInput}
              value={oldPin}
              onChangeText={setOldPin}
              placeholder="Enter current PIN"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>New 5-Digit PIN</Text>
            <TextInput
              style={styles.modalInput}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter new 5-digit PIN"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>Confirm New PIN</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm new PIN"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <CustomButton
              title="Update Secret PIN"
              onPress={handleChangePinSubmit}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* 5. Notifications Settings Modal */}
      <Modal visible={activeModal === 'notifications'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchDesc}>Real-time transaction & status alerts</Text>
              </View>
              <Switch
                value={pushNotifEnabled}
                onValueChange={setPushNotifEnabled}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Instant Transaction SMS</Text>
                <Text style={styles.switchDesc}>Receive cellular SMS on money in/out</Text>
              </View>
              <Switch
                value={smsAlertsEnabled}
                onValueChange={setSmsAlertsEnabled}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>AI Financial Advisories</Text>
                <Text style={styles.switchDesc}>Spending anomaly & budget reminders</Text>
              </View>
              <Switch
                value={aiInsightsNotif}
                onValueChange={setAiInsightsNotif}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Promotions & Cashbacks</Text>
                <Text style={styles.switchDesc}>Exclusive discount offers from partners</Text>
              </View>
              <Switch
                value={promoNotif}
                onValueChange={setPromoNotif}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. Privacy Modal */}
      <Modal visible={activeModal === 'privacy'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Mask Balance by Default</Text>
                <Text style={styles.switchDesc}>Hide wallet balance on app launch</Text>
              </View>
              <Switch
                value={maskBalanceDefault}
                onValueChange={setMaskBalanceDefault}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>Hide Amounts in Push Alerts</Text>
                <Text style={styles.switchDesc}>Conceal exact amount from lock screen</Text>
              </View>
              <Switch
                value={hideAmountInNotif}
                onValueChange={setHideAmountInNotif}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>AI Model Analytics Opt-In</Text>
                <Text style={styles.switchDesc}>Allow anonymous analytics to refine advice</Text>
              </View>
              <Switch
                value={shareAnalytics}
                onValueChange={setShareAnalytics}
                trackColor={{ false: '#CBD5E1', true: '#00D09C' }}
              />
            </View>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Alert.alert('Privacy Policy', 'GenCash adheres to Bangladesh Bank & ISO-27001 data protection protocols.')}
            >
              <Text style={styles.linkText}>View Full Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color="#00B887" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. Help & Support Modal */}
      <Modal visible={activeModal === 'help'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Call Helpline */}
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={() => Alert.alert('Helpline 16247', 'Connecting to 24/7 MFS Support Desk...')}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.helpBtnText}>Call 24/7 Helpline (16247)</Text>
            </TouchableOpacity>

            {/* Live Chat */}
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => Alert.alert('AI Live Assistant', 'Hello! How can I assist your financial transactions today?')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#064E3B" />
              <Text style={styles.chatBtnText}>Chat with AI Support Bot</Text>
            </TouchableOpacity>

            <View style={styles.faqBox}>
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              <Text style={styles.faqQ}>Q: How to Send Money without fee?</Text>
              <Text style={styles.faqA}>A: P2P transfers within GenCash network are 100% free.</Text>

              <Text style={styles.faqQ}>Q: What is the Cash Out fee?</Text>
              <Text style={styles.faqA}>A: Standard agent cashout fee is 1.85% (৳18.50 per ৳1000).</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. QR Code Receive Modal */}
      <Modal visible={activeModal === 'qr'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receive Money QR</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              <View style={styles.qrContainer}>
                <Ionicons name="qr-code" size={130} color="#064E3B" />
                <Text style={styles.qrPhoneText}>{userPhone}</Text>
              </View>
              <Text style={styles.qrHint}>
                Scan this QR code with any GenCash app to receive money instantly.
              </Text>
            </View>

            <CustomButton
              title="Close QR"
              onPress={() => setActiveModal(null)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F6F9F8',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerQrBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00D09C',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  userPhone: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  kycBadgeText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  sectionLabel: {
    color: '#47665C',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuDetails: {
    flex: 1,
  },
  menuTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F7F0',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardTitle: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '700',
  },
  actionCardDesc: {
    color: '#47665C',
    fontSize: 11,
    marginTop: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  switchTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  switchDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  deviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  deviceStatus: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  linkText: {
    color: '#00B887',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  helpBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B4D3E',
    height: 48,
    borderRadius: 14,
    marginBottom: 10,
  },
  helpBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  chatBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F7F0',
    height: 48,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D2EFE2',
  },
  chatBtnText: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  faqBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  faqQ: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  faqA: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrPhoneText: {
    color: '#064E3B',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 8,
  },
  qrHint: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 260,
  },
});
