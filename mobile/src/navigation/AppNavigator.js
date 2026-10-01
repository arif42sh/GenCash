import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, BackHandler, Alert } from 'react-native';
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
import { AIHubScreen } from '../screens/AIHubScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { QRScannerModal } from '../components/QRScannerModal';

export const AppNavigator = () => {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [activeTab, setActiveTab] = useState('Home');
  const [screenStack, setScreenStack] = useState(['Splash']);
  const [showQRScanner, setShowQRScanner] = useState(false);

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
      case 'Transactions':
        return <TransactionsScreen navigation={navigationProp} />;
      case 'AIHub':
        return <AIHubScreen navigation={navigationProp} />;
      case 'Profile':
        return <ProfileScreen navigation={navigationProp} />;
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
                >
                  <Ionicons
                    name={activeTab === 'Home' ? 'home' : 'home-outline'}
                    size={24}
                    color={activeTab === 'Home' ? '#1B4D3E' : '#94A3B8'}
                  />
                </TouchableOpacity>

                {/* 2. Transactions */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('Transactions')}
                >
                  <Ionicons
                    name={activeTab === 'Transactions' ? 'receipt' : 'receipt-outline'}
                    size={24}
                    color={activeTab === 'Transactions' ? '#1B4D3E' : '#94A3B8'}
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

                {/* 4. AI Intel */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('AIHub')}
                >
                  <Ionicons
                    name={activeTab === 'AIHub' ? 'sparkles' : 'sparkles-outline'}
                    size={24}
                    color={activeTab === 'AIHub' ? '#1B4D3E' : '#94A3B8'}
                  />
                </TouchableOpacity>

                {/* 5. Profile */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setActiveTab('Profile')}
                >
                  <Ionicons
                    name={activeTab === 'Profile' ? 'person' : 'person-outline'}
                    size={24}
                    color={activeTab === 'Profile' ? '#1B4D3E' : '#94A3B8'}
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
    shadowOpacity: 0.1,
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
});
