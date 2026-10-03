import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';

const NotificationContext = createContext();

const READ_STORAGE_KEY = '@gencash_read_notification_ids';

const DEFAULT_MOCK_NOTIFICATIONS = [
  {
    id: 'mock_1',
    title: '৳50 Cashback Received',
    message: 'Congratulations! You received ৳50.00 instant cashback on your grocery shopping payment at Shwapno Superstore. TxnID: TXNCB8921',
    type: 'CASHBACK',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    actionScreen: 'MerchantPayment',
    actionLabel: 'Shop Again',
  },
  {
    id: 'mock_2',
    title: 'Money Received +৳500',
    message: 'Sadia Rahman (01822222222) sent you ৳500.00.\n\nReference: Dinner split\nNew Balance: ৳12,500.00\nTxnID: TXN349102',
    type: 'RECEIVED',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionScreen: 'Transactions',
    actionLabel: 'View Statement',
  },
  {
    id: 'mock_3',
    title: 'Send Money Successful -৳1,000',
    message: 'You have sent ৳1,000.00 to Rafiqul Islam (01933333333). Fee: ৳5.00. TxnID: TXN772810',
    type: 'SENT',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actionScreen: 'SendMoney',
    actionLabel: 'Send Again',
  },
  {
    id: 'mock_4',
    title: 'Mobile Recharge Successful -৳100',
    message: 'Your mobile recharge of ৳100.00 to 01711000000 (Grameenphone) has been processed.\n\nTxnID: TXN849201\nStatus: COMPLETED',
    type: 'RECHARGE',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    actionScreen: 'MobileRecharge',
    actionLabel: 'Recharge Again',
  },
  {
    id: 'mock_5',
    title: 'KYC Verification Approved',
    message: 'Your national identity verification was verified successfully. Your daily wallet limits have been upgraded to Level 2 (৳200,000/day).',
    type: 'SECURITY',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    actionScreen: 'Profile',
    actionLabel: 'View Profile',
  },
  {
    id: 'mock_6',
    title: 'Super Weekend 50% Cashback!',
    message: 'Limited time promo on all merchant QR payments across 500+ partner outlets this weekend! Max cashback ৳150.',
    type: 'OFFER',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    actionScreen: 'MerchantPayment',
    actionLabel: 'View Deals',
  },
  {
    id: 'mock_7',
    title: 'New Device Login Alert',
    message: 'A new login session was detected from an Android device in Dhaka, Bangladesh.\n\nIf this was not you, please change your PIN immediately from Settings > Security.',
    type: 'SECURITY',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    actionScreen: 'Settings',
    actionLabel: 'Security Settings',
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const readIdsRef = useRef(new Set());

  // Load persisted read IDs on initial mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getItem(READ_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const loaded = new Set(parsed.map(String));
            readIdsRef.current = loaded;
            setReadIds(loaded);
          }
        }
      } catch (e) {
        console.warn('Failed to load read notification ids:', e);
      }
    })();
  }, []);

  const persistReadIds = async (newSet) => {
    try {
      const arr = Array.from(newSet);
      await storage.setItem(READ_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to persist read notification ids:', e);
    }
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const currentReadIds = readIdsRef.current;

      let serverNotifs = null;
      try {
        serverNotifs = await api.getNotifications();
      } catch (e) {
        serverNotifs = null;
      }

      let list = [];
      if (Array.isArray(serverNotifs) && serverNotifs.length > 0) {
        list = serverNotifs.map((n) => {
          const strId = String(n.id);
          const isRead = Boolean(n.is_read) || currentReadIds.has(strId);
          return {
            id: strId,
            title: n.title,
            message: n.message,
            type: n.type || 'TRANSACTION',
            is_read: isRead,
            created_at: n.created_at || new Date().toISOString(),
          };
        });
      } else {
        // Fallback to default mock notifications with preserved read status
        list = DEFAULT_MOCK_NOTIFICATIONS.map((m) => {
          const strId = String(m.id);
          const isRead = m.is_read || currentReadIds.has(strId);
          return {
            ...m,
            is_read: isRead,
          };
        });
      }

      setNotifications(list);
    } catch (e) {
      console.warn('Fetch notifications error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const markNotificationRead = useCallback(
    async (id) => {
      const strId = String(id);
      readIdsRef.current.add(strId);
      persistReadIds(readIdsRef.current);
      setReadIds(new Set(readIdsRef.current));

      setNotifications((prev) =>
        prev.map((n) => (n.id === strId ? { ...n, is_read: true } : n))
      );

      if (!strId.startsWith('mock_')) {
        try {
          await api.markNotificationRead(id);
        } catch (e) {}
      }
    },
    []
  );

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => {
      prev.forEach((n) => readIdsRef.current.add(String(n.id)));
      persistReadIds(readIdsRef.current);
      setReadIds(new Set(readIdsRef.current));
      return prev.map((n) => ({ ...n, is_read: true }));
    });

    try {
      await api.markAllNotificationsRead();
    } catch (e) {}
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: async () => {},
      markNotificationRead: async () => {},
      markAllNotificationsRead: async () => {},
    };
  }
  return context;
};
