import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { api } from '../services/api';

export const AIHubScreen = ({ navigation }) => {
  const [intelligence, setIntelligence] = useState(null);
  const [insightsList, setInsightsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackState, setFeedbackState] = useState({});

  const loadAIIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const recData = await api.getAIRecommendations();
      setIntelligence(recData);

      const insData = await api.getAIInsights();
      setInsightsList(insData || []);
    } catch (e) {
      console.warn('AI Intelligence fetch error:', e);
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

  const handleFeedback = async (insightId, action) => {
    setFeedbackState((prev) => ({ ...prev, [insightId]: action }));
    try {
      await api.submitAIFeedback(insightId, action);
      Alert.alert('Feedback Recorded', 'Your input improves the precision of future recommendations.');
    } catch (e) {}
  };

  const handleAction = (item) => {
    if (item.action_type === 'NAVIGATE_RECHARGE') {
      navigation.navigate('MobileRecharge');
    } else if (item.action_type === 'NAVIGATE_OFFER') {
      Alert.alert(item.title, item.description);
    } else {
      Alert.alert('AI Action', `${item.title}: Action applied to your account.`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={24} color="#C084FC" />
          <Text style={styles.headerTitle}>AI Intelligence Hub</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Explainable, Machine-Assisted Financial Intelligence
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A855F7"
          />
        }
      >
        {/* Architecture Blueprint Callout Banner */}
        <View style={styles.architectureBanner}>
          <View style={styles.flowRow}>
            <View style={styles.flowNode}>
              <Text style={styles.flowNodeText}>INPUT</Text>
              <Text style={styles.flowNodeSub}>Txn Data</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#A855F7" />
            <View style={[styles.flowNode, styles.flowNodeActive]}>
              <Text style={[styles.flowNodeText, { color: '#C084FC' }]}>INTELLIGENCE</Text>
              <Text style={styles.flowNodeSub}>AI Pipeline</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#A855F7" />
            <View style={styles.flowNode}>
              <Text style={styles.flowNodeText}>ACTION</Text>
              <Text style={styles.flowNodeSub}>Outcome</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Financial Spending Forecast */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up-outline" size={20} color={colors.textHighlight} />
            <Text style={styles.cardTitle}>Spending Trend & Forecast</Text>
          </View>
          <Text style={styles.forecastNumber}>৳ 4,250.00</Text>
          <Text style={styles.forecastLabel}>Projected Outflow for This Week</Text>

          <View style={styles.whyBox}>
            <Text style={styles.whyTitle}>🧠 Explainable AI Reasoning (Why?):</Text>
            <Text style={styles.whyText}>
              • Dining and merchant payments increased 31% above baseline.{"\n"}
              • Recurring Friday mobile recharge predicted in 3 days.{"\n"}
              • Low response fatigue detected; eligible for 10% cashback promo.
            </Text>
          </View>
        </View>

        {/* Section 2: AI Recommendations (Next-Best Actions) */}
        <Text style={styles.sectionHeader}>Smart Recommendations for You</Text>
        {intelligence?.recommendations?.map((rec) => (
          <View key={rec.id} style={styles.recCard}>
            <View style={styles.recTop}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{rec.category}</Text>
              </View>
              <Text style={styles.recConfidence}>
                {Math.round(rec.confidence * 100)}% Match
              </Text>
            </View>

            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recDesc}>{rec.description}</Text>

            <View style={styles.recReasonBox}>
              <Text style={styles.recReasonText}>💡 {rec.reason}</Text>
            </View>

            <View style={styles.recFooter}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(rec)}
              >
                <Text style={styles.actionButtonText}>Take Action</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>

              <View style={styles.feedbackRow}>
                <TouchableOpacity
                  style={[
                    styles.thumbBtn,
                    feedbackState[rec.id] === 'ACCEPTED' && styles.thumbActive,
                  ]}
                  onPress={() => handleFeedback(rec.id, 'ACCEPTED')}
                >
                  <Ionicons name="thumbs-up-outline" size={16} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.thumbBtn,
                    feedbackState[rec.id] === 'DISMISSED' && styles.thumbActive,
                  ]}
                  onPress={() => handleFeedback(rec.id, 'DISMISSED')}
                >
                  <Ionicons name="thumbs-down-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Section 3: Historical AI Insights Log */}
        <Text style={styles.sectionHeader}>All Generated Insights</Text>
        {insightsList.map((ins) => (
          <View key={ins.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyType}>{ins.insight_type}</Text>
              <Text style={styles.historyModel}>{ins.model_version}</Text>
            </View>
            <Text style={styles.historyPrediction}>{ins.prediction}</Text>
            <Text style={styles.historyExplanation}>{ins.explanation}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  architectureBanner: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.aiBorder,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  flowNode: {
    alignItems: 'center',
  },
  flowNodeActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  flowNodeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  flowNodeSub: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textHighlight,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  forecastNumber: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
  },
  forecastLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  whyBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.aiPrimary,
  },
  whyTitle: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  whyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 12,
  },
  recCard: {
    backgroundColor: '#151D33',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  recTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    color: colors.textHighlight,
    fontSize: 10,
    fontWeight: '800',
  },
  recConfidence: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  recTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  recDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  recReasonBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  recReasonText: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 15,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thumbActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyType: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '700',
  },
  historyModel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  historyPrediction: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyExplanation: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
