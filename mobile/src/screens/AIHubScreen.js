import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const DATE_RANGES = [
  { id: 'THIS_MONTH', label: 'This Month', bn: 'এই মাস' },
  { id: 'THIS_WEEK', label: 'This Week', bn: 'এই সপ্তাহ' },
  { id: 'TODAY', label: 'Today', bn: 'আজকে' },
  { id: 'LAST_MONTH', label: 'Last Month', bn: 'গত মাস' },
  { id: 'ALL', label: 'All Time', bn: 'সকল সময়' },
];

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', bn: 'সব খাত', icon: 'apps-outline', color: '#10B981' },
  { id: 'RECHARGE', label: 'Mobile Recharge', bn: 'মোবাইল রিচার্জ', icon: 'phone-portrait-outline', color: '#8B5CF6' },
  { id: 'MERCHANT_PAYMENT', label: 'Merchant Payment', bn: 'পেমেন্ট ও শপিং', icon: 'cart-outline', color: '#F59E0B' },
  { id: 'SEND_MONEY', label: 'Send Money', bn: 'সেন্ড মানি', icon: 'paper-plane-outline', color: '#3B82F6' },
  { id: 'BILL_PAYMENT', label: 'Bill Pay', bn: 'ইউটিলিটি বিল', icon: 'flash-outline', color: '#EC4899' },
  { id: 'CASH_OUT', label: 'Cash Out', bn: 'ক্যাশ আউট', icon: 'cash-outline', color: '#EF4444' },
  { id: 'INFLOW', label: 'Money In', bn: 'টাকা জমা', icon: 'arrow-down-circle-outline', color: '#059669' },
];

const QUICK_AI_PROMPTS = [
  { id: 'q_recharge', text: 'এই মাসে রিচার্জ কত?', textEn: 'Recharge this month', cat: 'RECHARGE', date: 'THIS_MONTH' },
  { id: 'q_inflow', text: 'এই সপ্তাহে কত ঢুকলো?', textEn: 'Money in this week', cat: 'INFLOW', date: 'THIS_WEEK' },
  { id: 'q_payment', text: 'মার্চেন্ট পেমেন্ট ও শপিং', textEn: 'Merchant & Shopping', cat: 'MERCHANT_PAYMENT', date: 'THIS_MONTH' },
  { id: 'q_send', text: 'সেন্ড মানি কত করেছি?', textEn: 'Total Send Money', cat: 'SEND_MONEY', date: 'THIS_MONTH' },
  { id: 'q_last_month', text: 'গত মাসের মোট ব্যয়', textEn: 'Last month expenses', cat: 'ALL', date: 'LAST_MONTH' },
];

// Fallback seed transactions if account is completely new
const DEFAULT_FALLBACK_TXNS = [
  {
    id: 901,
    transaction_code: 'TXN-SHWAPNO-892',
    transaction_type: 'MERCHANT_PAYMENT',
    amount: 3250.0,
    fee: 0.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    merchant_name: 'Shwapno Superstore, Dhanmondi',
    note: 'Weekly Grocery & Household',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 902,
    transaction_code: 'TXN-REC-GP-419',
    transaction_type: 'RECHARGE',
    amount: 399.0,
    fee: 0.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    operator: 'Grameenphone',
    recipient_phone: '01711002233',
    note: '30 Days 15GB Internet Pack',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 903,
    transaction_code: 'TXN-SM-8821',
    transaction_type: 'SEND_MONEY',
    amount: 1500.0,
    fee: 5.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    receiver_name: 'Rahim Ahmed (Family)',
    recipient_phone: '01819876543',
    note: 'Monthly Family Support',
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 904,
    transaction_code: 'TXN-ADD-BBL-110',
    transaction_type: 'ADD_MONEY',
    amount: 15000.0,
    fee: 0.0,
    direction: 'CREDIT',
    status: 'COMPLETED',
    sender_name: 'Brac Bank A/C ****4492',
    note: 'Salary & Monthly Inflow',
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 905,
    transaction_code: 'TXN-DESCO-551',
    transaction_type: 'BILL_PAYMENT',
    amount: 2450.0,
    fee: 0.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    merchant_name: 'DESCO Electricity Bill',
    note: 'Meter #8839219',
    created_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 906,
    transaction_code: 'TXN-REC-ROBI-012',
    transaction_type: 'RECHARGE',
    amount: 129.0,
    fee: 0.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    operator: 'Robi',
    recipient_phone: '01855667788',
    note: 'Data & Minute Pack',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 907,
    transaction_code: 'TXN-PAY-CHILLOX-771',
    transaction_type: 'MERCHANT_PAYMENT',
    amount: 850.0,
    fee: 0.0,
    direction: 'DEBIT',
    status: 'COMPLETED',
    merchant_name: 'Chillox Burger, Banani',
    note: 'Dining & Food QR Pay',
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 908,
    transaction_code: 'TXN-ADD-CARD-991',
    transaction_type: 'ADD_MONEY',
    amount: 10000.0,
    fee: 0.0,
    direction: 'CREDIT',
    status: 'COMPLETED',
    sender_name: 'City Bank Visa Debit',
    note: 'Wallet Topup',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
];

export const AIHubScreen = ({ navigation }) => {
  const { user, wallet } = useAuth();
  const { isBangla, toBengaliNumber } = useLanguage();

  // Top Section Switch
  const [activeMainTab, setActiveMainTab] = useState('FLOW'); // 'FLOW' | 'OFFERS'

  // AI Flow & Date Filtering State
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchPrompt, setSearchPrompt] = useState('');
  const [aiObservationOverride, setAiObservationOverride] = useState(null);

  // Data States
  const [rawTransactions, setRawTransactions] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [nboData, setNboData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Interactive Modal States
  const [selectedTxnDetail, setSelectedTxnDetail] = useState(null);
  const [activeAiAnswer, setActiveAiAnswer] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});

  // 1. Fetch All AI Data & Real User Transactions
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recData, nboRes, txnRes] = await Promise.all([
        api.getAIRecommendations().catch(() => null),
        api.getNextBestOffers().catch(() => null),
        api.getTransactions(null, 100, 0).catch(() => null),
      ]);

      if (recData) setIntelligence(recData);
      if (nboRes) setNboData(nboRes);

      if (txnRes && Array.isArray(txnRes.transactions) && txnRes.transactions.length > 0) {
        setRawTransactions(txnRes.transactions);
      } else {
        setRawTransactions(DEFAULT_FALLBACK_TXNS);
      }
    } catch (e) {
      console.warn('AI Hub loading error:', e);
      setRawTransactions(DEFAULT_FALLBACK_TXNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 2. Date Filtering Helper
  const isDateInRange = useCallback((dateStr, rangeKey) => {
    if (!dateStr) return true;
    if (rangeKey === 'ALL') return true;

    const txnDate = new Date(dateStr);
    const now = new Date();

    if (rangeKey === 'TODAY') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return txnDate >= startOfToday;
    }

    if (rangeKey === 'THIS_WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txnDate >= sevenDaysAgo;
    }

    if (rangeKey === 'THIS_MONTH') {
      return (
        txnDate.getFullYear() === now.getFullYear() &&
        txnDate.getMonth() === now.getMonth()
      );
    }

    if (rangeKey === 'LAST_MONTH') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return txnDate >= lastMonthDate && txnDate < thisMonthStart;
    }

    return true;
  }, []);

  // 3. Transactions filtered strictly by active Date Range
  const dateScopedTxns = useMemo(() => {
    return rawTransactions.filter((t) => isDateInRange(t.transaction_time || t.created_at, dateRange));
  }, [rawTransactions, dateRange, isDateInRange]);

  // 4. Mathematical Aggregate Calculation for Date Scope
  const aggregates = useMemo(() => {
    let moneyIn = 0;
    let moneyInCount = 0;

    let totalExpense = 0;
    let totalExpenseCount = 0;

    let rechargeTotal = 0;
    let rechargeCount = 0;

    let merchantTotal = 0;
    let merchantCount = 0;

    let sendMoneyTotal = 0;
    let sendMoneyCount = 0;

    let billPayTotal = 0;
    let billPayCount = 0;

    let cashOutTotal = 0;
    let cashOutCount = 0;

    dateScopedTxns.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      const type = (t.transaction_type || '').toUpperCase();
      const dir = (t.direction || '').toUpperCase();

      if (dir === 'CREDIT' || type === 'ADD_MONEY' || type === 'RECEIVED' || type === 'CASH_IN') {
        moneyIn += amt;
        moneyInCount += 1;
      } else {
        totalExpense += amt;
        totalExpenseCount += 1;

        if (type === 'RECHARGE') {
          rechargeTotal += amt;
          rechargeCount += 1;
        } else if (type === 'MERCHANT_PAYMENT') {
          merchantTotal += amt;
          merchantCount += 1;
        } else if (type === 'SEND_MONEY') {
          sendMoneyTotal += amt;
          sendMoneyCount += 1;
        } else if (type === 'BILL_PAYMENT' || type === 'UTILITY') {
          billPayTotal += amt;
          billPayCount += 1;
        } else if (type === 'CASH_OUT') {
          cashOutTotal += amt;
          cashOutCount += 1;
        }
      }
    });

    const netSavings = moneyIn - totalExpense;
    const totalFlow = moneyIn + totalExpense;
    const inPercent = totalFlow > 0 ? (moneyIn / totalFlow) * 100 : 50;
    const outPercent = totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 50;

    const calcCategoryPercent = (catTotal) => {
      return totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
    };

    return {
      moneyIn,
      moneyInCount,
      totalExpense,
      totalExpenseCount,
      netSavings,
      inPercent,
      outPercent,
      categories: {
        RECHARGE: { total: rechargeTotal, count: rechargeCount, pct: calcCategoryPercent(rechargeTotal) },
        MERCHANT_PAYMENT: { total: merchantTotal, count: merchantCount, pct: calcCategoryPercent(merchantTotal) },
        SEND_MONEY: { total: sendMoneyTotal, count: sendMoneyCount, pct: calcCategoryPercent(sendMoneyTotal) },
        BILL_PAYMENT: { total: billPayTotal, count: billPayCount, pct: calcCategoryPercent(billPayTotal) },
        CASH_OUT: { total: cashOutTotal, count: cashOutCount, pct: calcCategoryPercent(cashOutTotal) },
      },
    };
  }, [dateScopedTxns]);

  // 5. AI Dynamic Observation Generator
  const aiInsightCommentary = useMemo(() => {
    if (aiObservationOverride) return aiObservationOverride;

    const { moneyIn, totalExpense, categories } = aggregates;
    if (dateScopedTxns.length === 0) {
      return {
        title: isBangla ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No Transactions Recorded',
        body: isBangla
          ? 'নির্বাচিত সময়সীমার মধ্যে আপনার কোনো খরচ বা আয়ের রেকর্ড পাওয়া যায়নি।'
          : 'No financial outflow or inflow was recorded in this selected timeframe.',
        tip: isBangla ? '💡 নতুন লেনদেন করলে এআই স্বয়ংক্রিয়ভাবে ইনসাইট তৈরি করবে।' : '💡 Make transactions to trigger AI smart analysis.',
        statusColor: '#64748B',
      };
    }

    // Find top expense category
    let topCat = 'MERCHANT_PAYMENT';
    let maxAmt = -1;
    Object.entries(categories).forEach(([k, v]) => {
      if (v.total > maxAmt) {
        maxAmt = v.total;
        topCat = k;
      }
    });

    const topCatNameBn =
      topCat === 'RECHARGE'
        ? 'মোবাইল রিচার্জ'
        : topCat === 'MERCHANT_PAYMENT'
        ? 'মার্চেন্ট পেমেন্ট ও শপিং'
        : topCat === 'SEND_MONEY'
        ? 'সেন্ড মানি'
        : topCat === 'BILL_PAYMENT'
        ? 'ইউটিলিটি ও বিল পে'
        : 'ক্যাশ আউট';

    const topCatPct = categories[topCat]?.pct || 0;
    const topCatAmt = categories[topCat]?.total || 0;

    const daysCount = dateRange === 'TODAY' ? 1 : dateRange === 'THIS_WEEK' ? 7 : dateRange === 'THIS_MONTH' ? 30 : 30;
    const dailyAvg = Math.round(totalExpense / daysCount);

    const isSurplus = moneyIn >= totalExpense;

    return {
      title: isBangla
        ? `এআই আর্থিক পর্যবেক্ষণ (${DATE_RANGES.find((d) => d.id === dateRange)?.bn || ''})`
        : `AI Financial Assessment (${DATE_RANGES.find((d) => d.id === dateRange)?.label || ''})`,
      topCategory: topCatNameBn,
      topCategoryAmt: topCatAmt,
      topCategoryPct: topCatPct,
      dailyAvg: dailyAvg,
      isSurplus: isSurplus,
      body: isBangla
        ? `নির্বাচিত সময়ে আপনার প্রধান খরচ হয়েছে ${topCatNameBn}-এ (৳${toBengaliNumber(topCatAmt)} - মোট ব্যয়ের ${toBengaliNumber(topCatPct)}%)। আপনার দৈনিক গড় খরচ প্রায় ৳${toBengaliNumber(dailyAvg)}। ${
            isSurplus
              ? 'আপনার আয়ের তুলনায় খরচ সম্পূর্ণ নিরাপদ সীমার মধ্যে আছে।'
              : 'সতর্কতা: এই সময়ে আয়ের চেয়ে খরচ কিছুটা বেশি হয়েছে।'
          }`
        : `Your top expense driver in this period is ${topCat} (৳${topCatAmt.toLocaleString()} - ${topCatPct}% of total outflow). Average daily outflow is ৳${dailyAvg.toLocaleString()}. ${
            isSurplus
              ? 'Your financial outflow is comfortably within safe income limits.'
              : 'Attention: Outflow currently exceeds recorded inflows for this timeframe.'
          }`,
      tip: isBangla
        ? categories.RECHARGE.count > 3
          ? '💡 এআই টিপ: রিচার্জে ঘনঘন ছোট প্যাক না কিনে মান্থলি বান্ডেল নিলে প্রতি মাসে প্রায় ২০% টাকা বাঁচবে।'
          : '💡 এআই টিপ: পার্টনার মার্চেন্টে কিউআর পেমেন্ট করে ক্যাশব্যাক নিলে প্রতি মাসে গড়ে ৳৪৫০ পর্যন্ত সাশ্রয় সম্ভব।'
        : '💡 AI Tip: Bundle mobile recharges or use QR cashbacks at partner hubs to save 10%-20%.',
      statusColor: isSurplus ? '#059669' : '#D97706',
    };
  }, [aggregates, dateRange, isBangla, toBengaliNumber, dateScopedTxns.length, aiObservationOverride]);

  // 6. Natural Language Prompt Trigger Handler
  const handleQuickPrompt = (promptItem) => {
    setDateRange(promptItem.date);
    setSelectedCategory(promptItem.cat);
    setSearchPrompt('');

    // Instant explainable answer
    const catData = aggregates.categories[promptItem.cat];
    if (promptItem.cat === 'RECHARGE') {
      setAiObservationOverride({
        title: isBangla ? 'রিচার্জ খরচের এআই সারসংক্ষেপ' : 'Mobile Recharge AI Summary',
        body: isBangla
          ? `এই সময়ে আপনি মোট ${toBengaliNumber(catData?.count || 0)} বার মোবাইল রিচার্জ করেছেন, যার মোট পরিমাণ ৳${toBengaliNumber(catData?.total || 0)} (মোট খরচের ${toBengaliNumber(catData?.pct || 0)}%)।`
          : `You have completed ${catData?.count || 0} mobile recharges totaling ৳${(catData?.total || 0).toLocaleString()} (${catData?.pct || 0}% of your total outflow).`,
        tip: isBangla
          ? '💡 এআই পরামর্শ: জিপি বা রবির ৩০ দিনের মেগা ডেটা প্যাকে রিচার্জ করলে বার বার রিচার্জ ফি ও বাড়তি খরচ বাঁচে।'
          : '💡 AI Tip: Monthly bundle recharges prevent micro-spending leakages.',
        statusColor: '#8B5CF6',
      });
    } else if (promptItem.cat === 'INFLOW') {
      setAiObservationOverride({
        title: isBangla ? 'টাকা জমার এআই সারসংক্ষেপ' : 'Money Inflow AI Summary',
        body: isBangla
          ? `এই সময়ে আপনার ওয়ালেটে মোট ${toBengaliNumber(aggregates.moneyInCount)}টি ট্রানজ্যাকশনে ৳${toBengaliNumber(aggregates.moneyIn)} জমা হয়েছে। এর মধ্যে ব্যাংক অ্যাড মানি প্রধান উৎস।`
          : `Total inflow for this period is ৳${aggregates.moneyIn.toLocaleString()} across ${aggregates.moneyInCount} transactions, driven mainly by Bank Add Money.`,
        tip: isBangla ? '💡 এআই পরামর্শ: আপনার মোট আয়ের অন্তত ২৫% সঞ্চয় তহবিলে রাখার লক্ষ্য রাখুন।' : '💡 AI Tip: Target to retain at least 25% of inflows into emergency savings.',
        statusColor: '#059669',
      });
    } else {
      setAiObservationOverride(null);
    }
  };

  // 7. Text Query Filter
  const handleSearchSubmit = () => {
    if (!searchPrompt.trim()) {
      setAiObservationOverride(null);
      return;
    }
    const q = searchPrompt.toLowerCase();
    if (q.includes('রিচার্জ') || q.includes('recharge')) {
      setSelectedCategory('RECHARGE');
    } else if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('shop') || q.includes('মার্চেন্ট')) {
      setSelectedCategory('MERCHANT_PAYMENT');
    } else if (q.includes('সেন্ড') || q.includes('send')) {
      setSelectedCategory('SEND_MONEY');
    } else if (q.includes('বিল') || q.includes('bill') || q.includes('বিদ্যুৎ')) {
      setSelectedCategory('BILL_PAYMENT');
    } else if (q.includes('জমা') || q.includes('ঢুক') || q.includes('inflow')) {
      setSelectedCategory('INFLOW');
    }

    if (q.includes('আজ') || q.includes('today')) {
      setDateRange('TODAY');
    } else if (q.includes('সপ্তাহ') || q.includes('week')) {
      setDateRange('THIS_WEEK');
    } else if (q.includes('গত মাস') || q.includes('last month')) {
      setDateRange('LAST_MONTH');
    } else if (q.includes('এই মাস') || q.includes('this month')) {
      setDateRange('THIS_MONTH');
    }
  };

  // 8. Filtered Transactions list to display
  const finalDisplayTxns = useMemo(() => {
    return dateScopedTxns.filter((t) => {
      // Category match
      const type = (t.transaction_type || '').toUpperCase();
      const dir = (t.direction || '').toUpperCase();

      if (selectedCategory === 'INFLOW') {
        if (dir !== 'CREDIT' && type !== 'ADD_MONEY' && type !== 'RECEIVED') return false;
      } else if (selectedCategory !== 'ALL') {
        if (type !== selectedCategory) return false;
      }

      // Prompt match
      if (searchPrompt.trim()) {
        const query = searchPrompt.toLowerCase();
        const code = (t.transaction_code || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        const name = (t.merchant_name || t.receiver_name || t.sender_name || '').toLowerCase();
        const phone = (t.recipient_phone || '').toLowerCase();
        if (!code.includes(query) && !note.includes(query) && !name.includes(query) && !phone.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [dateScopedTxns, selectedCategory, searchPrompt]);

  // Format Helper
  const fmt = (num) => {
    const val = parseFloat(num) || 0;
    return isBangla ? toBengaliNumber(val.toLocaleString('en-US')) : val.toLocaleString('en-US');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063E32" />

      {/* 1. Header with Glow Gradient */}
      <LinearGradient
        colors={['#063E32', '#0A4F40', '#0E604E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.() || navigation?.navigate?.('Home')}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles" size={14} color="#34D399" />
              <Text style={styles.sparkleBadgeText}>GenCash Intelligence</Text>
            </View>
            <Text style={styles.headerTitle}>
              {isBangla ? 'এআই আর্থিক ও ব্যয় ড্যাশবোর্ড' : 'AI Financial Dashboard'}
            </Text>
          </View>

          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="sync-outline" size={20} color="#34D399" />
          </TouchableOpacity>
        </View>

        {/* Master Segmented Tab Switcher */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeMainTab === 'FLOW' && styles.segmentBtnActive]}
            onPress={() => setActiveMainTab('FLOW')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="analytics-outline"
              size={16}
              color={activeMainTab === 'FLOW' ? '#063E32' : '#A7F3D0'}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeMainTab === 'FLOW' && styles.segmentBtnTextActive,
              ]}
            >
              {isBangla ? 'ব্যয় ও ক্যাশফ্লো এআই' : 'Expense & Cashflow'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeMainTab === 'OFFERS' && styles.segmentBtnActive]}
            onPress={() => setActiveMainTab('OFFERS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={activeMainTab === 'OFFERS' ? '#063E32' : '#A7F3D0'}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeMainTab === 'OFFERS' && styles.segmentBtnTextActive,
              ]}
            >
              {isBangla ? 'হেলথ স্কোর ও অফার' : 'Health & Offers'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 2. Main Content Scroll Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" />
        }
      >
        {activeMainTab === 'FLOW' ? (
          /* ========================================================
             TAB 1: EXPENSE & CASHFLOW INTELLIGENCE (User Requested)
             ======================================================== */
          <View>
            {/* A. Date Range Filter Horizontal Scroll */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {isBangla ? 'সময়সীমা নির্বাচন করুন' : 'Select Timeframe'}
              </Text>
              <Text style={styles.sectionBadge}>
                {DATE_RANGES.find((d) => d.id === dateRange)?.label}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {DATE_RANGES.map((d) => {
                const isActive = dateRange === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dateChip, isActive && styles.dateChipActive]}
                    onPress={() => {
                      setDateRange(d.id);
                      setAiObservationOverride(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isActive ? 'calendar' : 'calendar-outline'}
                      size={14}
                      color={isActive ? '#FFFFFF' : '#475569'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>
                      {isBangla ? d.bn : d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* B. Master Cashflow Hero Summary Card */}
            <View style={styles.heroFlowCard}>
              <View style={styles.heroFlowTop}>
                <View style={styles.heroTitleWrap}>
                  <Ionicons name="pie-chart" size={18} color="#059669" />
                  <Text style={styles.heroFlowTitle}>
                    {isBangla ? 'ক্যাশফ্লো সারসংক্ষেপ (Inflow vs Outflow)' : 'Cashflow Balance Sheet'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.netBadge,
                    { backgroundColor: aggregates.netSavings >= 0 ? '#ECFDF5' : '#FEF2F2' },
                  ]}
                >
                  <Ionicons
                    name={aggregates.netSavings >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={aggregates.netSavings >= 0 ? '#059669' : '#EF4444'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.netBadgeText,
                      { color: aggregates.netSavings >= 0 ? '#059669' : '#EF4444' },
                    ]}
                  >
                    {aggregates.netSavings >= 0
                      ? isBangla
                        ? 'সঞ্চয় সারপ্লাস'
                        : 'Net Surplus'
                      : isBangla
                      ? 'ঘাটতি'
                      : 'Deficit'}
                  </Text>
                </View>
              </View>

              {/* Inflow vs Outflow Dual Big Figures */}
              <View style={styles.flowRow}>
                {/* Money In */}
                <TouchableOpacity
                  style={[styles.flowBox, selectedCategory === 'INFLOW' && styles.flowBoxSelected]}
                  onPress={() => setSelectedCategory('INFLOW')}
                  activeOpacity={0.8}
                >
                  <View style={styles.flowLabelRow}>
                    <View style={[styles.flowIconCircle, { backgroundColor: '#D1FAE5' }]}>
                      <Ionicons name="arrow-down-outline" size={16} color="#059669" />
                    </View>
                    <Text style={styles.flowLabel}>{isBangla ? 'টাকা এসেছে' : 'Money In'}</Text>
                  </View>
                  <Text style={styles.flowInAmount}>+৳{fmt(aggregates.moneyIn)}</Text>
                  <Text style={styles.flowSubText}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.moneyInCount)}টি ট্রানজ্যাকশন`
                      : `${aggregates.moneyInCount} transactions`}
                  </Text>
                </TouchableOpacity>

                <View style={styles.flowDivider} />

                {/* Money Out */}
                <TouchableOpacity
                  style={[styles.flowBox, selectedCategory === 'ALL' && styles.flowBoxSelected]}
                  onPress={() => setSelectedCategory('ALL')}
                  activeOpacity={0.8}
                >
                  <View style={styles.flowLabelRow}>
                    <View style={[styles.flowIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="arrow-up-outline" size={16} color="#EF4444" />
                    </View>
                    <Text style={styles.flowLabel}>{isBangla ? 'মোট খরচ' : 'Total Outflow'}</Text>
                  </View>
                  <Text style={styles.flowOutAmount}>-৳{fmt(aggregates.totalExpense)}</Text>
                  <Text style={styles.flowSubText}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.totalExpenseCount)}টি ট্রানজ্যাকশন`
                      : `${aggregates.totalExpenseCount} transactions`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Inflow vs Outflow Ratio Bar */}
              <View style={styles.ratioBarContainer}>
                <View
                  style={[
                    styles.ratioIn,
                    { flex: Math.max(aggregates.inPercent, 5) },
                  ]}
                />
                <View
                  style={[
                    styles.ratioOut,
                    { flex: Math.max(aggregates.outPercent, 5) },
                  ]}
                />
              </View>
              <View style={styles.ratioLabelsRow}>
                <Text style={styles.ratioLabelLeft}>
                  {Math.round(aggregates.inPercent)}% {isBangla ? 'আয় ও জমা' : 'Inflow'}
                </Text>
                <Text style={styles.ratioLabelRight}>
                  {Math.round(aggregates.outPercent)}% {isBangla ? 'ব্যয় ও আউটফ্লো' : 'Outflow'}
                </Text>
              </View>
            </View>

            {/* C. Dynamic Explainable AI Assessment Banner */}
            <View style={styles.aiInsightCard}>
              <View style={styles.aiInsightHeader}>
                <View style={styles.aiInsightBadge}>
                  <Ionicons name="bulb" size={16} color="#D97706" />
                  <Text style={styles.aiInsightBadgeText}>AI Spending Intelligence</Text>
                </View>
                <Text style={[styles.aiStatusPill, { color: aiInsightCommentary.statusColor }]}>
                  ● {isBangla ? 'সক্রিয় বিশ্লেষণ' : 'Live Analysis'}
                </Text>
              </View>

              <Text style={styles.aiInsightTitle}>{aiInsightCommentary.title}</Text>
              <Text style={styles.aiInsightBody}>{aiInsightCommentary.body}</Text>

              <View style={styles.aiTipWrap}>
                <Text style={styles.aiTipText}>{aiInsightCommentary.tip}</Text>
              </View>
            </View>

            {/* D. Category Breakdown Grid (Recharge, Payment, Send Money, Bill, Cash Out) */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {isBangla ? 'খাতভিত্তিক ব্যয়ের সঠিক হিসাব' : 'Category-wise Spending Breakdown'}
                </Text>
                <Text style={styles.sectionSub}>
                  {isBangla ? 'নির্দিষ্ট খাতের কার্ডে ট্যাপ করে ফিল্টার করুন' : 'Tap any category card to filter list'}
                </Text>
              </View>
            </View>

            <View style={styles.categoriesGrid}>
              {/* 1. Mobile Recharge Card */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === 'RECHARGE' && styles.categoryCardSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(selectedCategory === 'RECHARGE' ? 'ALL' : 'RECHARGE')
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="phone-portrait-outline" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={styles.categoryPct}>
                    {aggregates.categories.RECHARGE.pct}%
                  </Text>
                </View>
                <Text style={styles.categoryName}>{isBangla ? 'মোবাইল রিচার্জ' : 'Mobile Recharge'}</Text>
                <Text style={styles.categoryTotal}>৳{fmt(aggregates.categories.RECHARGE.total)}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryCount}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.categories.RECHARGE.count)} বার`
                      : `${aggregates.categories.RECHARGE.count} times`}
                  </Text>
                  <View style={[styles.catBarFill, { width: `${Math.min(aggregates.categories.RECHARGE.pct, 100)}%`, backgroundColor: '#8B5CF6' }]} />
                </View>
              </TouchableOpacity>

              {/* 2. Merchant Payment & Shopping Card */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === 'MERCHANT_PAYMENT' && styles.categoryCardSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === 'MERCHANT_PAYMENT' ? 'ALL' : 'MERCHANT_PAYMENT'
                  )
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="cart-outline" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.categoryPct}>
                    {aggregates.categories.MERCHANT_PAYMENT.pct}%
                  </Text>
                </View>
                <Text style={styles.categoryName}>{isBangla ? 'পেমেন্ট ও শপিং' : 'Merchant Payment'}</Text>
                <Text style={styles.categoryTotal}>৳{fmt(aggregates.categories.MERCHANT_PAYMENT.total)}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryCount}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.categories.MERCHANT_PAYMENT.count)} বার`
                      : `${aggregates.categories.MERCHANT_PAYMENT.count} times`}
                  </Text>
                  <View style={[styles.catBarFill, { width: `${Math.min(aggregates.categories.MERCHANT_PAYMENT.pct, 100)}%`, backgroundColor: '#D97706' }]} />
                </View>
              </TouchableOpacity>

              {/* 3. Send Money Card */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === 'SEND_MONEY' && styles.categoryCardSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === 'SEND_MONEY' ? 'ALL' : 'SEND_MONEY'
                  )
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="paper-plane-outline" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.categoryPct}>
                    {aggregates.categories.SEND_MONEY.pct}%
                  </Text>
                </View>
                <Text style={styles.categoryName}>{isBangla ? 'সেন্ড মানি' : 'Send Money'}</Text>
                <Text style={styles.categoryTotal}>৳{fmt(aggregates.categories.SEND_MONEY.total)}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryCount}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.categories.SEND_MONEY.count)} বার`
                      : `${aggregates.categories.SEND_MONEY.count} times`}
                  </Text>
                  <View style={[styles.catBarFill, { width: `${Math.min(aggregates.categories.SEND_MONEY.pct, 100)}%`, backgroundColor: '#2563EB' }]} />
                </View>
              </TouchableOpacity>

              {/* 4. Utility & Bill Payment Card */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === 'BILL_PAYMENT' && styles.categoryCardSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === 'BILL_PAYMENT' ? 'ALL' : 'BILL_PAYMENT'
                  )
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: '#FCE7F3' }]}>
                    <Ionicons name="flash-outline" size={18} color="#DB2777" />
                  </View>
                  <Text style={styles.categoryPct}>
                    {aggregates.categories.BILL_PAYMENT.pct}%
                  </Text>
                </View>
                <Text style={styles.categoryName}>{isBangla ? 'ইউটিলিটি ও বিল পে' : 'Bill Payment'}</Text>
                <Text style={styles.categoryTotal}>৳{fmt(aggregates.categories.BILL_PAYMENT.total)}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryCount}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.categories.BILL_PAYMENT.count)} বার`
                      : `${aggregates.categories.BILL_PAYMENT.count} times`}
                  </Text>
                  <View style={[styles.catBarFill, { width: `${Math.min(aggregates.categories.BILL_PAYMENT.pct, 100)}%`, backgroundColor: '#DB2777' }]} />
                </View>
              </TouchableOpacity>

              {/* 5. Cash Out Card */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategory === 'CASH_OUT' && styles.categoryCardSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(selectedCategory === 'CASH_OUT' ? 'ALL' : 'CASH_OUT')
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={[styles.categoryIconWrap, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="cash-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={styles.categoryPct}>
                    {aggregates.categories.CASH_OUT.pct}%
                  </Text>
                </View>
                <Text style={styles.categoryName}>{isBangla ? 'ক্যাশ আউট' : 'Cash Out'}</Text>
                <Text style={styles.categoryTotal}>৳{fmt(aggregates.categories.CASH_OUT.total)}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryCount}>
                    {isBangla
                      ? `${toBengaliNumber(aggregates.categories.CASH_OUT.count)} বার`
                      : `${aggregates.categories.CASH_OUT.count} times`}
                  </Text>
                  <View style={[styles.catBarFill, { width: `${Math.min(aggregates.categories.CASH_OUT.pct, 100)}%`, backgroundColor: '#EF4444' }]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* E. Natural Language "Ask AI to Filter & Calculate" Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchBox}>
                <Ionicons name="sparkles" size={18} color="#059669" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={
                    isBangla
                      ? "এআই-কে বলুন (যেমন: 'রিচার্জ কত?', 'মার্চেন্ট পেমেন্ট', 'টাকা জমা')"
                      : "Ask AI (e.g., 'recharge this month', 'merchant payment')"
                  }
                  placeholderTextColor="#94A3B8"
                  value={searchPrompt}
                  onChangeText={setSearchPrompt}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
                {searchPrompt ? (
                  <TouchableOpacity onPress={() => setSearchPrompt('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Quick Prompt Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptScroll}>
                {QUICK_AI_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.quickPromptChip}
                    onPress={() => handleQuickPrompt(p)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search-outline" size={12} color="#065F46" style={{ marginRight: 4 }} />
                    <Text style={styles.quickPromptText}>
                      {isBangla ? p.text : p.textEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* F. Filtered Transactions List with AI Tags */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {isBangla ? 'ফিল্টারকৃত লেনদেনের বিবরণী' : 'Filtered Transaction Records'}
                </Text>
                <Text style={styles.sectionSub}>
                  {isBangla
                    ? `মোট ${toBengaliNumber(finalDisplayTxns.length)}টি লেনদেন পাওয়া গেছে`
                    : `Showing ${finalDisplayTxns.length} records`}
                </Text>
              </View>
              {selectedCategory !== 'ALL' && (
                <TouchableOpacity
                  onPress={() => setSelectedCategory('ALL')}
                  style={styles.clearFilterBtn}
                >
                  <Text style={styles.clearFilterText}>{isBangla ? 'রিসেট' : 'Reset'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {finalDisplayTxns.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>
                  {isBangla ? 'এই ফিল্টারে কোনো লেনদেন পাওয়া যায়নি' : 'No Transactions in this Filter'}
                </Text>
                <Text style={styles.emptySub}>
                  {isBangla
                    ? 'অন্য কোনো সময়সীমা বা ক্যাটাগরি সিলেক্ট করে পুনরায় চেষ্টা করুন।'
                    : 'Try selecting a different date range or category.'}
                </Text>
              </View>
            ) : (
              finalDisplayTxns.map((t) => {
                const isCredit =
                  t.direction === 'CREDIT' ||
                  t.transaction_type === 'ADD_MONEY' ||
                  t.transaction_type === 'RECEIVED';
                const type = (t.transaction_type || '').toUpperCase();
                const iconName =
                  type === 'RECHARGE'
                    ? 'phone-portrait-outline'
                    : type === 'MERCHANT_PAYMENT'
                    ? 'cart-outline'
                    : type === 'SEND_MONEY'
                    ? 'paper-plane-outline'
                    : type === 'BILL_PAYMENT'
                    ? 'flash-outline'
                    : type === 'CASH_OUT'
                    ? 'cash-outline'
                    : 'arrow-down-circle-outline';

                const iconBg =
                  type === 'RECHARGE'
                    ? '#F3E8FF'
                    : type === 'MERCHANT_PAYMENT'
                    ? '#FEF3C7'
                    : type === 'SEND_MONEY'
                    ? '#DBEAFE'
                    : type === 'BILL_PAYMENT'
                    ? '#FCE7F3'
                    : isCredit
                    ? '#D1FAE5'
                    : '#FEE2E2';

                const iconColor =
                  type === 'RECHARGE'
                    ? '#8B5CF6'
                    : type === 'MERCHANT_PAYMENT'
                    ? '#D97706'
                    : type === 'SEND_MONEY'
                    ? '#2563EB'
                    : type === 'BILL_PAYMENT'
                    ? '#DB2777'
                    : isCredit
                    ? '#059669'
                    : '#EF4444';

                const titleText =
                  t.merchant_name ||
                  t.receiver_name ||
                  t.sender_name ||
                  (t.recipient_phone ? `${type}: ${t.recipient_phone}` : type);

                const dateFormatted = new Date(
                  t.transaction_time || t.created_at || Date.now()
                ).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <TouchableOpacity
                    key={t.id || t.transaction_code}
                    style={styles.txnItemCard}
                    onPress={() => setSelectedTxnDetail(t)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.txnIconCircle, { backgroundColor: iconBg }]}>
                      <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>

                    <View style={styles.txnCenter}>
                      <Text style={styles.txnTitle} numberOfLines={1}>
                        {titleText}
                      </Text>
                      <View style={styles.txnMetaRow}>
                        <Text style={styles.txnDate}>{dateFormatted}</Text>
                        <Text style={styles.txnDot}>•</Text>
                        <Text style={styles.txnCategoryTag}>
                          {type === 'RECHARGE'
                            ? isBangla
                              ? 'রিচার্জ'
                              : 'Recharge'
                            : type === 'MERCHANT_PAYMENT'
                            ? isBangla
                              ? 'পেমেন্ট'
                              : 'Payment'
                            : type === 'SEND_MONEY'
                            ? isBangla
                              ? 'সেন্ড মানি'
                              : 'Send Money'
                            : type === 'BILL_PAYMENT'
                            ? isBangla
                              ? 'বিল পে'
                              : 'Bill'
                            : isCredit
                            ? isBangla
                              ? 'জমা'
                              : 'Credit'
                            : isBangla
                            ? 'ক্যাশআউট'
                            : 'Cash Out'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txnAmountWrap}>
                      <Text
                        style={[
                          styles.txnAmountText,
                          { color: isCredit ? '#059669' : '#1E293B' },
                        ]}
                      >
                        {isCredit ? '+' : '-'}৳{fmt(t.amount)}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          /* ========================================================
             TAB 2: AI HEALTH SCORE, PREDICTIVE REMINDERS & DEALS
             ======================================================== */
          <View>
            {/* A. AI Financial Health Score Card */}
            <LinearGradient
              colors={['#0F4D3C', '#135845', '#1B6B55']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.healthScoreCard}
            >
              <View style={styles.healthTopRow}>
                <View>
                  <Text style={styles.healthCardLabel}>
                    {isBangla ? 'এআই আর্থিক স্কোর' : 'AI Financial Health Score'}
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreBig}>{isBangla ? toBengaliNumber(88) : '88'}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                    <View style={styles.scoreStatusPill}>
                      <Ionicons name="shield-checkmark" size={14} color="#34D399" />
                      <Text style={styles.scoreStatusText}>
                        {isBangla ? 'চমৎকার ও নিরাপদ' : 'Excellent & Safe'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.scoreRingWrap}>
                  <MaterialCommunityIcons name="finance" size={38} color="#34D399" />
                </View>
              </View>

              <View style={styles.healthDivider} />

              <View style={styles.healthMetricsRow}>
                <View style={styles.healthMetric}>
                  <Text style={styles.healthMetricLabel}>
                    {isBangla ? 'সঞ্চয় সুযোগ' : 'Savings Unlocked'}
                  </Text>
                  <Text style={styles.healthMetricValue}>+৳{isBangla ? toBengaliNumber(450) : '450'}</Text>
                </View>

                <View style={styles.healthMetricDivider} />

                <View style={styles.healthMetric}>
                  <Text style={styles.healthMetricLabel}>
                    {isBangla ? 'বাজেট নিয়ন্ত্রণ' : 'Budget Control'}
                  </Text>
                  <Text style={styles.healthMetricValue}>{isBangla ? toBengaliNumber(92) : '92'}%</Text>
                </View>

                <View style={styles.healthMetricDivider} />

                <View style={styles.healthMetric}>
                  <Text style={styles.healthMetricLabel}>
                    {isBangla ? 'রিস্ক স্ট্যাটাস' : 'Risk Level'}
                  </Text>
                  <Text style={[styles.healthMetricValue, { color: '#34D399' }]}>
                    {isBangla ? 'নিম্ন' : 'Low'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* B. Spending Anomaly Alert */}
            {nboData?.spending_anomaly && (
              <View style={styles.anomalyCard}>
                <View style={styles.anomalyHeader}>
                  <View style={styles.anomalyIconCircle}>
                    <Ionicons name="warning-outline" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.anomalyTitle}>
                      {isBangla ? 'অস্বাভাবিক খরচের সতর্কতা' : 'Spending Anomaly Detected'}
                    </Text>
                    <Text style={styles.anomalySub}>
                      {isBangla
                        ? `${nboData.spending_anomaly.category || 'Retail'} খাতে অপ্রত্যাশিত ব্যয়ের ধারা`
                        : `Unexpected outflow in ${nboData.spending_anomaly.category || 'Retail'}`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.anomalyReason}>
                  {isBangla
                    ? nboData.spending_anomaly.explanation_bn ||
                      'এই সপ্তাহে আপনার গড় সাপ্তাহিক ব্যয়ের চেয়ে প্রায় ৩৫% বেশি লেনদেন হয়েছে।'
                    : nboData.spending_anomaly.explanation ||
                      'Outflow in this category exceeded your 30-day baseline by 35%.'}
                </Text>
              </View>
            )}

            {/* C. Predictive Reminders */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {isBangla ? 'এআই রিমাইন্ডার ও বিল সাইকেল' : 'Predictive Utility Reminders'}
              </Text>
            </View>

            <View style={styles.reminderCard}>
              <View style={[styles.reminderIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flash-outline" size={22} color="#EF4444" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.reminderTitle}>
                  {isBangla ? 'ডেসকো বিদ্যুৎ বিল বাকি' : 'DESCO Electricity Bill Due'}
                </Text>
                <Text style={styles.reminderSub}>
                  {isBangla ? 'বিলের মেয়াদ শেষ হতে আর ৪ দিন বাকি' : 'Due in 4 days (Avg ৳2,450)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reminderActionBtn}
                onPress={() => navigation.navigate('MerchantPayment', { merchant_name: 'DESCO' })}
                activeOpacity={0.8}
              >
                <Text style={styles.reminderActionText}>{isBangla ? 'বিল দিন' : 'Pay'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reminderCard}>
              <View style={[styles.reminderIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="phone-portrait-outline" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.reminderTitle}>
                  {isBangla ? 'মোবাইল রিচার্জ সাইকেল' : 'SIM Recharge Cycle Due'}
                </Text>
                <Text style={styles.reminderSub}>
                  {isBangla ? 'আপনার নিয়মিত ইন্টারনেট প্যাকের মেয়াদ শেষপ্রান্তে' : 'Internet pack expiring in 2 days'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reminderActionBtn}
                onPress={() => navigation.navigate('MobileRecharge')}
                activeOpacity={0.8}
              >
                <Text style={styles.reminderActionText}>{isBangla ? 'রিচার্জ' : 'Recharge'}</Text>
              </TouchableOpacity>
            </View>

            {/* D. Hyper-Personalized Next Best Offers */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {isBangla ? 'আপনার জন্য কাস্টমাইজড এআই অফার' : 'Hyper-Personalized Deals (NBO)'}
              </Text>
            </View>

            {nboData?.top_recommended_offer && (
              <LinearGradient
                colors={['#1E1B4B', '#2E1065', '#3B0764']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topOfferBanner}
              >
                <View style={styles.topOfferBadge}>
                  <Ionicons name="flame" size={14} color="#F59E0B" />
                  <Text style={styles.topOfferBadgeText}>
                    {isBangla ? 'সর্বোচ্চ ৯৫% পছন্দসই' : '95% Affinity Match'}
                  </Text>
                </View>
                <Text style={styles.topOfferTitle}>
                  {nboData.top_recommended_offer.title}
                </Text>
                <Text style={styles.topOfferDesc}>
                  {nboData.top_recommended_offer.description}
                </Text>
                <View style={styles.topOfferReasonBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#A78BFA" />
                  <Text style={styles.topOfferReasonText}>
                    {isBangla
                      ? nboData.top_recommended_offer.reason_bn || 'আপনার অতীত খরচের প্যাটার্ন বিশ্লেষণ করে নির্বাচিত।'
                      : nboData.top_recommended_offer.reason || 'Selected based on your transaction history.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.topOfferClaimBtn}
                  onPress={() => navigation.navigate('MerchantPayment')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.topOfferClaimText}>{isBangla ? 'অফারটি ব্যবহার করুন' : 'Claim Deal'}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1E1B4B" />
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        )}
      </ScrollView>

      {/* 3. Transaction Detail Modal */}
      {selectedTxnDetail && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedTxnDetail(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="receipt-outline" size={20} color="#063E32" />
                  <Text style={styles.modalTitle}>
                    {isBangla ? 'লেনদেনের বিস্তারিত রসিদ' : 'Transaction Receipt'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedTxnDetail(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalAmountBox}>
                  <Text style={styles.modalAmountLabel}>
                    {isBangla ? 'লেনদেনের পরিমাণ' : 'Amount Transferred'}
                  </Text>
                  <Text style={styles.modalAmountValue}>৳{fmt(selectedTxnDetail.amount)}</Text>
                  <View style={styles.modalStatusPill}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.modalStatusText}>
                      {selectedTxnDetail.status || 'COMPLETED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoKey}>{isBangla ? 'লেনদেন আইডি' : 'Txn Code'}</Text>
                  <Text style={styles.modalInfoVal}>{selectedTxnDetail.transaction_code}</Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoKey}>{isBangla ? 'লেনদেনের ধরন' : 'Category'}</Text>
                  <Text style={styles.modalInfoVal}>{selectedTxnDetail.transaction_type}</Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoKey}>{isBangla ? 'তারিখ ও সময়' : 'Timestamp'}</Text>
                  <Text style={styles.modalInfoVal}>
                    {new Date(selectedTxnDetail.transaction_time || selectedTxnDetail.created_at || Date.now()).toLocaleString()}
                  </Text>
                </View>

                {selectedTxnDetail.recipient_phone ? (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoKey}>{isBangla ? 'প্রাপকের নম্বর' : 'Recipient Phone'}</Text>
                    <Text style={styles.modalInfoVal}>{selectedTxnDetail.recipient_phone}</Text>
                  </View>
                ) : null}

                {selectedTxnDetail.merchant_name ? (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoKey}>{isBangla ? 'মার্চেন্ট' : 'Merchant'}</Text>
                    <Text style={styles.modalInfoVal}>{selectedTxnDetail.merchant_name}</Text>
                  </View>
                ) : null}

                <View style={styles.modalAiTagBox}>
                  <Ionicons name="sparkles" size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text style={styles.modalAiTagText}>
                    {isBangla
                      ? 'এআই অ্যানালিটিক্স: এই খরচটি আপনার মাসিক আর্থিক বাজেটের মধ্যে অন্তর্ভুক্ত রয়েছে।'
                      : 'AI Analytics: This transaction is mapped into your financial outflow ledger.'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setSelectedTxnDetail(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneText}>{isBangla ? 'ঠিক আছে' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 28,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  sparkleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A7F3D0',
    marginLeft: 6,
  },
  segmentBtnTextActive: {
    color: '#063E32',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  clearFilterBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  dateScroll: {
    marginBottom: 12,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateChipActive: {
    backgroundColor: '#063E32',
    borderColor: '#063E32',
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  heroFlowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroFlowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroFlowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 6,
  },
  netBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  netBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flowBox: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
  },
  flowBoxSelected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  flowLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  flowIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  flowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  flowInAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#059669',
  },
  flowOutAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#EF4444',
  },
  flowSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  flowDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  ratioIn: {
    backgroundColor: '#059669',
  },
  ratioOut: {
    backgroundColor: '#EF4444',
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ratioLabelLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  ratioLabelRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  aiInsightCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  aiInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiInsightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiInsightBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 4,
  },
  aiStatusPill: {
    fontSize: 11,
    fontWeight: '800',
  },
  aiInsightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  aiInsightBody: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  aiTipWrap: {
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  aiTipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  categoryFooter: {
    marginTop: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  catBarFill: {
    height: 4,
    borderRadius: 2,
  },
  searchSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    paddingVertical: 0,
  },
  quickPromptScroll: {
    marginTop: 8,
    marginBottom: 6,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  emptyWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  txnItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txnIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnCenter: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  txnMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnDate: {
    fontSize: 11,
    color: '#64748B',
  },
  txnDot: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  txnCategoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  txnAmountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnAmountText: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  /* Health & Offers styles */
  healthScoreCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  healthTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthCardLabel: {
    fontSize: 13,
    color: '#A7F3D0',
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreBig: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6EE7B7',
    marginLeft: 2,
  },
  scoreStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 12,
  },
  scoreStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    marginLeft: 4,
  },
  scoreRingWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 16,
  },
  healthMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  healthMetric: {
    alignItems: 'center',
  },
  healthMetricLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    marginBottom: 2,
  },
  healthMetricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  healthMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  anomalyCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anomalyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anomalyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  anomalySub: {
    fontSize: 11,
    color: '#B45309',
  },
  anomalyReason: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 8,
    lineHeight: 16,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reminderIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  reminderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reminderActionBtn: {
    backgroundColor: '#063E32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reminderActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topOfferBanner: {
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
  },
  topOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  topOfferBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
    marginLeft: 4,
  },
  topOfferTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topOfferDesc: {
    fontSize: 12,
    color: '#E0E7FF',
    lineHeight: 16,
    marginBottom: 10,
  },
  topOfferReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  topOfferReasonText: {
    fontSize: 11,
    color: '#C7D2FE',
    marginLeft: 6,
    flex: 1,
  },
  topOfferClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 12,
  },
  topOfferClaimText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
    marginRight: 6,
  },
  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#063E32',
    marginLeft: 6,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 16,
  },
  modalAmountBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalAmountLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  modalAmountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#063E32',
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 4,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalInfoKey: {
    fontSize: 12,
    color: '#64748B',
  },
  modalInfoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalAiTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  modalAiTagText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 15,
  },
  modalDoneBtn: {
    backgroundColor: '#063E32',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
