import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const UserReceiveQRModal = ({ visible, onClose }) => {
  const { user, wallet } = useAuth();
  const { isBangla } = useLanguage();
  const [requestAmount, setRequestAmount] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);

  const userName = user?.name || 'Arif Shahriar';
  const userPhone = user?.phone || '01711111111';

  const handleShare = async () => {
    try {
      const amtText = requestAmount ? `\nRequested Amount: ৳${requestAmount}` : '';
      await Share.share({
        title: 'GenCash Receive QR',
        message: `Send money to ${userName} on GenCash!\nAccount: ${userPhone}${amtText}\nPay securely via GenCash App.`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleSaveQR = () => {
    Alert.alert(
      isBangla ? 'কিউআর কোড সংরক্ষিত' : 'QR Code Saved',
      isBangla
        ? 'আপনার পার্সোনাল কিউআর কোড গ্যালারিতে সেভ হয়েছে।'
        : 'Your personal payment QR code has been saved to your gallery.'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <MaterialCommunityIcons name="qrcode-scan" size={20} color="#0F4D3C" />
              </View>
              <Text style={styles.headerTitle}>
                {isBangla ? 'আমার কিউআর কোড' : 'My Personal QR'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* User Info Badge */}
          <View style={styles.userBadge}>
            <View style={styles.avatarCircle}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarPhoto} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#00D09C" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.userPhone}>{userPhone}</Text>
            </View>
          </View>

          {/* Simulated High-Res QR Code Card */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              {/* Corner Targets */}
              <View style={[styles.qrCorner, styles.qrCornerTL]} />
              <View style={[styles.qrCorner, styles.qrCornerTR]} />
              <View style={[styles.qrCorner, styles.qrCornerBL]} />

              {/* Grid Matrix Visual Simulation */}
              <View style={styles.qrMatrix}>
                <View style={styles.matrixRow}>
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                </View>
                <View style={styles.matrixRow}>
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                </View>
                <View style={styles.matrixRow}>
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotFilled} />
                  {/* Center GenCash Logo Mark */}
                  <View style={styles.centerLogoMark}>
                    <Text style={styles.centerLogoText}>GC</Text>
                  </View>
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                </View>
                <View style={styles.matrixRow}>
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                </View>
                <View style={styles.matrixRow}>
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotFilled} />
                  <View style={styles.mDotEmpty} />
                </View>
              </View>
            </View>

            {requestAmount ? (
              <View style={styles.amountPill}>
                <Text style={styles.amountPillText}>
                  {isBangla ? 'অনুরোধকৃত অংক: ৳ ' : 'Requesting: ৳ '}{requestAmount}
                </Text>
              </View>
            ) : null}

            <Text style={styles.scanHint}>
              {isBangla
                ? 'যেকোনো GenCash ইউজার এই কিউআর স্ক্যান করে টাকা পাঠাতে পারবেন'
                : 'Scan with any GenCash app camera to send money directly'}
            </Text>
          </View>

          {/* Optional Amount Input Toggle */}
          {showAmountInput ? (
            <View style={styles.amountInputRow}>
              <Text style={styles.takaSymbol}>৳</Text>
              <TextInput
                style={styles.amountInput}
                placeholder={isBangla ? 'টাকার পরিমাণ লিখুন' : 'Enter specific amount'}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={requestAmount}
                onChangeText={setRequestAmount}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setShowAmountInput(false)}
                style={styles.amountDoneBtn}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.setAmountBtn}
              onPress={() => setShowAmountInput(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cash-outline" size={16} color="#0F4D3C" style={{ marginRight: 6 }} />
              <Text style={styles.setAmountText}>
                {requestAmount
                  ? (isBangla ? 'টাকার পরিমাণ পরিবর্তন' : 'Change Requested Amount')
                  : (isBangla ? 'টাকার পরিমাণ যুক্ত করুন' : 'Add Specific Amount')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons: Save & Share */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleSaveQR}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={18} color="#0F4D3C" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>
                {isBangla ? 'সেভ করুন' : 'Save QR'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>
                {isBangla ? 'শেয়ার করুন' : 'Share QR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 40, 31, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D6F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  userBadge: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7F4',
    padding: 12,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F4D3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  qrContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FCFA',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#DFEFE8',
    marginBottom: 14,
  },
  qrBox: {
    width: 190,
    height: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  qrCorner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#0F4D3C',
    borderWidth: 5,
  },
  qrCornerTL: {
    top: 10,
    left: 10,
  },
  qrCornerTR: {
    top: 10,
    right: 10,
  },
  qrCornerBL: {
    bottom: 10,
    left: 10,
  },
  qrMatrix: {
    width: 140,
    height: 140,
    justifyContent: 'space-around',
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mDotFilled: {
    width: 10,
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  mDotEmpty: {
    width: 10,
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  centerLogoMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F4D3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerLogoText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '900',
  },
  amountPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  amountPillText: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '700',
  },
  scanHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  setAmountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  setAmountText: {
    color: '#0F4D3C',
    fontSize: 12,
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00D09C',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  takaSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F4D3C',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  amountDoneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F4D3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF7F4',
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  secondaryBtnText: {
    color: '#0F4D3C',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4D3C',
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
