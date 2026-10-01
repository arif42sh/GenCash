import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, BackHandler, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SendMoneyScreen } from '../screens/SendMoneyScreen';
import { MobileRechargeScreen } from '../screens/MobileRechargeScreen';
import { CashOutScreen } from '../screens/CashOutScreen';
import { AddMoneyScreen } from '../screens/AddMoneyScreen';
import { MerchantPaymentScreen } from '../screens/MerchantPaymentScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { QRScannerModal } from '../components/QRScannerModal';

export const AppNavigator = () => {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [activeTab, setActiveTab] = useState('Home');
  const [screenStack, setScreenStack] = useState(['Splash']);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const navigate = (screenName) => {
    setScreenStack((prev) => [...prev, screenName]);
    setCurrentScreen(screenName);
  };

  const replace = (screenName) => {
    setScreenStack([screenName]);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    if (screenStack.length > 1) {
      const newStack = [...screenStack];
      newStack.pop();
      const prevScreen = newStack[newStack.length - 1];
      setScreenStack(newStack);
      setCurrentScreen(prevScreen);
    } else {
      replace('Main');
    }
  };

  // Android hardware back button handler
  useEffect(() => {
    const handleHardwareBack = () => {
      if (currentScreen === 'Splash') {
        return false;
      }
      if (screenStack.length > 1) {
        goBack();
        return true;
      }
      if (currentScreen === 'Main' && activeTab !== 'Home') {
        setActiveTab('Home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backHandler.remove();
  }, [screenStack, currentScreen, activeTab]);

  const navigationProp = {
    navigate,
    replace,
    goBack,
  };

  const handleQRScanned = (scannedData) => {
    setShowQRScanner(false);
    navigate('MerchantPayment');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigationProp} />;
      case 'Transactions':
        return <TransactionsScreen navigation={navigationProp} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProp} />;
      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen navigation={navigationProp} />;
      case 'Login':
        return <LoginScreen navigation={navigationProp} />;
      case 'Register':
        return <RegisterScreen navigation={navigationProp} />;
      case 'SendMoney':
        return <SendMoneyScreen navigation={navigationProp} />;
      case 'MobileRecharge':
        return <MobileRechargeScreen navigation={navigationProp} />;
      case 'CashOut':
        return <CashOutScreen navigation={navigationProp} />;
      case 'AddMoney':
        return <AddMoneyScreen navigation={navigationProp} />;
      case 'MerchantPayment':
        return <MerchantPaymentScreen navigation={navigationProp} />;
      case 'Transactions':
        return <TransactionsScreen navigation={navigationProp} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProp} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigationProp} />;
      case 'Settings':
        return <SettingsScreen navigation={navigationProp} />;
      case 'Support':
        return <SupportScreen navigation={navigationProp} />;
      case 'Main':
      default:
        return (
          <View style={styles.mainContainer}>
            <View style={styles.tabContent}>{renderActiveTabContent()}</View>

            {/* Floating Modern White Bottom Navigation Bar */}
            <View style={styles.bottomBarContainer}>
              <View style={styles.bottomBar}>
                {/* 1. Home */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('Home')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={activeTab === 'Home' ? 'home' : 'home-outline'}
                    size={24}
                    color={activeTab === 'Home' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                {/* 2. Transactions */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('Transactions')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={activeTab === 'Transactions' ? 'receipt' : 'receipt-outline'}
                    size={24}
                    color={activeTab === 'Transactions' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                {/* 3. Center Elevated Pine Green QR Scan Button */}
                <TouchableOpacity
                  style={styles.centerQrButton}
                  activeOpacity={0.85}
                  onPress={() => setShowQRScanner(true)}
                >
                  <Ionicons name="scan-outline" size={26} color="#34D399" />
                </TouchableOpacity>

                {/* 4. AI Icon (Future Update) */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setShowAIModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {/* 5. Profile */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('Profile')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={activeTab === 'Profile' ? 'person' : 'person-outline'}
                    size={24}
                    color={activeTab === 'Profile' ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Scanner Modal */}
            <QRScannerModal
              visible={showQRScanner}
              onClose={() => setShowQRScanner(false)}
              onScan={handleQRScanned}
            />

            {/* AI Future Update Modal */}
            <Modal
              visible={showAIModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAIModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.aiModalContent}>
                  <View style={styles.aiIconCircle}>
                    <Ionicons name="sparkles" size={32} color="#00D09C" />
                  </View>

                  <Text style={styles.aiModalTitle}>GenCash AI Assistant</Text>
                  <View style={styles.futureBadge}>
                    <Text style={styles.futureBadgeText}>COMING IN FUTURE UPDATE</Text>
                  </View>

                  <Text style={styles.aiModalDesc}>
                    We are crafting intelligent smart budgets, spending insights, and voice-assisted transfers for you. Stay tuned for the upcoming version!
                  </Text>

                  <TouchableOpacity
                    style={styles.aiModalBtn}
                    onPress={() => setShowAIModal(false)}
                  >
                    <Text style={styles.aiModalBtnText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        );
    }
  };

  return <SafeAreaView style={styles.safeArea}>{renderCurrentScreen()}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F9F6',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F9F6',
  },
  tabContent: {
    flex: 1,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 14 : 12,
    left: 16,
    right: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  centerQrButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  aiModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  aiIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiModalTitle: {
    color: '#0F2F24',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  futureBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 12,
  },
  futureBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiModalDesc: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  aiModalBtn: {
    width: '100%',
    backgroundColor: '#1B4D3E',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  aiModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
