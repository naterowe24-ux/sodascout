import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationDetail } from '../../hooks/useLocationDetail';
import { ScoreBreakdown } from '../../components/Location/ScoreBreakdown';
import { WhatYouGet } from '../../components/Location/WhatYouGet';
import { ReviewCard } from '../../components/Review/ReviewCard';
import { SipScoreDisplay } from '../../components/UI/SipScore';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { formatDistance } from '../../lib/maps';
import { sipScoreLabel } from '../../lib/sipscore';
import type { LocationType } from '../../types';

const TYPE_LABEL: Record<LocationType, string> = {
  gas_station: '⛽ Gas Station',
  fast_food:   '🍔 Fast Food',
  soda_shop:   '🥤 Soda Shop',
};

export default function LocationDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { location, reviews, categoryAverages, distanceKm, loading, error, refresh } =
    useLocationDetail(id);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centreScreen} edges={['top', 'bottom']}>
          <ActivityIndicator color={colors.teal} size="large" />
        </SafeAreaView>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !location) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centreScreen} edges={['top', 'bottom']}>
          <Text style={styles.errorText}>Couldn't load this location</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const isTopRated = (location.sip_score ?? 0) >= 9.0 && reviews.length >= 5;
  const inAppCount = reviews.length;

  async function handleShare(): Promise<void> {
    await Share.share({
      message: `${location!.name} has a SipScore of ${location!.sip_score?.toFixed(1) ?? '—'} on SodaScout! ${location!.address ?? ''}`,
      title: `${location!.name} on SodaScout`,
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* ── Custom nav bar ──────────────────────────────────────────────── */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} hitSlop={12}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <View style={styles.hero}>
            {isTopRated && (
              <View style={styles.topBadge}>
                <Text style={styles.topBadgeText}>⭐ Top Rated</Text>
              </View>
            )}

            <View style={styles.heroMain}>
              <View style={styles.heroText}>
                <Text style={styles.heroName}>{location.name}</Text>
                <Text style={styles.heroType}>{TYPE_LABEL[location.type]}</Text>
                {distanceKm !== null && (
                  <Text style={styles.heroDist}>{formatDistance(distanceKm)} away</Text>
                )}
                {location.address ? (
                  <Text style={styles.heroAddr} numberOfLines={2}>{location.address}</Text>
                ) : null}
              </View>

              <View style={styles.heroScore}>
                <SipScoreDisplay score={location.sip_score} size="lg" />
                {location.sip_score !== null && (
                  <Text style={styles.heroScoreLabel}>{sipScoreLabel(location.sip_score)}</Text>
                )}
              </View>
            </View>

            {/* Quick-info chips */}
            <View style={styles.chips}>
              {location.has_pebbled_ice && <InfoChip label="❄ Pebble Ice" />}
              {location.has_foam_cup    && <InfoChip label="☕ Foam Cup" />}
              {location.has_lime        && <InfoChip label="🌿 Lime" />}
              {location.has_drive_thru  && <InfoChip label="🚗 Drive-Thru" />}
              {location.price_range     && <InfoChip label={location.price_range} />}
            </View>
          </View>

          {/* ── Score breakdown ───────────────────────────────────────────── */}
          <ScoreBreakdown
            averages={categoryAverages}
            inAppCount={inAppCount}
            googleRating={location.google_rating}
            googleCount={location.google_review_count}
          />

          {/* ── What You're Getting ───────────────────────────────────────── */}
          <WhatYouGet location={location} averages={categoryAverages} />

          {/* ── Reviews ───────────────────────────────────────────────────── */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionHeading}>
              Recent SipReviews
              {inAppCount > 0 && (
                <Text style={styles.reviewCount}>  {inAppCount}</Text>
              )}
            </Text>

            {reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Text style={styles.noReviewsText}>
                  No reviews yet — be the first to leave a SipReview!
                </Text>
              </View>
            ) : (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </View>

          {/* Bottom padding for the CTA bar */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* ── Sticky CTA bar ────────────────────────────────────────────── */}
        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={styles.reviewBtn}
            activeOpacity={0.8}
            onPress={() => router.push(`/review/${id}`)}
          >
            <Text style={styles.reviewBtnText}>+ Leave a SipReview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7}>
            <Text style={styles.saveBtnIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

function InfoChip({ label }: { label: string }): React.JSX.Element {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  centreScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.gray,
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.redDark,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
  },
  retryBtnText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  backLink: { marginTop: 4 },
  backLinkText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.teal,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
  },
  backBtn: { padding: 4 },
  backBtnText: {
    fontFamily: fonts.body.medium,
    fontSize: 16,
    color: colors.teal,
  },
  shareBtn: { padding: 4 },
  shareBtnText: {
    fontFamily: fonts.body.medium,
    fontSize: 15,
    color: colors.teal,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.md },

  // Hero
  hero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  topBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amberLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topBadgeText: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.amberDark,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontFamily: fonts.display.extraBold,
    fontSize: 22,
    color: '#1A1A1A',
    lineHeight: 27,
  },
  heroType: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  heroDist: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
  },
  heroAddr: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayLight,
    lineHeight: 17,
    marginTop: 2,
  },
  heroScore: {
    alignItems: 'center',
    gap: 4,
  },
  heroScoreLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.grayMid,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.gray,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  chipText: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.grayMid,
  },

  // Reviews section
  reviewsSection: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontFamily: fonts.display.bold,
    fontSize: 17,
    color: '#1A1A1A',
    marginHorizontal: spacing.md,
    marginBottom: 4,
  },
  reviewCount: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
  },
  noReviews: {
    marginHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  noReviewsText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 20,
  },

  // CTA bar
  ctaBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grayLight,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 12,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reviewBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  saveBtn: {
    width: 48,
    backgroundColor: colors.gray,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  saveBtnIcon: {
    fontSize: 20,
  },
});
