import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants/config';
import { storage } from './storage';

let currentBaseUrl = API_BASE_URL;

const apiClient = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to dynamically inject custom stored base URL and JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const storedUrl = await storage.getItem('@gencash_server_url');
      if (storedUrl) {
        config.baseURL = storedUrl;
      }
      const token = await storage.getItem('@gencash_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Network connection error. Is the backend server running?';
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail.map((d) => d.msg || d.message).join(', ');
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const api = {
  async setCustomBaseUrl(url) {
    if (url) {
      let clean = url.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `http://${clean}`;
      }
      currentBaseUrl = clean;
      apiClient.defaults.baseURL = clean;
      await storage.setItem('@gencash_server_url', clean);
      return clean;
    }
  },

  async getActiveBaseUrl() {
    const stored = await storage.getItem('@gencash_server_url');
    return stored || currentBaseUrl;
  },

  // Auth
  async login(phone, password) {
    const res = await apiClient.post(ENDPOINTS.LOGIN, { phone, password });
    return res.data;
  },

  async register(name, phone, email, password) {
    const res = await apiClient.post(ENDPOINTS.REGISTER, {
      name,
      phone,
      email: email || null,
      password,
    });
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch (e) {}
    await storage.removeItem('@gencash_token');
    await storage.removeItem('@gencash_user');
  },

  async getMe() {
    const res = await apiClient.get(ENDPOINTS.ME);
    return res.data;
  },

  async updateProfile(updates) {
    const res = await apiClient.put(ENDPOINTS.ME, updates);
    return res.data;
  },

  async changePin(oldPin, newPin) {
    const res = await apiClient.post('/api/auth/change-pin', {
      old_pin: oldPin,
      new_pin: newPin,
    });
    return res.data;
  },

  async uploadAvatar(base64DataOrUri) {
    const res = await apiClient.put(ENDPOINTS.ME, { avatar: base64DataOrUri });
    return res.data;
  },

  // Wallet
  async getWallet() {
    const res = await apiClient.get(ENDPOINTS.WALLET);
    return res.data;
  },

  async getBalance() {
    const res = await apiClient.get(ENDPOINTS.BALANCE);
    return res.data;
  },

  // Transactions
  async sendMoney(receiverPhone, amount, note, password) {
    const res = await apiClient.post(ENDPOINTS.SEND_MONEY, {
      receiver_phone: receiverPhone,
      amount: parseFloat(amount),
      note: note || undefined,
      password: password,
    });
    return res.data;
  },

  async cashOut(agentPhone, amount, password) {
    const res = await apiClient.post(ENDPOINTS.CASH_OUT, {
      agent_phone: agentPhone,
      amount: parseFloat(amount),
      password: password,
    });
    return res.data;
  },

  async mobileRecharge(mobileNumber, operator, amount, rechargeType = 'PREPAID', password = null) {
    const res = await apiClient.post(ENDPOINTS.RECHARGE, {
      mobile_number: mobileNumber,
      operator,
      amount: parseFloat(amount),
      recharge_type: rechargeType,
      password: password || undefined,
    });
    return res.data;
  },

  async merchantPayment(merchantPhone, amount, note, merchantId, password) {
    const res = await apiClient.post(ENDPOINTS.PAYMENT, {
      merchant_phone: merchantPhone || undefined,
      merchant_id: merchantId || undefined,
      amount: parseFloat(amount),
      note: note || undefined,
      password: password,
    });
    return res.data;
  },

  async addMoney(amount, sourceBankOrCard) {
    const res = await apiClient.post(ENDPOINTS.ADD_MONEY, {
      amount: parseFloat(amount),
      source_bank_or_card: sourceBankOrCard || 'Bank Account',
    });
    return res.data;
  },

  async getTransactions(type = null, limit = 50, offset = 0) {
    const params = { limit, offset };
    if (type && type !== 'ALL') {
      params.type = type;
    }
    const res = await apiClient.get(ENDPOINTS.TRANSACTIONS, { params });
    return res.data;
  },

  async getTransactionById(id) {
    const res = await apiClient.get(`${ENDPOINTS.TRANSACTIONS}/${id}`);
    return res.data;
  },

  // Offers
  async getOffers() {
    const res = await apiClient.get(ENDPOINTS.OFFERS);
    return res.data;
  },

  async getActivePopupOffer() {
    try {
      const res = await apiClient.get('/api/offers/popup/active');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  // AI Intelligence
  async getAIInsights() {
    const res = await apiClient.get(ENDPOINTS.AI_INSIGHTS);
    return res.data;
  },

  async getAIRecommendations() {
    const res = await apiClient.get(ENDPOINTS.AI_RECOMMENDATIONS);
    return res.data;
  },

  async submitAIFeedback(insightId, actionTaken, comment = null) {
    const res = await apiClient.post(ENDPOINTS.AI_FEEDBACK, {
      insight_id: insightId,
      action_taken: actionTaken,
      comment,
    });
    return res.data;
  },

  async getNextBestOffers() {
    try {
      const res = await apiClient.get(ENDPOINTS.AI_NBO);
      return res.data;
    } catch (e) {
      console.warn('AI NBO fetch warning:', e);
      return null;
    }
  },

  async simulateCampaign(budget = 100000, audienceSize = 50000, discount = 79) {
    const res = await apiClient.get(ENDPOINTS.AI_CAMPAIGN_SIMULATE, {
      params: { budget, audience_size: audienceSize, discount_value: discount },
    });
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await apiClient.get(ENDPOINTS.NOTIFICATIONS);
    return res.data;
  },

  async markNotificationRead(id) {
    try {
      const res = await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`);
      return res.data;
    } catch (e) {
      return null;
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/read-all`);
      return res.data;
    } catch (e) {
      return null;
    }
  },
};

export default api;

