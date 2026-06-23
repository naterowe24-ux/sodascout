import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, fonts, spacing, radius } from '../../constants/theme';
import { sipScoreColor, formatSipScore } from '../../lib/sipscore';
import type { CategoryAverage } from '../../hooks/useLocationDetail';

interface ScoreBreakdownProps {
  averages: CategoryAverage[];
  inAppCount: number;
  googleRating: number | null;
  googleCount: number;
}

export function ScoreBreakdown({
  averages,
  inAppCount,
  googleRating,
  googleCount,
}: ScoreBreakdownProps): React.JSX.Element {
  const hasEnoughReviews = inAppCount >= 3;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Score Breakdown</Text>

      {/* Attribution line */}
      <Text style={styles.attribution}>
        {hasEnoughReviews
          ? `${inAppCount} in-app`
          : 'Limited in-app reviews'}
        {googleRating !== null
          ? `  ·  ${googleRating.toFixed(1)} ★ Google  ·  ${googleCount.toLocaleString()} reviews`
          : ''}
      </Text>

      {!hasEnoughReviews && (
        <View style={styles.limitedBanner}>
          <Text style={styles.limitedText}>
            Score based on Google data only — 3 in-app reviews needed to activate blended SipScore
          </Text>
        </View>
      )}

      {/* Category bars */}
      <View style={styles.bars}>
        {averages.map((avg) => (
          <ScoreBar key={avg.key} average={avg} />
        ))}
      </View>
    </View>
  );
}

function ScoreBar({ average }: { average: CategoryAverage }): React.JSX.Element {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: average.score ?? 0,
      duration: 650,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [average.score]);

  const barColor = average.score !== null ? sipScoreColor(average.score) : colors.grayLight;
  const widthPct = animWidth.interpolate({ inputRange: [0, 10], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.barRow}>
      {/* Labels */}
      <View style={styles.barLabelCol}>
        <Text style={styles.barLabel}>{average.label}</Text>
        <View style={[styles.coreBadge, average.isCore ? styles.coreBadgeActive : styles.optBadge]}>
          <Text style={[styles.coreBadgeText, average.isCore ? styles.coreBadgeTextActive : styles.optBadgeText]}>
            {average.isCore ? 'Core' : 'Optional'}
          </Text>
        </View>
      </View>

      {/* Bar track */}
      <View style={styles.barTrack}>
        {average.score !== null ? (
          <Animated.View style={[styles.barFill, { width: widthPct, backgroundColor: barColor }]} />
        ) : (
          <View style={styles.barNoData} />
        )}
      </View>

      {/* Score */}
      <Text style={[styles.barScore, { color: barColor }]}>
        {average.score !== null ? formatSipScore(average.score) : '—'}
      </Text>

      {/* Count */}
      {!average.isCore && average.count > 0 && (
        <Text style={styles.barCount}>({average.count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  heading: {
    fontFamily: fonts.display.bold,
    fontSize: 17,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  attribution: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
    marginBottom: spacing.sm,
  },
  limitedBanner: {
    backgroundColor: colors.amberLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  limitedText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.amberDark,
    lineHeight: 17,
  },
  bars: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabelCol: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  barLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: '#1A1A1A',
  },
  coreBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  coreBadgeActive: {
    backgroundColor: colors.tealLight,
  },
  optBadge: {
    backgroundColor: colors.gray,
  },
  coreBadgeText: {
    fontSize: 9,
    fontFamily: fonts.body.medium,
  },
  coreBadgeTextActive: {
    color: colors.teal,
  },
  optBadgeText: {
    color: colors.grayMid,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  barNoData: {
    width: '30%',
    height: '100%',
    backgroundColor: colors.grayLight,
    borderRadius: radius.full,
    opacity: 0.4,
  },
  barScore: {
    fontFamily: fonts.display.bold,
    fontSize: 13,
    width: 28,
    textAlign: 'right',
  },
  barCount: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.grayMid,
    width: 24,
  },
});
