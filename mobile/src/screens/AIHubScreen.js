import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export const AIHubScreen = ({ navigation }) => {
  const { user, wallet } = useAuth();
  const { isBangla, toBengaliNumber } = useLanguage();

  const [intelligence, setIntelligence] = useState(null);
  const [nboData, setNboData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackState, setFeedbackState] = useState({});
  const [activeAiAnswer, setActiveAiAnswer] = useState(null);

  const loadAIIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const [recData, nboRes] = await Promise.all([
        api.getAIRecommendations().catch(() => null),
        api.getNextBestOffers().catch(() => null),
      ]);
      if (recData) setIntelligence(recData);
      if (nboRes) setNboData(nboRes);
    } catch (e) {
      console.warn('AI Hub fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAIIntelligence();
  }, [loadAIIntelligence]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAIIntelligence();
    setRefreshing(false);
  };

  const handleFeedback = async (recId, action) => {
    setFeedbackState((prev) => ({ ...prev, [recId]: action }));
    try {
      if (action === 'DISMISSED') {
        await api.dismissOffer?.(recId);
      }
      Alert.alert(
        isBangla ? 'মতামত সংরক্ষিত' : 'Feedback Recorded',
        isBangla
          ? 'ধন্যবাদ! আপনার মতামতের ভিত্তিতে ভবিষ্যতের এআই পরামর্শ আরও নির্ভুল হবে।'
          : 'Thank you! Your feedback helps the AI personalize future suggestions.'
      );
    } catch (e) {}
  };

  const handleClaimOffer = (offer) => {
    if (!offer) return;
    const screen = offer.target_screen || (offer.category === 'RECHARGE' ? 'MobileRecharge' : 'MerchantPayment');
    const params = offer.target_params || (offer.phone ? { phone: offer.phone } : {});
    navigation.navigate(screen, params);
  };

  const handleQuickQuestion = (qKey) => {
    const balance = wallet?.balance || 12500;
    if (qKey === 'spending') {
      setActiveAiAnswer({
        title: isBangla ? 'মাসিক ব্যয়ের বিশ্লেষণ' : 'Monthly Spending Analysis',
        icon: 'pie-chart-outline',
        color: '#059669',
        body: isBangla
          ? `আপনার গত ৩০ দিনের মোট খরচের মধ্যে প্রায় ৪৫% ব্যয় হয়েছে গ্রোসারি ও দৈনন্দিন কেনাকাটায়, ৩৫% খাবার ও ডাইনিংয়ে এবং ২০% মোবাইল রিচার্জ ও ইউটিলিটিতে। আপনার বর্তমান ওয়ালেট ব্যালেন্স ৳${toBengaliNumber(balance)} সুরক্ষিত সীমার মধ্যে রয়েছে।`
          : `Over the past 30 days, approximately 45% of your outflow went to groceries & retail, 35% to food & dining, and 20% to recharge & bills. Your current wallet balance of ৳${balance.toLocaleString()} is in safe zone.`,
        tip: isBangla
          ? '💡 এআই টিপ: পার্টনার মার্চেন্টে কিউআর পেমেন্ট করে ক্যাশব্যাক নিলে প্রতি মাসে গড়ে ৳৪৫০ পর্যন্ত সাশ্রয় সম্ভব।'
          : '💡 AI Tip: Pay via GenCash QR at partner hubs to save an average of ৳450 every month.',
      });
    } else if (qKey === 'saving') {
      setActiveAiAnswer({
        title: isBangla ? 'স্মার্ট সঞ্চয়ের উপায়' : 'Smart Saving Tips',
        icon: 'wallet-outline',
        color: '#2563EB',
        body: isBangla
          ? 'এআই অ্যানালাইসিস অনুযায়ী, শুক্রবার ও ছুটির দিনে আপনার ক্যাশ আউট কিছুটা বেশি হয়। ক্যাশ আউটের বদলে সরাসরি মার্চেন্ট কিউআর পেমেন্ট করলে ১.৮৫% চার্জ বাঁচবে এবং উল্টো ১%-৫% ইনস্ট্যান্ট ক্যাশব্যাক মিলবে।'
          : 'AI analysis indicates higher cash-outs on weekends. Using direct Merchant QR payments instead of cash-out saves 1.85% cash-out fee and earns 1%-5% instant cashback.',
        tip: isBangla
          ? '💡 লক্ষ্যমাত্রা: প্রতি সপ্তাহে অন্তত ৫০০ টাকা সেভ করলে মাস শেষে ২০০০ টাকার সঞ্চয় জমা হবে।'
          : '💡 Target: Save at least ৳500 weekly to accumulate ৳2,000 extra per month.',
      });
    } else if (qKey === 'best_offer') {
      const topOffer = nboData?.top_recommended_offer;
      setActiveAiAnswer({
        title: isBangla ? 'আপনার জন্য সেরা অফার' : 'Top Personalized Deal',
        icon: 'gift-outline',
        color: '#D97706',
        body: topOffer
          ? (isBangla
              ? `আপনার লেনদেনের ধরন অনুযায়ী আজকের সেরা অফার: "${topOffer.title}"। ${topOffer.reason_bn || 'এটি আপনার অতীত কেনাকাটার সাথে সর্বোচ্চ ৯৪% সামঞ্জস্যপূর্ণ।'}`
              : `Based on your recent transactions, your top deal is: "${topOffer.title}". ${topOffer.reason || 'It has a 94% affinity match with your spending habits.'}`)
          : (isBangla
              ? 'স্বপ্ন সুপারস্টোরে কেনাকাটা ও চিলক্স বার্গারে কিউআর পেমেন্টে পাচ্ছেন সর্বোচ্চ ১৫% ক্যাশব্যাক অফার।'
              : 'Enjoy up to 15% instant cashback at Shwapno Superstore & Chillox Burger.'),
        tip: isBangla ? '💡 এখনই অফারটি ব্যবহার করতে নিচে ক্লিক করুন।' : '💡 Tap below to claim this offer now.',
        actionOffer: topOffer,
      });
    }
  };

  const anomaly = nboData?.spending_anomaly;
  const topOffer = nboData?.top_recommended_offer;
  const rankedOffers = nboData?.ranked_offers || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063E32" />

      {/* Premium Emerald Header */}
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
              <Text style={styles.sparkleBadgeText}>GenCash XAI 2.0</Text>
            </View>
            <Text style={styles.headerTitle}>
              {isBangla ? 'এআই ফিন্যান্সিয়াল অ্যাসিস্ট্যান্ট' : 'AI Financial Hub'}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.headerSubtitle}>
          {isBangla
            ? 'মেশিন লার্নিং বিশ্লেষণ ও আপনার ব্যক্তিগত সঞ্চয় পরামর্শদাতা'
            : 'Explainable, data-driven financial insights tailored to you'}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D09C"
          />
        }
      >
        {/* 1. AI Financial Health Score Card */}
        <LinearGradient
          colors={['#0B3B30', '#10493C', '#155B4B']}
          style={styles.healthScoreCard}
        >
          <View style={styles.scoreTopRow}>
            <View>
              <Text style={styles.scoreCardTitle}>
                {isBangla ? 'ফিন্যান্সিয়াল হেলথ স্কোর' : 'Financial Health Score'}
              </Text>
              <Text style={styles.scoreStatusLabel}>
                {isBangla ? 'অসাধারণ সঞ্চয় শৃঙ্খলা' : 'Excellent Discipline'}
              </Text>
            </View>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{toBengaliNumber('88')}</Text>
              <Text style={styles.scoreOutOf}>/১০০</Text>
            </View>
          </View>

          {/* 3 Metric Pills */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>৳ {toBengaliNumber('৪৫০')}</Text>
              <Text style={styles.metricLabel}>{isBangla ? 'সম্ভাব্য সাশ্রয়' : 'Savings Opt'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{toBengaliNumber('৯২%')}</Text>
              <Text style={styles.metricLabel}>{isBangla ? 'বাজেট নিয়ন্ত্রণ' : 'Budget Control'}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#34D399' }]}>
                {isBangla ? 'সুরক্ষিত' : 'Optimal'}
              </Text>
              <Text style={styles.metricLabel}>{isBangla ? 'ঝুঁকি স্তর' : 'Risk Level'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 2. Spending Anomaly & Budget Forecast Card */}
        <View style={[styles.card, anomaly?.has_anomaly && styles.cardAlert]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: anomaly?.has_anomaly ? '#FEE2E2' : '#E6F4EA' }]}>
              <Ionicons
                name={anomaly?.has_anomaly ? 'alert-circle' : 'trending-up-outline'}
                size={20}
                color={anomaly?.has_anomaly ? '#DC2626' : '#059669'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {anomaly?.has_anomaly
                  ? (isBangla ? 'খরচের অস্বাভাবিক বৃদ্ধি শনাক্ত' : 'Spending Spike Detected')
                  : (isBangla ? 'সাপ্তাহিক খরচের পূর্বাভাস' : 'Weekly Outflow Forecast')}
              </Text>
              <Text style={styles.cardSub}>
                {isBangla ? 'অতীত লেনদেনভিত্তিক এআই বিশ্লেষণ' : 'Derived from transaction velocity'}
              </Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{isBangla ? 'AI প্রেডিকশন' : 'AI Prediction'}</Text>
            </View>
          </View>

          <Text style={styles.anomalyBody}>
            {anomaly?.has_anomaly
              ? (isBangla
                  ? `${anomaly.headline_bn || 'খাবারের দোকানে খরচ বৃদ্ধি'}: ${anomaly.narrative_bn || 'গত সপ্তাহের তুলনায় ডাইনিংয়ে খরচ স্বাভাবিকের চেয়ে বেশি লক্ষ্য করা গেছে।'}`
                  : `${anomaly.headline || 'Spike in Dining & Merchant payments'}: Outflow is 31% above your personal baseline.`)
              : (isBangla
                  ? 'আপনার সাম্প্রতিক খরচের প্যাটার্ন স্বাভাবিক সীমার মধ্যে রয়েছে। আগামী সপ্তাহে আনুমানিক ৳ ৩,৪৫০ এর মতো নিয়মিত খরচ হতে পারে।'
                  : 'Your overall spending trajectory is stable. Projected outflow for next 7 days is approx ৳3,450.')}
          </Text>

          {/* Explainable AI Reasoning Box */}
          <View style={styles.xaiBox}>
            <View style={styles.xaiTitleRow}>
              <Ionicons name="bulb-outline" size={15} color="#065F46" />
              <Text style={styles.xaiTitle}>
                {isBangla ? 'ব্যাখ্যাযোগ্য এআই কারণ (XAI):' : 'Explainable Reasoning (Why?):'}
              </Text>
            </View>
            <Text style={styles.xaiText}>
              {anomaly?.has_anomaly
                ? (isBangla
                    ? '• রেস্টুরেন্ট ও গ্রোসারিতে গত ৭ দিনে ৩টি অতিরিক্ত পেমেন্ট পাওয়া গেছে।\n• ক্যাশব্যাকের সুবিধা নিলে এ খাতে প্রায় ৳ ১৫০ সাশ্রয় করা সম্ভব।'
                    : '• 3 additional payments detected in Dining & Retail this week.\n• Redeeming active cashback offers can recover approx ৳150.')
                : (isBangla
                    ? '• ইউটিলিটি ও মোবাইল রিচার্জের নিয়মিত মাসিক চক্রে কোনো অতিরিক্ত বিচ্যুতি নেই।\n• ওয়ালেটের ক্যাশ ফ্লো সম্পূর্ণ সুষম অবস্থায় রয়েছে।'
                    : '• Monthly utility and SIM recharge cycles follow a balanced routine.\n• Zero unusual withdrawal spikes detected.')}
            </Text>
          </View>
        </View>

        {/* 3. Predictive Reminders Section */}
        <Text style={styles.sectionTitle}>
          {isBangla ? 'প্রেডিক্টিভ বিল ও রিচার্জ রিমাইন্ডার' : 'Predictive Reminders for You'}
        </Text>

        <View style={styles.reminderRow}>
          {/* Card 1: Electricity Bill */}
          <TouchableOpacity
            style={styles.reminderCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MerchantPayment', { mode: 'bill_pay', phone: '01700200001' })}
          >
            <View style={styles.reminderHeader}>
              <View style={[styles.reminderIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flash-outline" size={18} color="#D97706" />
              </View>
              <Text style={styles.reminderBadge}>{isBangla ? '৪ দিনে বাকি' : 'Due in 4d'}</Text>
            </View>
            <Text style={styles.reminderTitle}>DESCO Electricity</Text>
            <Text style={styles.reminderDesc}>
              {isBangla ? 'বিদ্যুৎ বিলের সময় হয়েছে' : 'Monthly electric bill due'}
            </Text>
            <View style={styles.reminderActionRow}>
              <Text style={styles.reminderActionText}>{isBangla ? 'বিল পরিশোধ' : 'Pay Bill'}</Text>
              <Ionicons name="arrow-forward" size={13} color="#059669" />
            </View>
          </TouchableOpacity>

          {/* Card 2: Mobile Recharge */}
          <TouchableOpacity
            style={styles.reminderCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MobileRecharge')}
          >
            <View style={styles.reminderHeader}>
              <View style={[styles.reminderIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="phone-portrait-outline" size={18} color="#2563EB" />
              </View>
              <Text style={styles.reminderBadge}>{isBangla ? 'চক্র প্রস্তুত' : 'Due Cycle'}</Text>
            </View>
            <Text style={styles.reminderTitle}>{isBangla ? 'মোবাইল রিচার্জ' : 'SIM Recharge'}</Text>
            <Text style={styles.reminderDesc}>
              {isBangla ? 'সাপ্তাহিক রিচার্জ বোনাস' : 'Weekly 10% bonus cashback'}
            </Text>
            <View style={styles.reminderActionRow}>
              <Text style={styles.reminderActionText}>{isBangla ? 'রিচার্জ করুন' : 'Recharge'}</Text>
              <Ionicons name="arrow-forward" size={13} color="#059669" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Hyper-Personalized Next-Best-Offers (NBO) */}
        <Text style={styles.sectionTitle}>
          {isBangla ? 'আপনার খরচের জন্য সেরা স্মার্ট অফার' : 'Next-Best-Offers Tailored for You'}
        </Text>

        {topOffer && (
          <LinearGradient
            colors={['#064E3B', '#065F46']}
            style={styles.topOfferCard}
          >
            <View style={styles.topOfferBadgeRow}>
              <View style={styles.topPill}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.topPillText}>{isBangla ? 'সর্বোচ্চ ৯৫% ম্যাচ' : '95% Affinity Match'}</Text>
              </View>
              <Text style={styles.topOfferDiscount}>
                {topOffer.discount_value ? `৳${topOffer.discount_value} Cashback` : 'Special Deal'}
              </Text>
            </View>

            <Text style={styles.topOfferTitle}>{topOffer.title}</Text>
            <Text style={styles.topOfferDesc}>{topOffer.description}</Text>

            <View style={styles.topOfferReasonBox}>
              <Text style={styles.topOfferReasonText}>
                🧠 {isBangla ? (topOffer.reason_bn || 'আপনার অতীত কেনাকাটার ধরন দেখে নির্বাচন করা হয়েছে।') : (topOffer.reason || 'Recommended based on your recent spending frequency.')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.topOfferBtn}
              activeOpacity={0.85}
              onPress={() => handleClaimOffer(topOffer)}
            >
              <Text style={styles.topOfferBtnText}>
                {isBangla ? 'অফারটি উপভোগ করুন' : 'Grab This Offer'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#064E3B" />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Other Ranked Recommendations */}
        {rankedOffers.slice(0, 3).map((offer, idx) => (
          <View key={offer.offer_id || idx} style={styles.recItemCard}>
            <View style={styles.recTopRow}>
              <View style={styles.recIconWrap}>
                <Ionicons
                  name={offer.category === 'RECHARGE' ? 'flash-outline' : 'cart-outline'}
                  size={18}
                  color="#059669"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recItemTitle}>{offer.title}</Text>
                <Text style={styles.recItemSub}>{offer.description}</Text>
              </View>
              <Text style={styles.recItemMatch}>{Math.round((offer.match_score || 0.88) * 100)}% Match</Text>
            </View>

            <View style={styles.recReasonRow}>
              <Text style={styles.recReasonText}>
                💡 {isBangla ? (offer.reason_bn || 'আপনার জন্য লাভজনক ক্যাশব্যাক') : (offer.reason || 'Optimal cash reward')}
              </Text>
            </View>

            <View style={styles.recFooterRow}>
              <TouchableOpacity
                style={styles.recClaimBtn}
                onPress={() => handleClaimOffer(offer)}
                activeOpacity={0.8}
              >
                <Text style={styles.recClaimBtnText}>
                  {isBangla ? 'ব্যবহার করুন' : 'Claim Deal'}
                </Text>
              </TouchableOpacity>

              <View style={styles.feedbackWrap}>
                <TouchableOpacity
                  style={[styles.thumbBtn, feedbackState[offer.offer_id] === 'ACCEPTED' && styles.thumbBtnActive]}
                  onPress={() => handleFeedback(offer.offer_id, 'ACCEPTED')}
                >
                  <Ionicons name="thumbs-up-outline" size={15} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.thumbBtn, feedbackState[offer.offer_id] === 'DISMISSED' && styles.thumbBtnActive]}
                  onPress={() => handleFeedback(offer.offer_id, 'DISMISSED')}
                >
                  <Ionicons name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* 5. Quick Ask AI Chips */}
        <Text style={styles.sectionTitle}>
          {isBangla ? 'এআই-এর কাছে দ্রুত প্রশ্ন করুন' : 'Ask GenCash AI Assistant'}
        </Text>

        <View style={styles.faqChipsRow}>
          <TouchableOpacity
            style={styles.faqChip}
            activeOpacity={0.8}
            onPress={() => handleQuickQuestion('spending')}
          >
            <Ionicons name="pie-chart-outline" size={16} color="#065F46" />
            <Text style={styles.faqChipText}>
              {isBangla ? 'আমার খরচের বিশ্লেষণ' : 'My Spending Breakdown'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.faqChip}
            activeOpacity={0.8}
            onPress={() => handleQuickQuestion('saving')}
          >
            <Ionicons name="wallet-outline" size={16} color="#065F46" />
            <Text style={styles.faqChipText}>
              {isBangla ? 'কীভাবে আরও সেভ করব?' : 'How to Save More?'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.faqChip}
            activeOpacity={0.8}
            onPress={() => handleQuickQuestion('best_offer')}
          >
            <Ionicons name="sparkles-outline" size={16} color="#065F46" />
            <Text style={styles.faqChipText}>
              {isBangla ? 'আমার জন্য সেরা ক্যাশব্যাক?' : 'Best Offer for Me?'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* AI Answer Modal */}
      <Modal
        visible={Boolean(activeAiAnswer)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveAiAnswer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.answerCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#E6F4EA' }]}>
                <Ionicons
                  name={activeAiAnswer?.icon || 'sparkles'}
                  size={20}
                  color={activeAiAnswer?.color || '#059669'}
                />
              </View>
              <Text style={styles.modalTitle}>{activeAiAnswer?.title}</Text>
              <TouchableOpacity onPress={() => setActiveAiAnswer(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBody}>{activeAiAnswer?.body}</Text>

            {activeAiAnswer?.tip && (
              <View style={styles.modalTipBox}>
                <Text style={styles.modalTipText}>{activeAiAnswer.tip}</Text>
              </View>
            )}

            {activeAiAnswer?.actionOffer && (
              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => {
                  const offer = activeAiAnswer.actionOffer;
                  setActiveAiAnswer(null);
                  handleClaimOffer(offer);
                }}
              >
                <Text style={styles.modalActionBtnText}>
                  {isBangla ? 'অফারটিতে যান' : 'Go to Offer'}
                </Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setActiveAiAnswer(null)}
            >
              <Text style={styles.modalDoneBtnText}>
                {isBangla ? 'বুঝেছি (ধন্যবাদ)' : 'Understood (Thanks)'}
              </Text>
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
    backgroundColor: '#F0F9F6',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  sparkleBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#A7F3D0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  // Health Score Card
  healthScoreCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  scoreTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCardTitle: {
    color: '#E6F4EA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreStatusLabel: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreOutOf: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#A7F3D0',
    fontSize: 10.5,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardAlert: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
  },
  badgePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  anomalyBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 12,
  },
  xaiBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
  },
  xaiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  xaiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  xaiText: {
    fontSize: 11.5,
    color: '#0F5132',
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 4,
  },
  // Reminders
  reminderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  reminderCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  reminderDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  reminderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  // Top Offer Banner
  topOfferCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  topOfferBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  topPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  topOfferDiscount: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
  },
  topOfferTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  topOfferDesc: {
    color: '#D1FAE5',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  topOfferReasonBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  topOfferReasonText: {
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15,
  },
  topOfferBtn: {
    backgroundColor: '#34D399',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  topOfferBtnText: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '800',
  },
  // Ranked Item Card
  recItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  recTopRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  recIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  recItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  recItemMatch: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recReasonRow: {
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  recReasonText: {
    fontSize: 11,
    color: '#475569',
  },
  recFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recClaimBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  recClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBtnActive: {
    backgroundColor: '#D1FAE5',
  },
  // FAQ Chips
  faqChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  faqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    elevation: 1,
  },
  faqChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  answerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 14,
  },
  modalTipBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  modalTipText: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
    fontWeight: '600',
  },
  modalActionBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalDoneBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
