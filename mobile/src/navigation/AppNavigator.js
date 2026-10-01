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

export const AppNavigator = () => {
  const { user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [activeTab, setActiveTab] = useState('Home');
  const [screenStack, setScreenStack] = useState(['Splash']);

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
      return false; // let OS exit app if already on Home tab
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backHandler.remove();
  }, [screenStack, currentScreen, activeTab]);

  const navigationProp = {
    navigate,
    replace,
    goBack,
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
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('Home')}
              >
                <Ionicons
                  name={activeTab === 'Home' ? 'home' : 'home-outline'}
                  size={22}
                  color={activeTab === 'Home' ? '#00D09C' : '#7BA599'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'Home' && styles.tabLabelActive,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('Transactions')}
              >
                <Ionicons
                  name={activeTab === 'Transactions' ? 'receipt' : 'receipt-outline'}
                  size={22}
                  color={activeTab === 'Transactions' ? '#00D09C' : '#7BA599'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'Transactions' && styles.tabLabelActive,
                  ]}
                >
                  History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, styles.aiTabItem]}
                onPress={() => setActiveTab('AIHub')}
              >
                <View style={[styles.aiIconBubble, activeTab === 'AIHub' && styles.aiIconBubbleActive]}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: activeTab === 'AIHub' ? '#00D09C' : '#7BA599' },
                    activeTab === 'AIHub' && styles.tabLabelActive,
                  ]}
                >
                  AI Intel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('Profile')}
              >
                <Ionicons
                  name={activeTab === 'Profile' ? 'person' : 'person-outline'}
                  size={22}
                  color={activeTab === 'Profile' ? '#00D09C' : '#7BA599'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'Profile' && styles.tabLabelActive,
                  ]}
                >
                  Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return <SafeAreaView style={styles.safeArea}>{renderCurrentScreen()}</SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContent: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#043227',
    borderTopWidth: 0,
    marginHorizontal: 12,
    marginBottom: Platform.OS === 'ios' ? 10 : 12,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    shadowColor: '#043227',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7BA599',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#00D09C',
    fontWeight: '700',
  },
  aiTabItem: {
    position: 'relative',
  },
  aiIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 208, 156, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIconBubbleActive: {
    backgroundColor: '#00D09C',
  },
});
