import React, { useState, useEffect } from 'react';
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
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { CustomButton } from '../components/CustomButton';
import { UserReceiveQRModal } from '../components/UserReceiveQRModal';

export const ProfileScreen = ({ navigation }) => {
  const { user, updateUser, logout } = useAuth();
  const { language, toggleLanguage, isBangla } = useLanguage();

  // Active Modals: 'photo' | 'personal' | 'editPersonal' | 'security' | 'limits' | 'notifications' | 'help' | 'pinChange' | 'qr'
  const [activeModal, setActiveModal] = useState(null);

  // Profile Image State
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Editable Personal Information State
  const [editName, setEditName] = useState(user?.name || 'Arif Shahriar');
  const [editEmail, setEditEmail] = useState(user?.email || 'arif@gencash.com');
  const [editAddress, setEditAddress] = useState('Dhanmondi, Dhaka, Bangladesh');

  // Security Toggles
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notifications Toggles
  const [pushNotifEnabled, setPushNotifEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);

  // Change PIN Inputs
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // FAQ Expanded State
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Load persisted user preferences & avatar on mount
  useEffect(() => {
    const loadStoredPreferences = async () => {
      try {
        if (user?.avatar) {
          setProfileImage(user.avatar);
        } else if (user?.profile_image) {
          setProfileImage(user.profile_image);
        } else if (storedAvatar) {
          setProfileImage(storedAvatar);
        }

        if (user?.name) setEditName(user.name);
        if (user?.email) setEditEmail(user.email);

        const storedBio = await storage.getItem('@gencash_biometric');
        if (storedBio !== null) setBiometricEnabled(storedBio === 'true');

        const stored2FA = await storage.getItem('@gencash_2fa');
        if (stored2FA !== null) setTwoFactorEnabled(stored2FA === 'true');

        const storedPush = await storage.getItem('@gencash_notif_push');
        if (storedPush !== null) setPushNotifEnabled(storedPush === 'true');

        const storedSms = await storage.getItem('@gencash_notif_sms');
        if (storedSms !== null) setSmsAlertsEnabled(storedSms === 'true');

        const storedBudget = await storage.getItem('@gencash_notif_budget');
        if (storedBudget !== null) setBudgetAlertsEnabled(storedBudget === 'true');

        const storedPromo = await storage.getItem('@gencash_notif_promo');
        if (storedPromo !== null) setPromoNotif(storedPromo === 'true');

        const storedAddress = await storage.getItem('@gencash_user_address');
        if (storedAddress) setEditAddress(storedAddress);
      } catch (e) {
        console.warn('Error loading preferences:', e);
      }
    };

    loadStoredPreferences();
  }, [user]);

  // Photo Handlers (Real Expo Image Picker)
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isBangla ? 'অনুমতি প্রয়োজন' : 'Permission Required',
          isBangla
            ? 'ছবি তুলতে ক্যামেরার অনুমতি দিন।'
            : 'Camera permission is required to capture a profile photo.'
        );
        return;
      }

      setIsUploadingImage(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imagePayload = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setProfileImage(asset.uri);
        const updated = await updateUser({ avatar: imagePayload });
        if (updated?.avatar) {
          setProfileImage(updated.avatar);
        }
        setActiveModal(null);
        Alert.alert(
          isBangla ? 'সফল' : 'Success',
          isBangla ? 'প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে।' : 'Profile photo updated successfully!'
        );
      }
    } catch (err) {
      console.warn('Camera error:', err);
      Alert.alert(
        isBangla ? 'ত্রুটি' : 'Error',
        isBangla ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে।' : 'Failed to open camera.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isBangla ? 'অনুমতি প্রয়োজন' : 'Permission Required',
          isBangla
            ? 'ছবি বেছে নিতে গ্যালারির অনুমতি দিন।'
            : 'Photo library access is required to choose a profile picture.'
        );
        return;
      }

      setIsUploadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imagePayload = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setProfileImage(asset.uri);
        const updated = await updateUser({ avatar: imagePayload });
        if (updated?.avatar) {
          setProfileImage(updated.avatar);
        }
        setActiveModal(null);
        Alert.alert(
          isBangla ? 'সফল' : 'Success',
          isBangla ? 'প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে।' : 'Profile photo chosen successfully!'
        );
      }
    } catch (err) {
      console.warn('Gallery error:', err);
      Alert.alert(
        isBangla ? 'ত্রুটি' : 'Error',
        isBangla ? 'ছবি সিলেক্ট করতে সমস্যা হয়েছে।' : 'Failed to select image from gallery.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    setProfileImage(null);
    await updateUser({ avatar: "" });
    setActiveModal(null);
    Alert.alert(
      isBangla ? 'ছবি রিমুভড' : 'Photo Removed',
      isBangla ? 'ডিফল্ট অবতার রিস্টোর করা হয়েছে।' : 'Default initial avatar restored.'
    );
  };

  // Personal Information Save Handler
  const handleSavePersonalInfo = async () => {
    if (!editName.trim()) {
      Alert.alert(isBangla ? 'ত্রুটি' : 'Error', isBangla ? 'নাম খালি রাখা যাবে না।' : 'Name cannot be empty.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert(isBangla ? 'ত্রুটি' : 'Error', isBangla ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email.');
      return;
    }

    try {
      await updateUser({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      await storage.setItem('@gencash_user_address', editAddress.trim());

      setActiveModal(null);
      Alert.alert(
        isBangla ? 'তথ্য সংরক্ষিত' : 'Profile Updated',
        isBangla ? 'আপনার ব্যক্তিগত তথ্য সফলভাবে আপডেট হয়েছে।' : 'Your personal information has been updated.'
      );
    } catch (e) {
      Alert.alert(isBangla ? 'ত্রুটি' : 'Error', isBangla ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save changes.');
    }
  };

  // PIN Change Handler
  const handleChangePinSubmit = async () => {
    if (!oldPin || !newPin || !confirmPin) {
      Alert.alert(isBangla ? 'ত্রুটি' : 'Error', isBangla ? 'সবগুলো পিন ফিল্ড পূরণ করুন।' : 'Please fill in all PIN fields.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(isBangla ? 'অমিল' : 'Mismatch', isBangla ? 'নতুন পিন ও কনফার্ম পিন মিলছে না।' : 'New PIN and Confirm PIN do not match.');
      return;
    }
    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      Alert.alert(
        isBangla ? 'অবৈধ পিন' : 'Invalid PIN',
        isBangla ? 'নিরাপত্তার জন্য পিন অবশ্যই ৪ থেকে ৬-সংখ্যার নম্বর হতে হবে।' : 'PIN must be between 4 and 6 digits.'
      );
      return;
    }

    try {
      await api.changePin(oldPin.trim(), newPin.trim());
      await storage.setItem('@gencash_user_pin', newPin.trim());
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setActiveModal(null);
      Alert.alert(
        isBangla ? 'সফল' : 'Success',
        isBangla ? 'আপনার অ্যাকাউন্ট পিন সফলভাবে পরিবর্তন হয়েছে।' : 'Your account PIN has been updated successfully.'
      );
    } catch (err) {
      Alert.alert(isBangla ? 'ব্যর্থ' : 'Failed', err.message);
    }
  };

  // Preference Toggle Handlers
  const handleToggleBiometric = async (value) => {
    setBiometricEnabled(value);
    await storage.setItem('@gencash_biometric', value ? 'true' : 'false');
  };

  const handleToggle2FA = async (value) => {
    setTwoFactorEnabled(value);
    await storage.setItem('@gencash_2fa', value ? 'true' : 'false');
  };

  const handleTogglePushNotif = async (value) => {
    setPushNotifEnabled(value);
    await storage.setItem('@gencash_notif_push', value ? 'true' : 'false');
  };

  const handleToggleSmsAlerts = async (value) => {
    setSmsAlertsEnabled(value);
    await storage.setItem('@gencash_notif_sms', value ? 'true' : 'false');
  };

  const handleToggleBudgetAlerts = async (value) => {
    setBudgetAlertsEnabled(value);
    await storage.setItem('@gencash_notif_budget', value ? 'true' : 'false');
  };

  const handleTogglePromoNotif = async (value) => {
    setPromoNotif(value);
    await storage.setItem('@gencash_notif_promo', value ? 'true' : 'false');
  };

  // Support Direct Actions
  const handleCallHelpline = () => {
    Linking.openURL('tel:16247').catch(() => {
      Alert.alert('Helpline 16247', isBangla ? '১৬২৪৭ নম্বরে ডায়াল করুন।' : 'Please dial 16247 from your phone.');
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gencash.com?subject=GenCash%20Customer%20Support').catch(() => {
      Alert.alert('Email Support', 'support@gencash.com');
    });
  };

  const handleLogout = () => {
    Alert.alert(
      isBangla ? 'লগআউট নিশ্চিত করুন' : 'Confirm Logout',
      isBangla ? 'আপনি কি নিশ্চিত যে GenCash থেকে লগআউট করতে চান?' : 'Are you sure you want to log out of GenCash?',
      [
        { text: isBangla ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: isBangla ? 'লগআউট' : 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const userName = user?.name || editName;
  const userPhone = user?.phone || '+880 1711-111111';
  const userEmail = user?.email || editEmail;

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        {navigation?.canGoBack?.() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color="#134E4A" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>{isBangla ? 'প্রোফাইল ও সেটিংস' : 'Account & Profile'}</Text>
        <TouchableOpacity
          style={styles.headerQrBtn}
          onPress={() => setActiveModal('qr')}
          activeOpacity={0.75}
        >
          <Ionicons name="qr-code-outline" size={20} color="#134E4A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Refined Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarPhoto} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.85}
              onPress={() => setActiveModal('photo')}
            >
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={13} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>

          {/* Clean Human Banking Status Badge */}
          <View style={styles.kycBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.kycBadgeText}>
              {isBangla ? 'NID ভেরিফায়েড' : 'NID Verified'}
            </Text>
          </View>
        </View>

        {/* 2. Grouped Section 1: Account Settings */}
        <Text style={styles.sectionLabel}>
          {isBangla ? 'অ্যাকাউন্ট সেটিংস' : 'ACCOUNT SETTINGS'}
        </Text>
        <View style={styles.groupCard}>
          {/* Row 1: Personal Information */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={() => {
              setEditName(userName);
              setEditEmail(userEmail);
              setActiveModal('personal');
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? 'নাম, এনআইডি ও ব্যাংকিং তথ্যাদি' : 'Name, NID & linked account details'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Security & PIN */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('security')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'নিরাপত্তা ও পিন' : 'Security & PIN'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? 'পিন পরিবর্তন, বায়োমেট্রিক ও ডিভাইস' : 'Change PIN, biometrics & login devices'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 3: Limits & Charges */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('limits')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'লেনদেন লিমিট ও চার্জ' : 'Limits & Charges'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? 'দৈনিক লেনদেন লিমিট ও সার্ভিস ফি' : 'Daily transaction limits & fees'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 3. Grouped Section 2: Preferences & Support */}
        <Text style={styles.sectionLabel}>
          {isBangla ? 'পছন্দসমূহ ও সাপোর্ট' : 'PREFERENCES & SUPPORT'}
        </Text>
        <View style={styles.groupCard}>
          {/* Row 1: App Language */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={toggleLanguage}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'অ্যাপের ভাষা' : 'App Language'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? 'বাংলা অথবা English নির্বাচন করুন' : 'Switch between English & বাংলা'}
              </Text>
            </View>
            <View style={styles.languageLabelContainer}>
              <Text style={styles.languageLabelText}>
                {language === 'bn' ? 'বাংলা' : 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Notifications */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('notifications')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'নোটিফিকেশন অ্যালার্ট' : 'Notifications'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? 'এসএমএস অ্যালার্ট ও পুশ নোটিফিকেশন' : 'SMS alerts & push notifications'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 3: Help & Support */}
          <TouchableOpacity
            style={styles.groupRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('help')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="headset-outline" size={20} color="#134E4A" />
            </View>
            <View style={styles.rowDetails}>
              <Text style={styles.rowTitle}>
                {isBangla ? 'হেল্প ও সাপোর্ট' : 'Help & Support'}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isBangla ? '১৬২৪৭ হেল্পলাইন ও সাধারণ প্রশ্নোত্তর' : '16247 Helpline & FAQ desk'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. Refined Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={19} color="#DC2626" />
          <Text style={styles.logoutText}>
            {isBangla ? 'লগআউট' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        {/* 5. Production Version Tag */}
        <Text style={styles.versionText}>App Version 1.0.0 (Official Build)</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ================= MODALS ================= */}

      {/* 1. Photo Upload Sheet Modal */}
      <Modal visible={activeModal === 'photo'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'প্রোফাইল ছবি পরিবর্তন' : 'Change Profile Photo'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionRow} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={22} color="#134E4A" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>{isBangla ? 'ক্যামেরা দিয়ে ছবি তুলুন' : 'Take Photo with Camera'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={handlePickFromGallery}>
              <Ionicons name="images-outline" size={22} color="#134E4A" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>{isBangla ? 'গ্যালারি থেকে বেছে নিন' : 'Choose from Gallery'}</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity style={styles.optionRow} onPress={handleRemovePhoto}>
                <Ionicons name="trash-outline" size={22} color="#DC2626" style={{ marginRight: 12 }} />
                <Text style={[styles.optionText, { color: '#DC2626' }]}>{isBangla ? 'ছবি মুছে ফেলুন' : 'Remove Photo'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 2. Personal Information Modal (View & Edit) */}
      <Modal visible={activeModal === 'personal'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.editSection}>
                <Text style={styles.inputLabel}>{isBangla ? 'পূর্ণ নাম' : 'Full Legal Name'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter full name"
                />

                <Text style={styles.inputLabel}>{isBangla ? 'মোবাইল নম্বর (স্থির)' : 'Mobile Number (Fixed)'}</Text>
                <TextInput
                  style={[styles.modalInput, styles.disabledInput]}
                  value={userPhone}
                  editable={false}
                />

                <Text style={styles.inputLabel}>{isBangla ? 'ইমেইল অ্যাড্রেস' : 'Registered Email'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email address"
                />

                <Text style={styles.inputLabel}>{isBangla ? 'জাতীয় পরিচয়পত্র (NID)' : 'National ID (Smart Card)'}</Text>
                <TextInput
                  style={[styles.modalInput, styles.disabledInput]}
                  value="1994 •••• •••• 8219"
                  editable={false}
                />

                <Text style={styles.inputLabel}>{isBangla ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Enter permanent address"
                />

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{isBangla ? 'অ্যাকাউন্ট ভেরিফিকেশন' : 'Account Status'}:</Text>
                  <View style={styles.statusBadgeInline}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" />
                    <Text style={styles.statusBadgeTextInline}>{isBangla ? 'NID ভেরিফায়েড' : 'NID Verified'}</Text>
                  </View>
                </View>
              </View>

              <CustomButton
                title={isBangla ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}
                onPress={handleSavePersonalInfo}
                style={{ marginTop: 14 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Security Modal */}
      <Modal visible={activeModal === 'security'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'নিরাপত্তা ও পিন' : 'Security & PIN'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setActiveModal('pinChange')}
            >
              <View style={styles.actionCardLeft}>
                <Ionicons name="key-outline" size={20} color="#134E4A" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.actionCardTitle}>
                    {isBangla ? 'অ্যাকাউন্ট পিন পরিবর্তন করুন' : 'Change Account PIN'}
                  </Text>
                  <Text style={styles.actionCardDesc}>
                    {isBangla ? 'আপনার ৫-ডিজিট গোপন পিন আপডেট করুন' : 'Update your secret 5-digit transaction PIN'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'বায়োমেট্রিক লগইন' : 'Biometric Authentication'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'ফিঙ্গারপ্রিন্ট বা ফেস আইডি সক্রিয় রাখুন' : 'Enable Fingerprint or Face ID login'}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'টু-ফ্যাক্টর সিকিউরিটি (2FA)' : 'Two-Factor Authentication (2FA)'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'বড় লেনদেনে এসএমএস ওটিপি প্রয়োজন হবে' : 'Require SMS OTP for large transactions'}
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>

            <View style={styles.deviceBox}>
              <Ionicons name="phone-portrait-outline" size={18} color="#134E4A" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.deviceName}>
                  {isBangla ? 'বর্তমান সক্রিয় সেশন' : 'Active Session (This Device)'}
                </Text>
                <Text style={styles.deviceStatus}>
                  {isBangla ? 'সুরক্ষিত মোবাইল সেশন • এনক্রিপ্টেড' : 'Secured Mobile Session • Encrypted'}
                </Text>
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
              <Text style={styles.modalTitle}>
                {isBangla ? 'পিন পরিবর্তন' : 'Change Wallet PIN'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal('security')}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>{isBangla ? 'বর্তমান পিন' : 'Current PIN'}</Text>
            <TextInput
              style={styles.modalInput}
              value={oldPin}
              onChangeText={setOldPin}
              placeholder={isBangla ? 'বর্তমান পিন লিখুন' : 'Enter current PIN'}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>{isBangla ? 'নতুন পিন (৪-৬ সংখ্যা)' : 'New PIN (4-6 digits)'}</Text>
            <TextInput
              style={styles.modalInput}
              value={newPin}
              onChangeText={setNewPin}
              placeholder={isBangla ? 'নতুন পিন লিখুন' : 'Enter new PIN'}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>{isBangla ? 'নতুন পিন পুনরায় লিখুন' : 'Confirm New PIN'}</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder={isBangla ? 'কনফার্ম করতে পিন পুনরায় লিখুন' : 'Confirm new PIN'}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />

            <CustomButton
              title={isBangla ? 'পিন আপডেট করুন' : 'Update Secret PIN'}
              onPress={handleChangePinSubmit}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 5. Limits & Charges Modal */}
      <Modal visible={activeModal === 'limits'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'লেনদেন লিমিট ও চার্জ' : 'Limits & Charges'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.limitTable}>
                <View style={styles.limitRow}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={styles.limitName}>{isBangla ? 'সেন্ড মানি (P2P)' : 'Send Money (P2P)'}</Text>
                    <Text style={styles.limitDaily}>{isBangla ? 'দৈনিক লিমিট: ৳২৫,০০০' : 'Daily Limit: ৳25,000'}</Text>
                  </View>
                  <View style={styles.chargeBadge}>
                    <Text style={styles.chargeBadgeText}>{isBangla ? 'ফ্রি (০%)' : 'FREE (0%)'}</Text>
                  </View>
                </View>

                <View style={styles.limitRow}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={styles.limitName}>{isBangla ? 'ক্যাশ আউট (এজেন্ট)' : 'Cash Out (Agent)'}</Text>
                    <Text style={styles.limitDaily}>{isBangla ? 'দৈনিক লিমিট: ৳২৫,০০০' : 'Daily Limit: ৳25,000'}</Text>
                  </View>
                  <View style={styles.chargeBadgeAlt}>
                    <Text style={styles.chargeBadgeTextAlt}>1.85% (৳১৮.৫০/১০০০)</Text>
                  </View>
                </View>

                <View style={styles.limitRow}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={styles.limitName}>{isBangla ? 'মোবাইল রিচার্জ' : 'Mobile Recharge'}</Text>
                    <Text style={styles.limitDaily}>{isBangla ? 'দৈনিক লিমিট: ৳১০,০০০' : 'Daily Limit: ৳10,000'}</Text>
                  </View>
                  <View style={styles.chargeBadge}>
                    <Text style={styles.chargeBadgeText}>{isBangla ? 'ফ্রি (০%)' : 'FREE (0%)'}</Text>
                  </View>
                </View>

                <View style={styles.limitRow}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={styles.limitName}>{isBangla ? 'অ্যাড মানি (কার্ড/ব্যাংক)' : 'Add Money (Card/Bank)'}</Text>
                    <Text style={styles.limitDaily}>{isBangla ? 'দৈনিক লিমিট: ৳৫০,০০০' : 'Daily Limit: ৳50,000'}</Text>
                  </View>
                  <View style={styles.chargeBadge}>
                    <Text style={styles.chargeBadgeText}>{isBangla ? 'ফ্রি (০%)' : 'FREE (0%)'}</Text>
                  </View>
                </View>

                <View style={styles.limitRow}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={styles.limitName}>{isBangla ? 'মার্চেন্ট কিউআর পেমেন্ট' : 'Merchant QR Payment'}</Text>
                    <Text style={styles.limitDaily}>{isBangla ? 'দৈনিক লিমিট: ৳৫০,০০০' : 'Daily Limit: ৳50,000'}</Text>
                  </View>
                  <View style={styles.chargeBadge}>
                    <Text style={styles.chargeBadgeText}>{isBangla ? 'ফ্রি (০%)' : 'FREE (0%)'}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <CustomButton
              title={isBangla ? 'ঠিক আছে' : 'Got it'}
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 6. Notifications Settings Modal */}
      <Modal visible={activeModal === 'notifications'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'নোটিফিকেশন প্রেফারেন্স' : 'Notifications'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'পুশ নোটিফিকেশন' : 'Push Notifications'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'তাৎক্ষণিক লেনদেন ও স্ট্যাটাস আপডেট' : 'Real-time transaction & status alerts'}
                </Text>
              </View>
              <Switch
                value={pushNotifEnabled}
                onValueChange={handleTogglePushNotif}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'লেনদেনের এসএমএস অ্যালার্ট' : 'Instant Transaction SMS'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'টাকা আসা ও যাওয়ার সাথে সাথে এসএমএস পান' : 'Receive cellular SMS on money debited/credited'}
                </Text>
              </View>
              <Switch
                value={smsAlertsEnabled}
                onValueChange={handleToggleSmsAlerts}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'বাজেট ও খরচ সংক্রান্ত অ্যালার্ট' : 'Spending & Budget Alerts'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'মাসিক বাজেট ও নিয়মিত খরচের রিমাইন্ডার' : 'Monthly budget & recurring expense reminders'}
                </Text>
              </View>
              <Switch
                value={budgetAlertsEnabled}
                onValueChange={handleToggleBudgetAlerts}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchTitle}>
                  {isBangla ? 'প্রমোশন ও ক্যাশব্যাক অফার' : 'Promotions & Cashbacks'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isBangla ? 'পার্টনার আউটলেট ও রিচার্জের বিশেষ অফার' : 'Exclusive discount offers from partners'}
                </Text>
              </View>
              <Switch
                value={promoNotif}
                onValueChange={handleTogglePromoNotif}
                trackColor={{ false: '#CBD5E1', true: '#134E4A' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Help & Support Modal */}
      <Modal visible={activeModal === 'help'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBangla ? 'সহায়তা ও হেল্পলাইন' : 'Help & Support'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Direct Call Helpline */}
            <TouchableOpacity
              style={styles.helpBtn}
              activeOpacity={0.8}
              onPress={handleCallHelpline}
            >
              <Ionicons name="call" size={19} color="#FFFFFF" />
              <Text style={styles.helpBtnText}>
                {isBangla ? '২৪/৭ হেল্পলাইনে কল করুন (১৬২৪৭)' : 'Call 24/7 Helpline (16247)'}
              </Text>
            </TouchableOpacity>

            {/* Direct Email Support */}
            <TouchableOpacity
              style={styles.supportDeskBtn}
              activeOpacity={0.8}
              onPress={handleEmailSupport}
            >
              <Ionicons name="mail-outline" size={19} color="#134E4A" />
              <Text style={styles.supportDeskText}>
                {isBangla ? 'সাপোর্ট ইমেইল পাঠান (support@gencash.com)' : 'Email Support (support@gencash.com)'}
              </Text>
            </TouchableOpacity>

            {/* Interactive FAQs */}
            <View style={styles.faqBox}>
              <Text style={styles.faqTitle}>
                {isBangla ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
              </Text>

              <TouchableOpacity
                style={styles.faqItem}
                activeOpacity={0.7}
                onPress={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
              >
                <View style={styles.faqHeaderRow}>
                  <Text style={styles.faqQ}>
                    {isBangla ? 'প্রশ্ন: সেন্ড মানিতে কোনো চার্জ আছে?' : 'Q: Is Send Money free?'}
                  </Text>
                  <Ionicons
                    name={expandedFaq === 1 ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748B"
                  />
                </View>
                {expandedFaq === 1 && (
                  <Text style={styles.faqA}>
                    {isBangla
                      ? 'উত্তর: GenCash নেটওয়ার্কে যেকোনো ব্যবহারকারীর নম্বরে সেন্ড মানি সম্পূর্ণ ফ্রি।'
                      : 'A: P2P Send Money within GenCash network is 100% free with 0% charge.'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.faqDivider} />

              <TouchableOpacity
                style={styles.faqItem}
                activeOpacity={0.7}
                onPress={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
              >
                <View style={styles.faqHeaderRow}>
                  <Text style={styles.faqQ}>
                    {isBangla ? 'প্রশ্ন: পিন ভুলে গেলে কী করব?' : 'Q: What if I forget my PIN?'}
                  </Text>
                  <Ionicons
                    name={expandedFaq === 2 ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748B"
                  />
                </View>
                {expandedFaq === 2 && (
                  <Text style={styles.faqA}>
                    {isBangla
                      ? 'উত্তর: ১৬২৪৭ হেল্পলাইনে কল করে এনআইডি ভেরিফিকেশনের মাধ্যমে পিন রিসেট করুন।'
                      : 'A: Call 16247 Helpline and reset PIN with your NID verification.'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.faqDivider} />

              <TouchableOpacity
                style={styles.faqItem}
                activeOpacity={0.7}
                onPress={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
              >
                <View style={styles.faqHeaderRow}>
                  <Text style={styles.faqQ}>
                    {isBangla ? 'প্রশ্ন: ক্যাশ আউট চার্জ কত?' : 'Q: What is the Cash Out fee?'}
                  </Text>
                  <Ionicons
                    name={expandedFaq === 3 ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748B"
                  />
                </View>
                {expandedFaq === 3 && (
                  <Text style={styles.faqA}>
                    {isBangla
                      ? 'উত্তর: স্ট্যান্ডার্ড এজেন্ট ক্যাশ আউট চার্জ ১.৮৫% (প্রতি হাজারে ১৮.৫০ টাকা)।'
                      : 'A: Standard agent cashout fee is 1.85% (৳18.50 per ৳1000).'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. QR Code Receive Modal */}
      <UserReceiveQRModal
        visible={activeModal === 'qr'}
        onClose={() => setActiveModal(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerQrBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // 1. Profile Header Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E8F3EE',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  userPhone: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 3,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  kycBadgeText: {
    color: '#059669',
    fontSize: 11.5,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Grouped Sections
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F3EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowDetails: {
    flex: 1,
  },
  rowTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSubtitle: {
    color: '#64748B',
    fontSize: 11.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
  languageLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#134E4A',
  },

  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '500',
  },

  // Editable Form Inputs
  editSection: {
    paddingVertical: 4,
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
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeTextInline: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F3EE',
    padding: 13,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCardTitle: {
    color: '#134E4A',
    fontSize: 13,
    fontWeight: '700',
  },
  actionCardDesc: {
    color: '#335C51',
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
    fontWeight: '600',
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
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceStatus: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '500',
  },

  // Support
  helpBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#134E4A',
    height: 46,
    borderRadius: 12,
    marginBottom: 10,
  },
  helpBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 8,
  },
  supportDeskBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F3EE',
    height: 46,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D2EFE2',
  },
  supportDeskText: {
    color: '#134E4A',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  faqBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqTitle: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  faqItem: {
    paddingVertical: 6,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  faqA: {
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Limit Table
  limitTable: {
    marginTop: 4,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  limitName: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '600',
  },
  limitDaily: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  chargeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  chargeBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  chargeBadgeAlt: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chargeBadgeTextAlt: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
  },
});
