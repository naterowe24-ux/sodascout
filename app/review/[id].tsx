import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarRating } from '../../components/Review/StarRating';
import { SignInSheet } from '../../components/Auth/SignInSheet';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { displayName } from '../../lib/auth';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import type { SodaType } from '../../types';

// ── Soda options ──────────────────────────────────────────────────────────────

interface SodaOption {
  value: SodaType;
  label: string;
  color: string;
}

const SODA_OPTIONS: SodaOption[] = [
  { value: 'diet_coke',  label: 'Diet Coke',  color: '#E24B4A' },
  { value: 'coke_zero',  label: 'Coke Zero',  color: '#2A2A2A' },
  { value: 'diet_pepsi', label: 'Diet Pepsi', color: '#185FA5' },
  { value: 'sprite',     label: 'Sprite',     color: '#3B6D11' },
  { value: 'dr_pepper',  label: 'Dr Pepper',  color: '#7A2020' },
  { value: 'other',      label: 'Other',      color: '#5F5E5A' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);

  // Form
  const [sodaType, setSodaType] = useState<SodaType | null>(null);
  const [crispiness, setCrispiness] = useState<number | null>(null);
  const [flavor, setFlavor]         = useState<number | null>(null);
  const [ice, setIce]               = useState<number | null>(null);
  const [cup, setCup]               = useState<number | null>(null);
  const [scoreValue, setScoreValue] = useState<number | null>(null);
  const [drivethu, setDrivethu]     = useState<number | null>(null);
  const [lime, setLime]             = useState<number | null>(null);
  const [note, setNote]             = useState('');

  // Skipped flags (null score ≠ explicitly skipped on initial load)
  const [iceSkipped, setIceSkipped]         = useState(false);
  const [cupSkipped, setCupSkipped]         = useState(false);
  const [valueSkipped, setValueSkipped]     = useState(false);
  const [drivSkipped, setDrivSkipped]       = useState(false);
  const [limeSkipped, setLimeSkipped]       = useState(false);

  // Submit
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!submitted) return;
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [submitted]);

  // ── Load location name ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('locations')
      .select('name')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setLocationName(data?.name ?? '');
        setLocationLoading(false);
      });
  }, [id]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const canSubmit = sodaType !== null && crispiness !== null && flavor !== null;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('reviews').insert({
      location_id: id,
      user_id: user?.id ?? null,
      soda_type: sodaType!,
      score_crispiness: crispiness!,
      score_flavor: flavor!,
      score_ice:      iceSkipped   ? null : ice,
      score_cup:      cupSkipped   ? null : cup,
      score_value:    valueSkipped ? null : scoreValue,
      score_drivethu: drivSkipped  ? null : drivethu,
      score_lime:     limeSkipped  ? null : lime,
      note: note.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Animated.View style={[styles.successWrap, { opacity: successOpacity }]}>
            <Animated.View
              style={[styles.successCircle, { transform: [{ scale: successScale }] }]}
            >
              <Text style={styles.successCheck}>✓</Text>
            </Animated.View>
            <Text style={styles.successTitle}>SipReview Submitted!</Text>
            <Text style={styles.successSub}>
              Thanks for helping the soda community.{'\n'}
              Your review will update the SipScore shortly.
            </Text>
            <TouchableOpacity style={styles.successBtn} activeOpacity={0.8} onPress={() => router.back()}>
              <Text style={styles.successBtnText}>Back to Location</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle} numberOfLines={1}>
              {locationLoading ? 'SipReview' : locationName}
            </Text>
            {user ? (
              <Text style={styles.navSub}>{displayName(user)}</Text>
            ) : (
              <TouchableOpacity onPress={() => setShowSignIn(true)}>
                <Text style={styles.navSignIn}>Sign in</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Soda type ──────────────────────────────────────────────── */}
            <Card>
              <CardHeader label="What are you rating?" badge="Required" badgeColor={colors.red} />
              <View style={styles.chipGrid}>
                {SODA_OPTIONS.map((opt) => {
                  const active = sodaType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.sodaChip,
                        active
                          ? { backgroundColor: opt.color, borderColor: opt.color }
                          : styles.sodaChipOff,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => setSodaType(opt.value)}
                    >
                      <Text style={[styles.sodaChipText, active && styles.sodaChipTextOn]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* ── Core ratings ───────────────────────────────────────────── */}
            <Card>
              <CardHeader label="Core Ratings" badge="Required" badgeColor={colors.red} />
              <StarRating
                label="Crispiness"
                value={crispiness}
                onChange={setCrispiness}
                required
              />
              <Divider />
              <StarRating
                label="Flavor"
                value={flavor}
                onChange={setFlavor}
                required
              />
            </Card>

            {/* ── Optional ratings ───────────────────────────────────────── */}
            <Card>
              <CardHeader label="Optional Ratings" hint="Skip any that don't apply" />
              <StarRating
                label="Ice"
                value={iceSkipped ? null : ice}
                onChange={(v) => { setIceSkipped(false); setIce(v); }}
                skipped={iceSkipped}
                onSkip={() => { setIceSkipped((s) => !s); setIce(null); }}
              />
              <Divider />
              <StarRating
                label="Cup"
                value={cupSkipped ? null : cup}
                onChange={(v) => { setCupSkipped(false); setCup(v); }}
                skipped={cupSkipped}
                onSkip={() => { setCupSkipped((s) => !s); setCup(null); }}
              />
              <Divider />
              <StarRating
                label="Value"
                value={valueSkipped ? null : scoreValue}
                onChange={(v) => { setValueSkipped(false); setScoreValue(v); }}
                skipped={valueSkipped}
                onSkip={() => { setValueSkipped((s) => !s); setScoreValue(null); }}
              />
              <Divider />
              <StarRating
                label="Drive-Thru"
                value={drivSkipped ? null : drivethu}
                onChange={(v) => { setDrivSkipped(false); setDrivethu(v); }}
                skipped={drivSkipped}
                onSkip={() => { setDrivSkipped((s) => !s); setDrivethu(null); }}
              />
              <Divider />
              <StarRating
                label="Lime"
                value={limeSkipped ? null : lime}
                onChange={(v) => { setLimeSkipped(false); setLime(v); }}
                skipped={limeSkipped}
                onSkip={() => { setLimeSkipped((s) => !s); setLime(null); }}
              />
            </Card>

            {/* ── Note ───────────────────────────────────────────────────── */}
            <Card>
              <CardHeader label="Note" hint="Optional" />
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Secret menu? Best time to go? Share it."
                placeholderTextColor={colors.grayLight}
                multiline
                maxLength={280}
                returnKeyType="done"
              />
              <Text style={styles.charCount}>{note.length}/280</Text>
            </Card>

            {submitError ? (
              <Text style={styles.errorText}>{submitError}</Text>
            ) : null}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ── Sticky submit ──────────────────────────────────────────────── */}
          <View style={styles.submitBar}>
            {!canSubmit && (
              <Text style={styles.submitHint}>
                Select a soda and rate Crispiness + Flavor to submit
              </Text>
            )}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnOff]}
              activeOpacity={canSubmit ? 0.8 : 1}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.submitBtnText}>Submit SipReview</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <SignInSheet
          visible={showSignIn}
          onDismiss={() => setShowSignIn(false)}
          onSuccess={() => setShowSignIn(false)}
        />
      </SafeAreaView>
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <View style={cardStyles.card}>{children}</View>;
}

function CardHeader({
  label,
  hint,
  badge,
  badgeColor,
}: {
  label: string;
  hint?: string;
  badge?: string;
  badgeColor?: string;
}): React.JSX.Element {
  return (
    <View style={cardStyles.header}>
      <Text style={cardStyles.headerLabel}>{label}</Text>
      {badge && badgeColor ? (
        <Text style={[cardStyles.badge, { color: badgeColor }]}>{badge}</Text>
      ) : hint ? (
        <Text style={cardStyles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function Divider(): React.JSX.Element {
  return <View style={cardStyles.divider} />;
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray,
    marginBottom: spacing.sm,
  },
  headerLabel: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#1A1A1A',
    flex: 1,
  },
  badge: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grayLight,
    marginVertical: 2,
  },
});

// ── Main styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.gray,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
  },
  closeBtn: { width: 36, padding: 4 },
  closeBtnText: {
    fontFamily: fonts.body.medium,
    fontSize: 16,
    color: colors.grayMid,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  navTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  navSub: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.grayMid,
  },
  navSignIn: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.teal,
    textDecorationLine: 'underline',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: spacing.md,
  },
  sodaChip: {
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  sodaChipOff: {
    backgroundColor: colors.gray,
    borderColor: colors.grayLight,
  },
  sodaChipText: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  sodaChipTextOn: {
    color: '#FFFFFF',
  },

  noteInput: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  charCount: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.grayLight,
    textAlign: 'right',
    paddingBottom: spacing.sm,
    marginTop: 4,
  },

  submitBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grayLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 12,
    gap: 6,
  },
  submitHint: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.grayMid,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnOff: {
    backgroundColor: colors.grayLight,
  },
  submitBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.redDark,
    textAlign: 'center',
  },

  // Success
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successCheck: {
    fontSize: 32,
    color: colors.teal,
  },
  successTitle: {
    fontFamily: fonts.display.extraBold,
    fontSize: 24,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  successSub: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 21,
  },
  successBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  successBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
