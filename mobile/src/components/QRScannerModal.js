import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const SAMPLE_MERCHANTS = [
  { id: 1, name: 'Shwapno Superstore', phone: '01700100001', code: 'MCH-01-SHWAPNO' },
  { id: 3, name: 'Chillox Burger Hub', phone: '01700100003', code: 'MCH-03-CHILLOX' },
  { id: 4, name: 'Star Tech Ltd', phone: '01700100004', code: 'MCH-04-STARTECH' },
  { id: 5, name: 'Apex Footwear', phone: '01700100005', code: 'MCH-05-APEX' },
];

export const QRScannerModal = ({ visible, onClose, onScanSuccess, onScan }) => {
  const [scanAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const handleSelectSimulatedMerchant = (m) => {
    const callback = onScanSuccess || onScan;
    if (typeof callback === 'function') {
      callback(m);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="qr-code-outline" size={22} color={colors.textHighlight} />
              <Text style={styles.title}>Scan Merchant QR Code</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            Align the merchant's QR code inside the frame to scan.
          </Text>

          {/* Animated Viewfinder */}
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />

            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.2)" />
          </View>

          {/* Quick Mock QR Codes for Instant Testing */}
          <Text style={styles.mockLabel}>Or tap a sample Merchant QR code:</Text>
          <View style={styles.mockList}>
            {SAMPLE_MERCHANTS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.mockItem}
                onPress={() => handleSelectSimulatedMerchant(m)}
              >
                <Ionicons name="storefront-outline" size={18} color="#EC4899" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.mockName}>{m.name}</Text>
                  <Text style={styles.mockPhone}>{m.phone}</Text>
                </View>
                <Ionicons name="scan-outline" size={16} color={colors.textHighlight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  viewfinder: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  scanLine: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3 },
  mockLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  mockList: {
    width: '100%',
    gap: 6,
  },
  mockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  mockName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  mockPhone: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
