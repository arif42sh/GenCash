import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const AIInsightCard = ({ insight, onExplore, onFeedback }) => {
  const [feedbackSent, setFeedbackSent] = useState(null);

  if (!insight) return null;

  const handleFeedback = (action) => {
    setFeedbackSent(action);
    if (onFeedback) {
      onFeedback(insight.id, action);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.aiTag}>
          <Ionicons name="sparkles" size={14} color="#C084FC" />
          <Text style={styles.aiTagText}>GenCash AI Intelligence</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {Math.round((insight.confidence || 0.88) * 100)}% Confidence
          </Text>
        </View>
      </View>

      <Text style={styles.predictionText}>{insight.prediction}</Text>

      <View style={styles.explanationBox}>
        <View style={styles.whyHeader}>
          <Ionicons name="bulb-outline" size={14} color={colors.warning} />
          <Text style={styles.whyTitle}>Why this insight?</Text>
        </View>
        <Text style={styles.explanationText}>{insight.explanation}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.exploreBtn}
          onPress={onExplore}
        >
          <Text style={styles.exploreBtnText}>Open AI Hub</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </TouchableOpacity>

        <View style={styles.feedbackRow}>
          <Text style={styles.feedbackLabel}>Helpful?</Text>
          <TouchableOpacity
            onPress={() => handleFeedback('HELPFUL')}
            style={[styles.feedbackBtn, feedbackSent === 'HELPFUL' && styles.feedbackActive]}
          >
            <Ionicons
              name={feedbackSent === 'HELPFUL' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={14}
              color={feedbackSent === 'HELPFUL' ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFeedback('NOT_HELPFUL')}
            style={[styles.feedbackBtn, feedbackSent === 'NOT_HELPFUL' && styles.feedbackActive]}
          >
            <Ionicons
              name={feedbackSent === 'NOT_HELPFUL' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={14}
              color={feedbackSent === 'NOT_HELPFUL' ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 111, 159, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiTagText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    letterSpacing: 0.4,
  },
  confidenceBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  predictionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 10,
  },
  explanationBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  whyTitle: {
    color: colors.textHighlight,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.aiPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginRight: 6,
  },
  feedbackBtn: {
    padding: 6,
    marginLeft: 2,
  },
  feedbackActive: {
    transform: [{ scale: 1.15 }],
  },
});
