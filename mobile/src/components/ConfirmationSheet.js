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
import { colors } from '../constants/colors';
import { CustomInput } from './CustomInput';

export const ConfirmationSheet = ({
  visible,
  title = "Confirm Transaction",
  recipientLabel = "Receiver",
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
  const total = Number(amount) + Number(fee);
  const holdProgress = useRef(new Animated.Value(0)).current;
  const [isHolding, setIsHolding] = useState(false);

  const startHold = () => {
    if (!pin) {
      return;
    }
    setIsHolding(true);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onConfirm();
      }
    });
  };

  const stopHold = () => {
    setIsHolding(false);
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>Total Deducted</Text>
            <Text style={styles.totalAmount}>৳ {total.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <Text style={styles.label}>{recipientLabel}</Text>
              <Text style={styles.value}>{recipientValue}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Transfer Amount</Text>
              <Text style={styles.value}>৳ {Number(amount).toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Service Charge / Fee</Text>
              <Text style={styles.value}>৳ {Number(fee).toFixed(2)}</Text>
            </View>

            {note ? (
              <View style={styles.row}>
                <Text style={styles.label}>Reference / Note</Text>
                <Text style={styles.value}>{note}</Text>
              </View>
            ) : null}
          </View>

          <CustomInput
            label="Enter Account PIN"
            value={pin}
            onChangeText={setPin}
            placeholder="Enter 5-digit PIN"
            icon="key-outline"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Iconic Tap & Hold to Confirm Button */}
          <View style={styles.holdContainer}>
            <Pressable
              onPressIn={startHold}
              onPressOut={stopHold}
              disabled={isLoading || !pin}
              style={[
                styles.holdButton,
                (!pin || isLoading) && styles.holdButtonDisabled,
              ]}
            >
              {/* Animated Progress Fill */}
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
                    <View style={styles.logoBadge}>
                      <Ionicons name="finger-print" size={22} color="#00D09C" />
                    </View>
                    <Text style={styles.holdButtonText}>
                      {isHolding ? 'Holding to Confirm...' : 'Tap & Hold to Confirm'}
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
            <Text style={styles.holdHintText}>
              {!pin ? '⚠️ Enter your PIN first' : 'Touch and hold until the circle fills'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1,
    borderColor: '#E2EFE9',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
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
    backgroundColor: '#E8F7F0',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D2EFE2',
  },
  amountLabel: {
    color: '#47665C',
    fontSize: 12,
    marginBottom: 2,
  },
  totalAmount: {
    color: '#064E3B',
    fontSize: 26,
    fontWeight: '800',
  },
  breakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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

  // Hold button
  holdContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  holdButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#064E3B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  holdButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#00D09C',
  },
  holdButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  holdButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  holdHintText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
});
