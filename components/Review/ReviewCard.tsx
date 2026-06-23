import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { computeReviewScore, formatSipScore, sipScoreColor } from '../../lib/sipscore';
import type { SipReview, SodaType } from '../../types';

const SODA_LABEL: Record<SodaType, string> = {
  diet_coke:  'Diet Coke',
  coke_zero:  'Coke Zero',
  diet_pepsi: 'Diet Pepsi',
  sprite:     'Sprite',
  dr_pepper:  'Dr Pepper',
  other:      'Other',
};

const SODA_COLOR: Record<SodaType, string> = {
  diet_coke:  '#E24B4A',
  coke_zero:  '#2A2A2A',
  diet_pepsi: '#185FA5',
  sprite:     '#3B6D11',
  dr_pepper:  '#7A2020',
  other:      '#5F5E5A',
};

function starString(n: number | null): string {
  if (n === null) return '';
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ReviewCardProps {
  review: SipReview;
}

export function ReviewCard({ review }: ReviewCardProps): React.JSX.Element {
  const score = computeReviewScore(review);
  const scoreColor = sipScoreColor(score);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.user_id ? 'U' : 'G'}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.reviewer}>{review.user_id ? 'Member' : 'Guest'}</Text>
          <Text style={styles.date}>{formatDate(review.created_at)}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Soda type badge */}
          <View style={[styles.sodaBadge, { backgroundColor: SODA_COLOR[review.soda_type] }]}>
            <Text style={styles.sodaText}>{SODA_LABEL[review.soda_type]}</Text>
          </View>
          {/* Review score */}
          <Text style={[styles.reviewScore, { color: scoreColor }]}>{formatSipScore(score)}</Text>
        </View>
      </View>

      {/* Core scores */}
      <View style={styles.scoresRow}>
        <ScoreItem label="Crispiness" stars={review.score_crispiness} />
        <ScoreItem label="Flavor" stars={review.score_flavor} />
        {review.score_ice     !== null && <ScoreItem label="Ice"       stars={review.score_ice} />}
        {review.score_cup     !== null && <ScoreItem label="Cup"       stars={review.score_cup} />}
        {review.score_value   !== null && <ScoreItem label="Value"     stars={review.score_value} />}
        {review.score_drivethu !== null && <ScoreItem label="Drive-Thru" stars={review.score_drivethu} />}
        {review.score_lime    !== null && <ScoreItem label="Lime"      stars={review.score_lime} />}
      </View>

      {/* Note */}
      {review.note ? (
        <Text style={styles.note}>"{review.note}"</Text>
      ) : null}
    </View>
  );
}

function ScoreItem({ label, stars }: { label: string; stars: number }): React.JSX.Element {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.stars}>{starString(stars)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    color: colors.grayMid,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  reviewer: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: '#1A1A1A',
  },
  date: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.grayMid,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sodaBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sodaText: {
    fontFamily: fonts.body.medium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  reviewScore: {
    fontFamily: fonts.display.extraBold,
    fontSize: 18,
  },
  scoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreItem: {
    gap: 1,
  },
  scoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.grayMid,
  },
  stars: {
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 1,
  },
  note: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
    lineHeight: 19,
    fontStyle: 'italic',
    borderLeftWidth: 3,
    borderLeftColor: colors.grayLight,
    paddingLeft: 10,
  },
});
