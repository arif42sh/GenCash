import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  BackHandler,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { AIHubScreen } from '../screens/AIHubScreen';
import { QRScannerModal } from '../components/QRScannerModal';

export const AppNavigator = () => {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [activeTab, setActiveTab] = useState('Home');
  const [screenStack, setScreenStack] = useState(['Splash']);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    if (currentScreen !== 'Main') {
      setCurrentScreen('Main');
      setScreenStack(['Main']);
    }
  };

  const navigate = (screenName) => {
    // If navigating to one of the bottom tabs, switch to that tab within Main
    if (screenName === 'Home') {
      switchTab('Home');
      return;
    }
    if (screenName === 'Transactions' || screenName === 'History') {
      switchTab('Transactions');
      return;
    }
    if (screenName === 'AIHub' || screenName === 'AI') {
      setShowAIModal(true);
      return;
    }
    if (screenName === 'Profile') {
      switchTab('Profile');
      return;
    }

    setScreenStack((prev) => [...prev, screenName]);
    setCurrentScreen(screenName);
  };

  const replace = (screenName) => {
    if (screenName === 'Home' || screenName === 'Main') {
      switchTab('Home');
      return;
    }
    if (screenName === 'Transactions' || screenName === 'History') {
      switchTab('Transactions');
      return;
    }
    if (screenName === 'AIHub' || screenName === 'AI') {
      setShowAIModal(true);
      return;
    }
    if (screenName === 'Profile') {
      switchTab('Profile');
      return;
    }

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
      if (activeTab !== 'Home') {
        setActiveTab('Home');
      }
      setCurrentScreen('Main');
      setScreenStack(['Main']);
    }
  };

  // Android hardware back button handler
  useEffect(() => {
    const handleHardwareBack = () => {
      if (currentScreen === 'Splash') {
        return false;
      }
      if (showAIModal) {
        setShowAIModal(false);
        return true;
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
  }, [screenStack, currentScreen, activeTab, showAIModal]);

  const navigationProp = {
    navigate,
    replace,
    goBack,
    switchTab,
    setActiveTab: switchTab,
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
      case 'AIHub':
        return <AIHubScreen navigation={navigationProp} />;
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

            {/* Floating Modern White Bottom Navigation Bar (Matches Screenshot) */}
            <View style={styles.bottomBarContainer} pointerEvents="box-none">
              <View style={styles.bottomBar} pointerEvents="auto">
                {/* 1. Home */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => switchTab('Home')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={activeTab === 'Home' ? 'home' : 'home-outline'}
                    size={26}
                    color={activeTab === 'Home' ? '#0F382C' : '#64748B'}
                  />
                </TouchableOpacity>

                {/* 2. History / Transactions */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => switchTab('Transactions')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={28}
                    color={activeTab === 'Transactions' ? '#0F382C' : '#64748B'}
                  />
                </TouchableOpacity>

                {/* 3. Center Elevated Dark Emerald QR Scan Button */}
                <TouchableOpacity
                  style={styles.centerQrButton}
                  activeOpacity={0.85}
                  onPress={() => setShowQRScanner(true)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color="#34D399" />
                  <Text style={styles.centerQrText}>QR Scanner</Text>
                </TouchableOpacity>

                {/* 4. AI Hub (Coming Soon Preview Modal) */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setShowAIModal(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={26}
                    color="#64748B"
                  />
                </TouchableOpacity>

                {/* 5. Profile */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => switchTab('Profile')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={activeTab === 'Profile' ? 'person' : 'person-outline'}
                    size={26}
                    color={activeTab === 'Profile' ? '#0F382C' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Scanner Modal */}
            <QRScannerModal
              visible={showQRScanner}
              onClose={() => setShowQRScanner(false)}
              onScan={handleQRScanned}
              onScanSuccess={handleQRScanned}
            />

            {/* AI Assistant Coming Soon Modal */}
            <Modal
              visible={showAIModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAIModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.aiModalContent}>
                  <View style={styles.aiIconCircle}>
                    <Ionicons name="sparkles" size={32} color="#0F4D3C" />
                  </View>

                  <Text style={styles.aiModalTitle}>GenCash AI Assistant</Text>
                  <View style={styles.futureBadge}>
                    <Text style={styles.futureBadgeText}>COMING SOON • পরবর্তী আপডেটে আসছে</Text>
                  </View>

                  <Text style={styles.aiModalDesc}>
                    আমরা আপনার জন্য ইন্টেলিজেন্ট স্মার্ট বাজেট, পার্সোনালাইজড ক্যাশব্যাক ইনসাইটস এবং ভয়েস অ্যাসিস্টেড ট্রান্সফার ফিচার নিয়ে কাজ করছি। পরবর্তী আপডেটে এটি সম্পূর্ণ উন্মুক্ত হবে!
                  </Text>

                  <TouchableOpacity
                    style={styles.aiModalBtn}
                    activeOpacity={0.85}
                    onPress={() => setShowAIModal(false)}
                  >
                    <Text style={styles.aiModalBtnText}>Got It • বুঝতে পেরেছি</Text>
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
    backgroundColor: '#EDF7F4',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#EDF7F4',
    position: 'relative',
  },
  tabContent: {
    flex: 1,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 14 : 12,
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 25,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 68,
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 25,
    borderWidth: 1,
    borderColor: '#DFEFE8',
    overflow: 'visible',
    zIndex: 100000,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 56,
    zIndex: 100001,
  },
  centerQrButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0F4D3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 30,
    marginTop: -26,
    borderWidth: 3,
    borderColor: '#EDF7F4',
    zIndex: 100002,
  },
  centerQrText: {
    color: '#A7D8CA',
    fontSize: 8.5,
    fontWeight: '700',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999999,
  },
  aiModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0E4839',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  aiIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#D6F4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  aiModalTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  futureBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
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
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  aiModalBtn: {
    width: '100%',
    backgroundColor: '#0F4D3C',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0F4D3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  aiModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
