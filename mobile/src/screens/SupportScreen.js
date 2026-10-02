import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const FAQ_CATEGORIES = [
  { id: 'all', labelEn: 'All Topics', labelBn: 'সকল বিষয়', icon: 'grid-outline' },
  { id: 'transfer', labelEn: 'Wrong Number & Refund', labelBn: 'ভুল নম্বর ও রিফান্ড', icon: 'swap-horizontal-outline' },
  { id: 'security', labelEn: 'PIN & Security', labelBn: 'পিন ও নিরাপত্তা', icon: 'shield-checkmark-outline' },
  { id: 'charges', labelEn: 'Charges & Limits', labelBn: 'চার্জ ও লিমিট', icon: 'wallet-outline' },
  { id: 'deposit', labelEn: 'Add Money', labelBn: 'অ্যাড মানি ও কার্ড', icon: 'card-outline' },
];

const FAQS = [
  {
    id: 'faq_1',
    category: 'transfer',
    questionEn: 'What should I do if money is sent to the wrong number?',
    questionBn: 'টাকা ভুল নম্বরে গেলে কী করব?',
    tagEn: 'Emergency',
    tagBn: 'জরুরি পদক্ষেপ',
    stepsEn: [
      'Unregistered number: Cancel immediately from Statement / Txn History.',
      'Registered number: Dial 16247 right away with TxnID to hold the funds.',
      'Investigation: Case investigated per Bangladesh Bank MFS guidelines.',
    ],
    stepsBn: [
      'অনিবন্ধিত নম্বর: লেনদেন হিস্ট্রি থেকে সাথে সাথে বাতিল (Cancel) করুন।',
      'নিবন্ধিত নম্বর: অনতিবিলম্বে ১৬২৪৭ এ কল করে আপনার TxnID জানান।',
      'হোল্ডিং ব্যবস্থা: বাংলাদেশ ব্যাংকের নীতিমালা অনুযায়ী প্রাপক অ্যাকাউন্টে হোল্ড রিকোয়েস্ট পাঠানো হবে।',
    ],
    answerEn:
      'If you accidentally send money to an unregistered number, you can immediately cancel it from your transaction history. If the receiver is a registered user, call our 24/7 hotline 16247 or report to your nearest customer care center with your TxnID. Under Bangladesh Bank guidelines, an investigation and holding request will be initiated.',
    answerBn:
      'টাকা যদি কোনো অনিবন্ধিত নম্বরে পাঠানো হয়ে থাকে, তবে ট্রানজাকশন হিস্টোরি থেকে তাৎক্ষণিক বাতিল (Cancel) করা যাবে। আর যদি অ্যাকাউন্টটি নিবন্ধিত হয়, তবে অনতিবিলম্বে আমাদের ২৪/৭ হটলাইন ১৬২৪৭-এ কল করুন এবং আপনার ট্রানজাকশন আইডি (TxnID) জানান। বাংলাদেশ ব্যাংকের নীতিমালা অনুযায়ী সংশ্লিষ্ট অ্যাকাউন্টের বিরুদ্ধে তদন্ত ও হোল্ডিং ব্যবস্থা নেওয়া হবে।',
  },
  {
    id: 'faq_2',
    category: 'security',
    questionEn: 'What to do if I forget my GenCash PIN?',
    questionBn: 'পিন ভুলে গেলে করণীয় কী?',
    tagEn: 'Security',
    tagBn: 'নিরাপত্তা',
    stepsEn: [
      'Never share your PIN/OTP with anyone, including agents.',
      'Tap "Forgot PIN" on Login Screen or go to Settings > Security.',
      'Verify registered SIM OTP + Last 4 digits of your NID.',
    ],
    stepsBn: [
      'আপনার পিন বা ওটিপি কখনোই কারো সাথে শেয়ার করবেন না।',
      'লগইন স্ক্রিনে "Forgot PIN" চাপুন অথবা সেটিংস > সিকিউরিটিতে যান।',
      'নিবন্ধিত সিমে পাওয়া ওটিপি এবং NID এর শেষ ৪ ডিজিট দিয়ে নতুন পিন সেট করুন।',
    ],
    answerEn:
      'Never share your PIN with anyone. To reset your PIN, go to Settings > Security > Change PIN, or tap "Forgot PIN" on the login screen. You will receive an OTP on your registered SIM and need to verify your NID details to set a new 6-digit PIN securely.',
    answerBn:
      'আপনার পিন কখনো কারো সাথে শেয়ার করবেন না। পিন রিসেট করতে লগইন স্ক্রিনে "Forgot PIN" বা সেটিংসে যান। আপনার নিবন্ধিত সিমে ওটিপি (OTP) কোড পাঠানো হবে এবং জাতীয় পরিচয়পত্রের (NID) শেষ ৪ ডিজিট দিয়ে নতুন ৬ ডিজিটের গোপন পিন সেট করতে পারবেন।',
  },
  {
    id: 'faq_3',
    category: 'charges',
    questionEn: 'What are the charges for Cash Out and Send Money?',
    questionBn: 'ক্যাশ আউট এবং সেন্ড মানি চার্জ কত?',
    tagEn: 'Tariff',
    tagBn: 'চার্জ রেট',
    stepsEn: [
      'Send Money (P2P): ৳5.00 flat fee (Free to 5 Saved Priyo Numbers).',
      'Cash Out (Agent): 1.85% (৳18.50 per ৳1,000).',
      'Add Money: 100% Free from any Bank or Visa/Mastercard.',
      'Mobile Recharge: Completely Free of charge.',
    ],
    stepsBn: [
      'সেন্ড মানি (P2P): মাত্র ৳৫.০০ ফিক্সড চার্জ (৫টি প্রিয় নাম্বারে ফ্রি)।',
      'এজেন্ট ক্যাশ আউট: ১.৮৫% (প্রতি হাজারে ৳১৮.৫০)।',
      'ব্যাংক বা কার্ড থেকে টাকা যোগ (Add Money): সম্পূর্ণ ফ্রি (০% ফি)।',
      'মোবাইল রিচার্জ: সম্পূর্ণ ফ্রি।',
    ],
    answerEn:
      '• Send Money (P2P): ৳5.00 flat fee per transfer.\n• Cash Out via Agent: 1.85% (৳18.50 per ৳1,000).\n• Add Money: 100% Free from any Bank or Visa/Mastercard.\n• Mobile Recharge: Completely Free of charge.',
    answerBn:
      '• সেন্ড মানি (P2P): প্রতি লেনদেনে মাত্র ৳৫.০০ ফিক্সড চার্জ।\n• এজেন্ট ক্যাশ আউট: ১.৮৫% (প্রতি হাজারে ৳১৮.৫০)।\n• ব্যাংক বা কার্ড থেকে টাকা যোগ (Add Money): সম্পূর্ণ ফ্রি (০% ফি)।\n• মোবাইল রিচার্জ: সম্পূর্ণ ফ্রি।',
  },
  {
    id: 'faq_4',
    category: 'charges',
    questionEn: 'What are the daily and monthly transaction limits?',
    questionBn: 'দৈনিক এবং মাসিক লেনদেনের সীমা কত?',
    tagEn: 'Limits',
    tagBn: 'লেনদেন সীমা',
    stepsEn: [
      'Daily Send Money: Up to ৳25,000 (Max 10 times a day).',
      'Monthly Send Money: Up to ৳200,000.',
      'Daily Cash Out: Up to ৳25,000.',
      'Monthly Cash Out: Up to ৳150,000.',
    ],
    stepsBn: [
      'দৈনিক সেন্ড মানি: সর্বোচ্চ ৳২৫,০০০ (দিনে সর্বোচ্চ ১০ বার)।',
      'মাসিক সেন্ড মানি: সর্বোচ্চ ৳২,০০,০০০।',
      'দৈনিক ক্যাশ আউট: সর্বোচ্চ ৳২৫,০০০।',
      'মাসিক ক্যাশ আউট: সর্বোচ্চ ৳১,৫০,০০০।',
    ],
    answerEn:
      '• Daily Send Money: Up to ৳25,000 (Max 10 times a day).\n• Monthly Send Money: Up to ৳200,000.\n• Daily Cash Out: Up to ৳25,000.\n• Monthly Cash Out: Up to ৳150,000.\n• Wallet Balance Limit: Up to ৳300,000 at any time.',
    answerBn:
      '• দৈনিক সেন্ড মানি: সর্বোচ্চ ৳২৫,০০০ (দিনে সর্বোচ্চ ১০ বার)।\n• মাসিক সেন্ড মানি: সর্বোচ্চ ৳২,০০,০০০।\n• দৈনিক ক্যাশ আউট: সর্বোচ্চ ৳২৫,০০০।\n• মাসিক ক্যাশ আউট: সর্বোচ্চ ৳১,৫০,০০০।\n• যেকোনো সময় ওয়ালেট ব্যালেন্স লিমিট: সর্বোচ্চ ৳৩,০০,০০০।',
  },
  {
    id: 'faq_5',
    category: 'deposit',
    questionEn: 'Why did my Add Money or Deposit fail?',
    questionBn: 'টাকা যোগ (Add Money) ব্যর্থ হলে করণীয় কী?',
    tagEn: 'Deposit',
    tagBn: 'অ্যাড মানি',
    stepsEn: [
      'Ensure internet e-commerce transactions are active on card.',
      'Check for sufficient balance in your bank account.',
      'Auto-Reversal: Debited money returns automatically within 24-72 bank hours.',
    ],
    stepsBn: [
      'আপনার কার্ডে ই-কমার্স বা অনলাইন লেনদেন সচল আছে কিনা দেখুন।',
      'ব্যাংক অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স রয়েছে কিনা যাচাই করুন।',
      'টাকা কেটে নিলে সাধারণত ২৪ থেকে ৭২ ব্যাংকিং ঘণ্টার মধ্যে স্বয়ংক্রিয়ভাবে ফেরত আসে।',
    ],
    answerEn:
      'Add Money can fail if your linked card has internet e-commerce transactions turned off, insufficient bank funds, or network timeouts. If your bank account was debited but your GenCash wallet has not updated, the funds will automatically reverse within 24 to 72 bank working hours.',
    answerBn:
      'কার্ডে ই-কমার্স ট্রানজাকশন বন্ধ থাকলে বা ব্যাংকে পর্যাপ্ত ব্যালেন্স না থাকলে টাকা যোগ ব্যর্থ হতে পারে। যদি ব্যাংক থেকে টাকা কেটে নেওয়া হয় কিন্তু ওয়ালেটে জমা না হয়, তবে ব্যাংকিং নিয়মানুযায়ী ২৪ থেকে ৭২ ঘণ্টার মধ্যে টাকা স্বয়ংক্রিয়ভাবে আপনার ব্যাংক অ্যাকাউন্টে ফেরত যাবে।',
  },
];

const QUICK_TOPICS = [
  { id: 'qt1', en: 'Money sent to wrong number', bn: 'ভুল নাম্বারে টাকা গেছে' },
  { id: 'qt2', en: 'Forgot PIN reset', bn: 'পিন ভুলে গেছি' },
  { id: 'qt3', en: 'Cash out charges', bn: 'ক্যাশ আউট চার্জ কত?' },
  { id: 'qt4', en: 'Daily limits', bn: 'দৈনিক লেনদেন লিমিট কত?' },
  { id: 'qt5', en: 'Emergency Account Freeze', bn: 'জরুরি অ্যাকাউন্ট বন্ধ' },
];

export const SupportScreen = ({ navigation }) => {
  const { isBangla } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState(FAQS[0].id);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: isBangla
        ? 'আসসালামু আলাইকুম! GenCash কাস্টমার সাপোর্ট ডেস্কে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি? নিচে লিখুন বা বিষয় বেছে নিন।'
        : 'Assalamu Alaikum! Welcome to GenCash Customer Support Desk. How can we help you today? Please type below or pick a topic.',
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;

      const q = isBangla ? faq.questionBn.toLowerCase() : faq.questionEn.toLowerCase();
      const a = isBangla ? faq.answerBn.toLowerCase() : faq.answerEn.toLowerCase();
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch = !search || q.includes(search) || a.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, isBangla]);

  const toggleFaq = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:16247').catch(() => {
      Alert.alert(
        isBangla ? 'কাস্টমার কেয়ার হটলাইন' : 'Customer Helpline',
        isBangla
          ? 'যেকোনো মোবাইল থেকে সরাসরি ১৬২৪৭ নম্বরে কল করুন।'
          : 'Dial 16247 directly from your mobile for 24/7 support.'
      );
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gencash.com?subject=Customer%20Support%20Inquiry').catch(() => {
      Alert.alert('Email Support', 'Contact us at: support@gencash.com');
    });
  };

  const handleEmergencyLock = () => {
    Alert.alert(
      isBangla ? '🚨 জরুরি অ্যাকাউন্ট ফ্রিজ' : '🚨 Emergency Account Freeze',
      isBangla
        ? 'মোবাইল হারিয়ে গেলে বা সন্দেহজনক লেনদেন ঘটলে আপনার GenCash অ্যাকাউন্ট সাময়িকভাবে লক করতে এখনই ১৬২৪৭ ডায়াল করুন।'
        : 'If your phone is lost or you suspect fraud, call 16247 immediately to freeze your account.',
      [
        { text: isBangla ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: isBangla ? 'কল করুন (১৬২৪৭)' : 'Call (16247)',
          onPress: handleCallHelpline,
          style: 'destructive',
        },
      ]
    );
  };

  const handleFeedback = (faqId, isHelpful) => {
    setFeedbackGiven((prev) => ({ ...prev, [faqId]: isHelpful }));
    Alert.alert(
      isBangla ? 'মতামত গৃহীত হয়েছে' : 'Thank You',
      isBangla
        ? 'আপনার মতামতের জন্য ধন্যবাদ।'
        : 'Thank you for your feedback.'
    );
  };

  const sendAgentResponse = (query) => {
    const q = query.toLowerCase();
    let reply = isBangla
      ? 'ধন্যবাদ। আপনার বার্তাটি পেয়েছি। একজন কাস্টমার সাপোর্ট প্রতিনিধি শীঘ্রই আপনার সাথে যুক্ত হবেন। জরুরি প্রয়োজনে ১৬২৪৭ কল করুন।'
      : 'Thank you. We have received your query. A customer support officer will connect shortly. For urgent matters, call 16247.';

    if (q.includes('wrong') || q.includes('ভুল') || q.includes('নম্বর')) {
      reply = isBangla
        ? 'ভুল নম্বরে টাকা গেলে করণীয়:\n১. অনিবন্ধিত হলে স্টেটমেন্ট থেকে Cancel করুন।\n২. নিবন্ধিত হলে আপনার TxnID নিয়ে এখনই ১৬২৪৭ ডায়াল করুন যাতে প্রাপক অ্যাকাউন্টে হোল্ড রিকোয়েস্ট দেওয়া যায়।'
        : 'Wrong number transfer:\n1. If recipient is unregistered, tap Cancel in your statement.\n2. If registered, dial 16247 immediately with TxnID for hold request.';
    } else if (q.includes('pin') || q.includes('পিন')) {
      reply = isBangla
        ? 'পিন সংক্রান্ত সহায়তা:\nপিন কখনো কাউকে বলবেন না। পিন ভুলে গেলে লগইন পেইজের "Forgot PIN" চাপুন এবং আপনার সিমে আসা OTP ও NID এর শেষ ৪ ডিজিট দিয়ে নতুন পিন দিন।'
        : 'PIN Assistance:\nNever share your PIN. If forgotten, tap "Forgot PIN" on login screen, enter SMS OTP and last 4 digits of your NID to reset.';
    } else if (q.includes('charge') || q.includes('চার্জ') || q.includes('ফি')) {
      reply = isBangla
        ? 'চার্জ রেট:\n• সেন্ড মানি: ৳৫ (৫টি প্রিয় নাম্বারে ফ্রি)\n• ক্যাশ আউট: ১.৮৫% (প্রতি হাজারে ৳১৮.৫০)\n• কার্ড/ব্যাংক অ্যাড মানি: সম্পূর্ণ ফ্রি'
        : 'Charge Rates:\n• Send Money: ৳5 (Free for 5 Saved Nos)\n• Cash Out: 1.85% (৳18.50 per ৳1,000)\n• Add Money: 100% Free';
    } else if (q.includes('limit') || q.includes('লিমিট')) {
      reply = isBangla
        ? 'লেনদেন সীমা:\n• দৈনিক সেন্ড মানি: সর্বোচ্চ ৳২৫,০০০ (১০ বার)\n• দৈনিক ক্যাশ আউট: সর্বোচ্চ ৳২৫,০০০\n• ওয়ালেটের সর্বোচ্চ ধারণক্ষমতা: ৳৩,০০,০০০'
        : 'Transaction Limits:\n• Daily Send: ৳25,000 (10 times)\n• Daily Cash Out: ৳25,000\n• Wallet Limit: ৳300,000';
    } else if (q.includes('freeze') || q.includes('লক') || q.includes('বন্ধ') || q.includes('জরুরি')) {
      reply = isBangla
        ? '🚨 জরুরি অ্যাকাউন্ট ফ্রিজ:\nসন্দেহজনক কার্যকলাপ বা ফোন হারালে অবিলম্বে ১৬২৪৭ এ কল করে হটলাইন অফিসারকে অ্যাকাউন্ট লক করতে বলুন।'
        : '🚨 Emergency Lock:\nCall 16247 immediately to request an instant account freeze from our representative.';
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    sendAgentResponse(text);
  };

  const handleTopicClick = (topic) => {
    const text = isBangla ? topic.bn : topic.en;
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    sendAgentResponse(text);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* Top Header */}
      <LinearGradient
        colors={['#043227', '#064E3B', '#0B5945']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topHeader}
      >
        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.navBackBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerMainTitle}>
              {isBangla ? 'কাস্টমার সাপোর্ট ও হেল্পলাইন' : 'Customer Support & Help'}
            </Text>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveStatusText}>
                {isBangla ? '২৪/৭ সাপোর্ট সক্রিয়' : '24/7 Desk Active'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.sosNavBtn}
            onPress={handleEmergencyLock}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-outline" size={18} color="#FFD1D7" />
          </TouchableOpacity>
        </View>

        {/* Live Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#A7F3D0" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isBangla
                ? 'কী বিষয়ে সাহায্য চান? (যেমন: ভুল নম্বর, পিন, চার্জ...)'
                : 'Search issues (e.g. wrong number, PIN, charges...)'
            }
            placeholderTextColor="#74B49C"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#A7F3D0" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Master Hotline Banner */}
        <LinearGradient
          colors={['#064E3B', '#0D5E48', '#146E56']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.masterHotlineCard}
        >
          <View style={styles.hotlineLeft}>
            <View style={styles.hotlineBadge}>
              <Ionicons name="call" size={11} color="#00D09C" />
              <Text style={styles.hotlineBadgeText}>
                {isBangla ? 'টোল-ফ্রি হেল্পলাইন' : 'Toll-Free 24/7'}
              </Text>
            </View>
            <Text style={styles.hotlineLabel}>
              {isBangla ? 'কাস্টমার কেয়ার হটলাইন' : 'Customer Helpline'}
            </Text>
            <Text style={styles.hotlineNumber}>16247</Text>
            <Text style={styles.hotlineSub}>
              {isBangla ? 'বাংলাদেশ ব্যাংক অনুমোদিত MFS সেবা' : 'Authorized MFS Support Service'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callNowBtn}
            onPress={handleCallHelpline}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00D09C', '#00A87E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.callNowBtnGradient}
            >
              <Ionicons name="call" size={18} color="#043227" />
              <Text style={styles.callNowBtnText}>{isBangla ? 'কল করুন' : 'Call'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* 2. Contact Channels: STRICTLY 2 BOXES PER ROW (Side by Side / পাশাপাশি) */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>
            {isBangla ? 'যোগাযোগের মাধ্যম' : 'Contact Channels'}
          </Text>
          <Text style={styles.sectionSub}>
            {isBangla ? 'আপনার সুবিধাজনক মাধ্যমে সহায়তা নিন' : 'Get quick assistance via your preferred option'}
          </Text>
        </View>

        {/* Row 1: Live Chat & Direct Call (Side by Side / পাশাপাশি) */}
        <View style={styles.boxesRow}>
          {/* Box 1: Live Chat */}
          <TouchableOpacity
            style={styles.halfBox}
            onPress={() => setShowLiveChat(true)}
            activeOpacity={0.8}
          >
            <View style={styles.halfBoxTopRow}>
              <View style={[styles.boxIconCircle, { backgroundColor: '#E8FBF4' }]}>
                <Ionicons name="chatbubbles" size={20} color="#00A87E" />
              </View>
              <View style={[styles.miniBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.miniBadgeText, { color: '#0369A1' }]}>
                  {isBangla ? '২৪/৭ সক্রিয়' : '24/7 Live'}
                </Text>
              </View>
            </View>
            <Text style={styles.boxTitle}>{isBangla ? 'লাইভ চ্যাট' : 'Live Chat'}</Text>
            <Text style={styles.boxSub} numberOfLines={2}>
              {isBangla ? 'সাপোর্ট ডেস্কে সরাসরি কথা বলুন' : 'Chat with support desk'}
            </Text>
          </TouchableOpacity>

          {/* Box 2: Direct Call */}
          <TouchableOpacity
            style={styles.halfBox}
            onPress={handleCallHelpline}
            activeOpacity={0.8}
          >
            <View style={styles.halfBoxTopRow}>
              <View style={[styles.boxIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="call" size={20} color="#16A34A" />
              </View>
              <View style={[styles.miniBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.miniBadgeText, { color: '#15803D' }]}>16247</Text>
              </View>
            </View>
            <Text style={styles.boxTitle}>{isBangla ? 'হটলাইন কল' : 'Direct Call'}</Text>
            <Text style={styles.boxSub} numberOfLines={2}>
              {isBangla ? 'সরাসরি ১৬২৪৭ নম্বরে ডায়াল করুন' : 'Dial 16247 direct helpline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Email Desk & Emergency Lock (Side by Side / পাশাপাশি) */}
        <View style={styles.boxesRow}>
          {/* Box 3: Email Desk */}
          <TouchableOpacity
            style={styles.halfBox}
            onPress={handleEmailSupport}
            activeOpacity={0.8}
          >
            <View style={styles.halfBoxTopRow}>
              <View style={[styles.boxIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="mail" size={20} color="#2563EB" />
              </View>
              <View style={[styles.miniBadge, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.miniBadgeText, { color: '#1D4ED8' }]}>
                  {isBangla ? 'ইমেইল' : 'Email'}
                </Text>
              </View>
            </View>
            <Text style={styles.boxTitle}>{isBangla ? 'ইমেইল সাপোর্ট' : 'Email Desk'}</Text>
            <Text style={styles.boxSub} numberOfLines={2}>
              support@gencash.com
            </Text>
          </TouchableOpacity>

          {/* Box 4: Emergency Lock */}
          <TouchableOpacity
            style={[styles.halfBox, styles.halfBoxEmergency]}
            onPress={handleEmergencyLock}
            activeOpacity={0.8}
          >
            <View style={styles.halfBoxTopRow}>
              <View style={[styles.boxIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="shield-half" size={20} color="#DC2626" />
              </View>
              <View style={[styles.miniBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.miniBadgeText, { color: '#B91C1C' }]}>
                  {isBangla ? 'জরুরি' : 'Urgent'}
                </Text>
              </View>
            </View>
            <Text style={[styles.boxTitle, { color: '#991B1B' }]}>
              {isBangla ? 'অ্যাকাউন্ট লক' : 'Emergency Lock'}
            </Text>
            <Text style={styles.boxSub} numberOfLines={2}>
              {isBangla ? 'প্রতারণা রোধে তাৎক্ষণিক লক' : 'Emergency account freeze'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Category Filter Chips */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon}
                    size={15}
                    color={isActive ? '#FFFFFF' : '#0B251E'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                  >
                    {isBangla ? cat.labelBn : cat.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Common Fintech FAQ Accordion Section */}
        <View style={styles.faqHeadingRow}>
          <Text style={styles.faqHeadingTitle}>
            {isBangla ? 'সাধারণ জিজ্ঞাসাসমূহ (FAQ)' : 'Frequently Asked Questions'}
          </Text>
          <Text style={styles.faqCountText}>
            {filteredFaqs.length} {isBangla ? 'টি সমাধান' : 'topics'}
          </Text>
        </View>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Ionicons name="search-outline" size={38} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>
              {isBangla ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No topics found'}
            </Text>
            <Text style={styles.emptyStateSub}>
              {isBangla
                ? 'অন্য কোনো শব্দ দিয়ে খুঁজুন বা সরাসরি আমাদের লাইভ চ্যাটে জিজ্ঞাসা করুন।'
                : 'Try different words or ask our support team in Live Chat.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyChatBtn}
              onPress={() => setShowLiveChat(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyChatBtnText}>
                {isBangla ? 'লাইভ চ্যাট শুরু করুন' : 'Start Live Chat'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.faqList}>
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const question = isBangla ? faq.questionBn : faq.questionEn;
              const answer = isBangla ? faq.answerBn : faq.answerEn;
              const tag = isBangla ? faq.tagBn : faq.tagEn;
              const steps = isBangla ? faq.stepsBn : faq.stepsEn;
              const feedback = feedbackGiven[faq.id];

              return (
                <View
                  key={faq.id}
                  style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                >
                  <TouchableOpacity
                    style={styles.faqCardHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleFaq(faq.id)}
                  >
                    <View style={styles.faqHeaderLeft}>
                      <View style={styles.faqTagPill}>
                        <Text style={styles.faqTagPillText}>{tag}</Text>
                      </View>
                      <Text
                        style={[styles.faqQuestionText, isExpanded && styles.faqQuestionExpanded]}
                      >
                        {question}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.chevronWrap,
                        isExpanded && styles.chevronWrapActive,
                      ]}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={isExpanded ? '#00D09C' : '#64748B'}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqCardBody}>
                      {/* Step-by-Step Guideline Box */}
                      {steps && steps.length > 0 && (
                        <View style={styles.stepsBox}>
                          {steps.map((step, idx) => (
                            <View key={idx} style={styles.stepRow}>
                              <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeNum}>{idx + 1}</Text>
                              </View>
                              <Text style={styles.stepText}>{step}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <Text style={styles.faqAnswerText}>{answer}</Text>

                      {/* Feedback Row */}
                      <View style={styles.faqFeedbackRow}>
                        <Text style={styles.faqFeedbackQuestion}>
                          {isBangla ? 'এই তথ্যটি কি কার্যকর ছিল?' : 'Was this helpful?'}
                        </Text>
                        <View style={styles.feedbackButtons}>
                          <TouchableOpacity
                            style={[
                              styles.feedbackActionBtn,
                              feedback === true && styles.feedbackBtnYes,
                            ]}
                            onPress={() => handleFeedback(faq.id, true)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="thumbs-up-outline"
                              size={14}
                              color={feedback === true ? '#064E3B' : '#64748B'}
                            />
                            <Text
                              style={[
                                styles.feedbackActionText,
                                feedback === true && { color: '#064E3B', fontWeight: '800' },
                              ]}
                            >
                              {isBangla ? 'হ্যাঁ' : 'Yes'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.feedbackActionBtn,
                              feedback === false && styles.feedbackBtnNo,
                            ]}
                            onPress={() => handleFeedback(faq.id, false)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="thumbs-down-outline"
                              size={14}
                              color={feedback === false ? '#991B1B' : '#64748B'}
                            />
                            <Text
                              style={[
                                styles.feedbackActionText,
                                feedback === false && { color: '#991B1B', fontWeight: '800' },
                              ]}
                            >
                              {isBangla ? 'না' : 'No'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Regulatory Compliance Footer */}
        <View style={styles.complianceCard}>
          <Ionicons name="shield-checkmark" size={20} color="#00D09C" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.complianceHeading}>
              {isBangla ? 'বাংলাদেশ ব্যাংক নিয়ন্ত্রিত MFS প্ল্যাটফর্ম' : 'Regulated MFS Security Standard'}
            </Text>
            <Text style={styles.complianceSub}>
              {isBangla
                ? 'আপনার প্রতিটি আর্থিক লেনদেন ও ব্যক্তিগত তথ্য সর্বোচ্চ ব্যাংকিং এনক্রিপশন দ্বারা সুরক্ষিত।'
                : 'Every transaction is encrypted and governed by Bangladesh Bank mobile financial services regulations.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Quick Live Chat Bar */}
      <View style={styles.bottomChatBar}>
        <TouchableOpacity
          style={styles.bottomChatBtn}
          onPress={() => setShowLiveChat(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#043227', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomChatGradient}
          >
            <View style={styles.bottomChatIconCircle}>
              <Ionicons name="chatbubbles" size={18} color="#043227" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomChatTitle}>
                {isBangla ? 'কাস্টমার প্রতিনিধির সাথে কথা বলুন' : 'Chat with Customer Care Desk'}
              </Text>
              <Text style={styles.bottomChatSub}>
                {isBangla ? 'গড় উত্তর পাওয়ার সময়: ১ মিনিটের কম' : 'Average response: < 1 minute'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00D09C" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 24/7 Live Customer Care Chat Modal */}
      <Modal
        visible={showLiveChat}
        animationType="slide"
        onRequestClose={() => setShowLiveChat(false)}
      >
        <View style={styles.chatContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#043227" />

          {/* Modal Header */}
          <LinearGradient
            colors={['#043227', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatModalHeader}
          >
            <View style={styles.chatHeaderLeft}>
              <View style={styles.agentAvatarCircle}>
                <Ionicons name="headset" size={20} color="#043227" />
                <View style={styles.agentOnlineBadge} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.chatHeaderName}>
                  {isBangla ? 'GenCash কাস্টমার কেয়ার' : 'GenCash Customer Care'}
                </Text>
                <View style={styles.chatHeaderStatusRow}>
                  <View style={styles.chatGreenDot} />
                  <Text style={styles.chatStatusText}>
                    {isBangla ? 'সক্রিয় • তাৎক্ষণিক সহায়তা' : 'Active • Instant Response'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowLiveChat(false)}
              style={styles.chatCloseBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Quick Issue Topics Carousel */}
          <View style={styles.topicCarouselWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScroll}
            >
              {QUICK_TOPICS.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicChip}
                  onPress={() => handleTopicClick(topic)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={12} color="#064E3B" style={{ marginRight: 5 }} />
                  <Text style={styles.topicChipText}>
                    {isBangla ? topic.bn : topic.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView
            contentContainerStyle={styles.chatMessagesScroll}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.chatMessageRow,
                    isUser ? styles.chatRowUser : styles.chatRowBot,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botIconCircle}>
                      <Ionicons name="headset" size={13} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.chatBubble,
                      isUser ? styles.chatBubbleUser : styles.chatBubbleBot,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatBubbleText,
                        isUser ? styles.chatTextUser : styles.chatTextBot,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.chatTime,
                        isUser ? styles.chatTimeUser : styles.chatTimeBot,
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Chat Input Bar */}
          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder={
                isBangla ? 'আপনার সমস্যা বা লেনদেনের বিবরণ লিখুন...' : 'Type your query or TxnID...'
              }
              placeholderTextColor="#94A3B8"
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={[
                styles.chatSendBtn,
                inputMessage.trim().length > 0 && styles.chatSendBtnActive,
              ]}
              onPress={handleSendMessage}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputMessage.trim().length > 0 ? '#043227' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  topHeader: {
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerMainTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 156, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D09C',
    marginRight: 5,
  },
  liveStatusText: {
    color: '#00D09C',
    fontSize: 10,
    fontWeight: '700',
  },
  sosNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  masterHotlineCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 156, 0.25)',
  },
  hotlineLeft: {
    flex: 1,
    paddingRight: 10,
  },
  hotlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 156, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  hotlineBadgeText: {
    color: '#00D09C',
    fontSize: 10,
    fontWeight: '800',
  },
  hotlineLabel: {
    color: '#E2EFE9',
    fontSize: 12,
    fontWeight: '600',
  },
  hotlineNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 2,
  },
  hotlineSub: {
    color: '#A7F3D0',
    fontSize: 10,
  },
  callNowBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00D09C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  callNowBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callNowBtnText: {
    color: '#043227',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderWrap: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0B251E',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    color: '#47665C',
    fontSize: 11,
    marginTop: 2,
  },

  // 2 Boxes Per Row (Side by Side / পাশাপাশি)
  boxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    width: '100%',
  },
  halfBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  halfBoxEmergency: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  halfBoxTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  boxIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  boxTitle: {
    color: '#0B251E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  boxSub: {
    color: '#7B968D',
    fontSize: 10,
    lineHeight: 14,
  },

  // Categories
  categoryContainer: {
    marginVertical: 14,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D2E6DC',
  },
  categoryChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  categoryChipText: {
    color: '#0B251E',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // FAQ List
  faqHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqHeadingTitle: {
    color: '#0B251E',
    fontSize: 15,
    fontWeight: '800',
  },
  faqCountText: {
    color: '#47665C',
    fontSize: 11,
    fontWeight: '600',
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EFE9',
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  faqCardExpanded: {
    borderColor: '#00D09C',
    backgroundColor: '#FAFFFD',
  },
  faqCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },
  faqTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  faqTagPillText: {
    color: '#064E3B',
    fontSize: 10,
    fontWeight: '800',
  },
  faqQuestionText: {
    color: '#0B251E',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  faqQuestionExpanded: {
    color: '#064E3B',
    fontWeight: '800',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F6F9F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronWrapActive: {
    backgroundColor: '#043227',
  },
  faqCardBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2EFE9',
  },
  stepsBox: {
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  stepBadgeNum: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: '#0B251E',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  faqAnswerText: {
    color: '#47665C',
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 6,
  },
  faqFeedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2EFE9',
  },
  faqFeedbackQuestion: {
    color: '#7B968D',
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F9F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D2E6DC',
  },
  feedbackBtnYes: {
    backgroundColor: '#E8F6F0',
    borderColor: '#00D09C',
  },
  feedbackBtnNo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  feedbackActionText: {
    color: '#47665C',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE9',
    marginVertical: 10,
  },
  emptyStateTitle: {
    color: '#0B251E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyStateSub: {
    color: '#7B968D',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 6,
    lineHeight: 16,
  },
  emptyChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
  },
  emptyChatBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  complianceHeading: {
    color: '#0B251E',
    fontSize: 12,
    fontWeight: '800',
  },
  complianceSub: {
    color: '#7B968D',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  bottomChatBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingTop: 8,
    backgroundColor: 'rgba(243, 249, 246, 0.95)',
  },
  bottomChatBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bottomChatIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bottomChatTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomChatSub: {
    color: '#A7F3D0',
    fontSize: 10,
    marginTop: 1,
  },

  // Modal Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#F6F9F8',
  },
  chatModalHeader: {
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  agentOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#043227',
  },
  chatHeaderName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  chatHeaderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  chatGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D09C',
  },
  chatStatusText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '600',
  },
  chatCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicCarouselWrap: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2EFE9',
  },
  topicScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E6DC',
  },
  topicChipText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '700',
  },
  chatMessagesScroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatRowBot: {
    justifyContent: 'flex-start',
  },
  botIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chatBubbleUser: {
    backgroundColor: '#064E3B',
    borderBottomRightRadius: 4,
  },
  chatBubbleBot: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2EFE9',
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatTextUser: {
    color: '#FFFFFF',
  },
  chatTextBot: {
    color: '#0B251E',
  },
  chatTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatTimeUser: {
    color: '#A7F3D0',
  },
  chatTimeBot: {
    color: '#94A3B8',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2EFE9',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F6F9F8',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 13,
    color: '#0B251E',
    borderWidth: 1,
    borderColor: '#D2E6DC',
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendBtnActive: {
    backgroundColor: '#00D09C',
  },
});
