import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { CustomInput } from './CustomInput';

export const ConfirmationSheet = ({
  visible,
  title,
  recipientLabel,
  recipientValue,
  amount = 0,
  fee = 0,
  note,
  pin,
  setPin,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { isBangla } = useLanguage();
  const total = Number(amount) + Number(fee);
  const holdProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isHolding, setIsHolding] = useState(false);

  const startHold = () => {
    if (!pin || pin.length < 4) {
      return;
    }
    setIsHolding(true);

    // Subtle breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start(({ finished }) => {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (finished) {
        onConfirm();
      }
    });
  };

  const stopHold = () => {
    setIsHolding(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const progressWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const displayTitle = title || (isBangla ? 'লেনদেন নিশ্চিতকরণ' : 'Confirm Transaction');
  const displayRecipientLabel = recipientLabel || (isBangla ? 'প্রাপক' : 'Receiver');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>{displayTitle}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Total Amount Callout Card */}
          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>
              {isBangla ? 'সর্বমোট কর্তন করা হবে' : 'Total Amount to be Deducted'}
            </Text>
            <Text style={styles.totalAmount}>৳ {total.toFixed(2)}</Text>
          </View>

          {/* Breakdown Card */}
          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <Text style={styles.label}>{displayRecipientLabel}</Text>
              <Text style={styles.value}>{recipientValue}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{isBangla ? 'মূল পরিমাণ' : 'Transfer Amount'}</Text>
              <Text style={styles.value}>৳ {Number(amount).toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{isBangla ? 'চার্জ / ফি' : 'Service Fee'}</Text>
              <Text style={styles.value}>৳ {Number(fee).toFixed(2)}</Text>
            </View>

            {note ? (
              <View style={styles.row}>
                <Text style={styles.label}>{isBangla ? 'রেফারেন্স / নোট' : 'Reference Note'}</Text>
                <Text style={styles.value}>{note}</Text>
              </View>
            ) : null}
          </View>

          <CustomInput
            label={isBangla ? 'আপনার অ্যাকাউন্টের ৫-ডিজিট পিন দিন' : 'Enter 5-digit Account PIN'}
            value={pin}
            onChangeText={setPin}
            placeholder="•••••"
            icon="lock-closed-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Iconic bKash/Nagad Style "Tap & Hold to Confirm" Button */}
          <View style={styles.holdContainer}>
            <Pressable
              onPressIn={startHold}
              onPressOut={stopHold}
              disabled={isLoading || !pin || pin.length < 4}
              style={[
                styles.holdButton,
                (!pin || pin.length < 4 || isLoading) && styles.holdButtonDisabled,
              ]}
            >
              {/* Dynamic Animated Filling Background */}
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />

              <View style={styles.holdButtonContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Animated.View
                      style={[
                        styles.logoBadge,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <Ionicons
                        name="finger-print"
                        size={24}
                        color={isHolding ? '#0F4D3C' : '#34D399'}
                      />
                    </Animated.View>
                    <Text style={styles.holdButtonText}>
                      {isHolding
                        ? (isBangla ? 'ধরে রাখুন...' : 'Holding to Confirm...')
                        : (isBangla ? 'ট্যাপ করে ধরে রাখুন' : 'Tap & Hold to Confirm')}
                    </Text>
                  </>
                )}
              </View>
            </Pressable>

            <Text style={styles.holdHintText}>
              {!pin || pin.length < 4
                ? (isBangla ? '⚠️ অনুগ্রহ করে আগে সঠিক পিন নম্বর দিন' : '⚠️ Enter account PIN first')
                : (isBangla ? 'বৃত্তটি সম্পূর্ণ পূরণ হওয়া পর্যন্ত চেপে ধরে রাখুন' : 'Touch and hold until the button completes')}
            </Text>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#DFEFE8',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  amountBanner: {
    backgroundColor: '#EDF7F4',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7E8DE',
  },
  amountLabel: {
    color: '#47665C',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalAmount: {
    color: '#0F4D3C',
    fontSize: 28,
    fontWeight: '800',
  },
  breakdownCard: {
    backgroundColor: '#F8FCFA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DFEFE8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    color: '#64748B',
    fontSize: 13,
  },
  value: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  holdContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  holdButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0F4D3C',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  holdButtonDisabled: {
    backgroundColor: '#94A3B8',
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#34D399',
  },
  holdButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  holdButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  holdHintText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
