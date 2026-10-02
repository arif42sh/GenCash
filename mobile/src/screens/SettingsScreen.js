import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

export const SettingsScreen = ({ navigation }) => {
  const { language, setLanguage, t, isBangla } = useLanguage();

  // Settings states
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleChangePin = () => {
    if (!oldPin || !newPin || !confirmPin) {
      Alert.alert('Error', isBangla ? 'সবগুলো ফিল্ড পূরণ করুন।' : 'Please fill all PIN fields.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Mismatch', isBangla ? 'নতুন পিন দুটি মেলেনি।' : 'New PINs do not match.');
      return;
    }
    if (newPin.length < 4) {
      Alert.alert('Invalid', isBangla ? 'পিন ন্যূনতম ৪ ডিজিটের হতে হবে।' : 'PIN must be at least 4 digits.');
      return;
    }

    setShowPinModal(false);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    Alert.alert('Success', isBangla ? 'আপনার পিন সফলভাবে পরিবর্তিত হয়েছে।' : 'Your PIN has been updated successfully.');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F2F24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings', 'Settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Language Toggle Section (বাংলা / English) */}
        <Text style={styles.sectionHeader}>{t('language', 'Language')}</Text>
        <View style={styles.card}>
          <View style={styles.langHeaderRow}>
            <View style={styles.langIconBox}>
              <Ionicons name="globe-outline" size={22} color="#1B4D3E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardItemTitle}>{t('language', 'App Language')}</Text>
              <Text style={styles.cardItemSub}>
                {isBangla ? 'অ্যাপের ভাষা বাংলা নির্বাচন করা আছে' : 'English is selected'}
              </Text>
            </View>
          </View>

          {/* Radio / Pill Selection for English vs বাংলা */}
          <View style={styles.langToggleRow}>
            <TouchableOpacity
              style={[
                styles.langOption,
                language === 'en' && styles.langOptionActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setLanguage('en')}
            >
              <View style={[styles.radioCircle, language === 'en' && styles.radioCircleActive]}>
                {language === 'en' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                language === 'bn' && styles.langOptionActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setLanguage('bn')}
            >
              <View style={[styles.radioCircle, language === 'bn' && styles.radioCircleActive]}>
                {language === 'bn' && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.langOptionText, language === 'bn' && styles.langOptionTextActive]}>
                বাংলা (Bangla)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Security & Credentials Section */}
        <Text style={styles.sectionHeader}>{t('securityCredentials', 'Security & Access')}</Text>
        <View style={styles.card}>
          {/* Change PIN */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => setShowPinModal(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E8F7F0' }]}>
              <Ionicons name="key-outline" size={20} color="#064E3B" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{t('changePin', 'Change PIN')}</Text>
              <Text style={styles.menuRowSub}>{t('changePinSub', 'Update transaction PIN')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Biometrics Toggle */}
          <View style={styles.switchRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#F0EDFA' }]}>
              <Ionicons name="finger-print" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{t('biometricLogin', 'Biometric Login')}</Text>
              <Text style={styles.menuRowSub}>{t('biometricSub', 'Touch ID / Face ID')}</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#E2EFE9', true: '#00D09C' }}
              thumbColor={biometricEnabled ? '#1B4D3E' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 3. Notifications & Alerts */}
        <Text style={styles.sectionHeader}>{t('notifications', 'Notifications & Preferences')}</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF5E7' }]}>
              <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{isBangla ? 'লেনদেন নোটিফিকেশন' : 'Push Notifications'}</Text>
              <Text style={styles.menuRowSub}>{isBangla ? 'তাৎক্ষণিক ক্যাশব্যাক ও স্টেটমেন্ট' : 'Instant balance & cashback alerts'}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2EFE9', true: '#00D09C' }}
              thumbColor={notificationsEnabled ? '#1B4D3E' : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6366F1" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{isBangla ? 'ভাইব্রেশন ও হ্যাপটিক' : 'Haptic Feedback'}</Text>
              <Text style={styles.menuRowSub}>{isBangla ? 'ট্যাপ অ্যান্ড হোল্ড ভাইব্রেশন' : 'Vibration on tap & hold confirmation'}</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: '#E2EFE9', true: '#00D09C' }}
              thumbColor={hapticFeedback ? '#1B4D3E' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 4. Support & Legal */}
        <Text style={styles.sectionHeader}>{t('aboutApp', 'Support & About')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate ? navigation.navigate('Support') : Alert.alert('Customer Care', 'Helpline: 16247\nEmail: support@gencash.com')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EAF6F5' }]}>
              <Ionicons name="headset-outline" size={20} color="#0D9488" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{t('helpCenter', 'Help & Helpline')}</Text>
              <Text style={styles.menuRowSub}>Dial 16247 (24/7)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Terms & Privacy', 'GenCash strictly adheres to Bangladesh Bank MFS guidelines.')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="document-text-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuRowTitle}>{t('termsPolicy', 'Terms & Privacy Policy')}</Text>
              <Text style={styles.menuRowSub}>Regulatory compliance & data safety</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* App Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionTitle}>GenCash MFS Platform</Text>
          <Text style={styles.versionSub}>v2.4.0 • DIU CPC × upay AI Hackathon Edition</Text>
        </View>
      </ScrollView>

      {/* Change PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePin', 'Change PIN')}</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>{isBangla ? 'বর্তমান পিন *' : 'Current PIN *'}</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="••••••"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={oldPin}
              onChangeText={setOldPin}
            />

            <Text style={styles.modalFieldLabel}>{isBangla ? 'নতুন পিন *' : 'New PIN *'}</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="••••••"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={newPin}
              onChangeText={setNewPin}
            />

            <Text style={styles.modalFieldLabel}>{isBangla ? 'নতুন পিন নিশ্চিত করুন *' : 'Confirm New PIN *'}</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="••••••"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPinModal(false)}>
                <Text style={styles.modalCancelBtnText}>{t('cancel', 'Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleChangePin}>
                <Text style={styles.modalSaveBtnText}>{t('save', 'Save PIN')}</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EFE9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F9F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F2F24',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    marginBottom: 6,
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  langHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  langIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardItemTitle: {
    color: '#0F2F24',
    fontSize: 14,
    fontWeight: '700',
  },
  cardItemSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  langToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  langOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFA',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EFE9',
  },
  langOptionActive: {
    borderColor: '#00D09C',
    backgroundColor: '#E6F8F3',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleActive: {
    borderColor: '#1B4D3E',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1B4D3E',
  },
  langOptionText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  langOptionTextActive: {
    color: '#1B4D3E',
    fontWeight: '800',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuRowTitle: {
    color: '#0F2F24',
    fontSize: 13,
    fontWeight: '700',
  },
  menuRowSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F6F9F8',
    marginVertical: 10,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  versionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  versionSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },

  // PIN Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#0F2F24',
    fontSize: 17,
    fontWeight: '800',
  },
  modalFieldLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  pinInput: {
    backgroundColor: '#F8FCFA',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: '#0F2F24',
    letterSpacing: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F6F9F8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#1B4D3E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
