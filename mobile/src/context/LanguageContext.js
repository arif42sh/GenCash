import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const TRANSLATIONS = {
  en: {
    // Header & Common
    hello: 'Hello',
    welcomeBack: 'Welcome Back!',
    notifications: 'Notifications',
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    bangla: 'বাংলা',
    done: 'Done',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    share: 'Share',
    confirm: 'Confirm',
    proceed: 'Proceed',
    success: 'Success',
    back: 'Back',

    // Balance Card
    tapForBalance: 'Tap for balance',
    availableBalance: 'Available Balance',
    addMoney: 'Add Money',
    sendMoney: 'Send Money',
    cashOut: 'Cash Out',
    recharge: 'Recharge',
    payment: 'Payment',

    // Services
    otherServices: 'Other Services',
    billPay: 'Bill Pay',
    bankTransfer: 'Bank Transfer',
    savings: 'Savings',
    electricity: 'Electricity',
    movie: 'Movie',
    merchant: 'Merchant',

    // Home Sections
    sendAgain: 'Send Again',
    newContact: 'New Contact +',
    specialOffers: 'Special Offers',
    combosBogo: 'Combos & BOGO',
    featuredBrands: 'Featured Partner Brands',
    seeAll: 'See All',
    claim: 'Claim',
    useOfferNow: 'Use Offer Now',

    // Navigation Tabs
    navHome: 'Home',
    navHistory: 'History',
    navProfile: 'Profile',
    navAssistant: 'Assistant',

    // Settings Screen
    appSettings: 'App Settings',
    generalPreferences: 'General Preferences',
    languageSubtitle: 'Switch between English and Bengali',
    notificationsSubtitle: 'Transaction SMS and Push alerts',
    securityCredentials: 'Security & Credentials',
    changePin: 'Change PIN',
    changePinSub: 'Update your 6-digit transaction PIN',
    biometricLogin: 'Biometric Face ID / Fingerprint',
    biometricSub: 'Unlock app instantly with fingerprint',
    aboutApp: 'About & Support',
    termsPolicy: 'Terms of Service & Privacy',
    helpCenter: 'Help & Customer Care',
    appVersion: 'App Version',
  },
  bn: {
    // Header & Common
    hello: 'হ্যালো',
    welcomeBack: 'স্বাগতম!',
    notifications: 'নোটিফিকেশন',
    settings: 'সেটিংস',
    language: 'ভাষা (Language)',
    english: 'English',
    bangla: 'বাংলা',
    done: 'সম্পন্ন',
    close: 'বন্ধ করুন',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    share: 'শেয়ার',
    confirm: 'নিশ্চিত করুন',
    proceed: 'এগিয়ে যান',
    success: 'সফল হয়েছে',
    back: 'ফিরে যান',

    // Balance Card
    tapForBalance: 'ব্যালেন্স দেখতে ট্যাপ করুন',
    availableBalance: 'সর্বমোট ব্যালেন্স',
    addMoney: 'টাকা যোগ',
    sendMoney: 'টাকা পাঠান',
    cashOut: 'ক্যাশ আউট',
    recharge: 'মোবাইল রিচার্জ',
    payment: 'মার্চেন্ট পেমেন্ট',

    // Services
    otherServices: 'অন্যান্য সার্ভিস',
    billPay: 'বিল পে',
    bankTransfer: 'ব্যাংক ট্রান্সফার',
    savings: 'সেভিংস',
    electricity: 'বিদ্যুৎ বিল',
    movie: 'মুভি টিকেট',
    merchant: 'মার্চেন্ট পে',

    // Home Sections
    sendAgain: 'দ্রুত টাকা পাঠান',
    newContact: 'নতুন নম্বর +',
    specialOffers: 'বিশেষ অফারসমূহ',
    combosBogo: 'কম্বো ও ১+১ অফার',
    featuredBrands: 'পার্টনার ব্র্যান্ডসমূহ',
    seeAll: 'সব দেখুন',
    claim: 'কুপন নিন',
    useOfferNow: 'অফারটি ব্যবহার করুন',

    // Navigation Tabs
    navHome: 'হোম',
    navHistory: 'ইতিহাস',
    navProfile: 'প্রোফাইল',
    navAssistant: 'অ্যাসিস্ট্যান্ট',

    // Settings Screen
    appSettings: 'অ্যাপ সেটিংস',
    generalPreferences: 'সাধারণ সেটিংস',
    languageSubtitle: 'বাংলা এবং ইংরেজির মধ্যে পরিবর্তন করুন',
    notificationsSubtitle: 'লেনদেন এসএমএস ও পুশ অ্যালার্ট',
    securityCredentials: 'নিরাপত্তা ও পিন',
    changePin: 'পিন পরিবর্তন',
    changePinSub: 'আপনার ৬-ডিজিট লেনদেন পিন আপডেট করুন',
    biometricLogin: 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট',
    biometricSub: 'আঙুলের ছোঁয়ায় সহজে লগইন করুন',
    aboutApp: 'অ্যাপ সম্পর্কিত ও সাপোর্ট',
    termsPolicy: 'শর্তাবলী ও প্রাইভেসী পলিসি',
    helpCenter: 'হেল্প ও কাস্টমার কেয়ার',
    appVersion: 'অ্যাপ ভার্সন',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en'); // 'en' or 'bn'

  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await storage.getItem('@gencash_language');
        if (stored === 'bn' || stored === 'en') {
          setLanguageState(stored);
        }
      } catch (e) {}
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    try {
      await storage.setItem('@gencash_language', lang);
    } catch (e) {}
  };

  const toggleLanguage = async () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    await setLanguage(nextLang);
  };

  const t = (key, defaultText) => {
    return TRANSLATIONS[language]?.[key] || defaultText || key;
  };

  // Helper to convert English numbers to Bengali numerals if language is 'bn'
  const toBengaliNumber = (numStr) => {
    if (language !== 'bn') return numStr;
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(numStr).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        toBengaliNumber,
        isBangla: language === 'bn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
