import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export const SplashScreen = ({ navigation }) => {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={48} color={colors.primary} />
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={16} color={colors.secondary} />
          </View>
        </View>

        <Text style={styles.brandTitle}>GenCash</Text>
        <Text style={styles.tagline}>AI-Powered Smart Digital Finance</Text>

        <View style={styles.hackathonBadge}>
          <Text style={styles.hackathonText}>AI Hackathon 2026</Text>
          <Text style={styles.hackathonSub}>DIU CPC × upay</Text>
        </View>

        <ActivityIndicator
          size="small"
          color={colors.primaryLight}
          style={styles.spinner}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    position: 'relative',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 0.8,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  hackathonBadge: {
    marginTop: 40,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hackathonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hackathonSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  spinner: {
    marginTop: 32,
  },
});
