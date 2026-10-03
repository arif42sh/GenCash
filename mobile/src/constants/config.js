import { Platform } from 'react-native';

// Local IP of your PC on your network (update this when changing Wi-Fi/networks)
const LOCAL_PC_IP = '192.168.0.207';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // If testing in PC browser, localhost works directly
    return 'http://127.0.0.1:8000';
  }
  // For Physical Android Phone (Expo Go) or Emulators over Wi-Fi
  return `http://${LOCAL_PC_IP}:8000`;
};

export const API_BASE_URL = getBaseUrl();

export const ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/users/me',
  
  // Wallet
  WALLET: '/api/users/me/wallet',
  BALANCE: '/api/wallet/balance',

  // Transactions
  SEND_MONEY: '/api/transactions/send',
  CASH_OUT: '/api/transactions/cashout',
  RECHARGE: '/api/transactions/recharge',
  PAYMENT: '/api/transactions/payment',
  ADD_MONEY: '/api/transactions/add-money',
  TRANSACTIONS: '/api/transactions',

  // Offers
  OFFERS: '/api/offers',

  // AI Intelligence
  AI_INSIGHTS: '/api/ai/insights',
  AI_RECOMMENDATIONS: '/api/ai/recommendations',
  AI_FEEDBACK: '/api/ai/feedback',
  AI_NBO: '/api/ai/next-best-offers',
  AI_CAMPAIGN_SIMULATE: '/api/ai/campaigns/simulate',

  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

export const DEMO_ACCOUNTS = [
  {
    name: "Tanvir Ahmed",
    phone: "01711111111",
    pin: "123456",
    role: "Regular Customer",
    balance: "৳ 12,500"
  },
  {
    name: "Sadia Rahman",
    phone: "01822222222",
    pin: "123456",
    role: "Merchant / User",
    balance: "৳ 8,200"
  },
  {
    name: "Rafiqul Islam",
    phone: "01933333333",
    pin: "123456",
    role: "Student Account",
    balance: "৳ 4,500"
  }
];

export const MOBILE_OPERATORS = [
  { id: 'GP', name: 'Grameenphone', code: '017 / 013', color: '#0078FF', logo: 'cellular', logoAsset: 'gp' },
  { id: 'ROBI', name: 'Robi', code: '018', color: '#E40000', logo: 'flash', logoAsset: 'robi' },
  { id: 'BL', name: 'Banglalink', code: '019 / 014', color: '#FF7700', logo: 'flame', logoAsset: 'banglalink' },
  { id: 'AIRTEL', name: 'Airtel', code: '016', color: '#ED1B24', logo: 'heart', logoAsset: 'airtel' },
  { id: 'TT', name: 'Teletalk', code: '015', color: '#009944', logo: 'leaf', logoAsset: 'teletalk' },
];

export const TRANSACTION_FEES = {
  SEND_MONEY: 5.00,
  CASH_OUT_PERCENT: 0.0185, // 1.85%
  RECHARGE: 0.00,
  PAYMENT: 0.00,
  ADD_MONEY: 0.00,
};

