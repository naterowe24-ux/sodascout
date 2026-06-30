import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { SignInSheet } from '../../components/Auth/SignInSheet';
import { LocationCard } from '../../components/Location/LocationCard';
import { useAuth } from '../../hooks/useAuth';
import { useSavedLocations } from '../../hooks/useSavedLocations';
import { signOut, displayName, avatarInitial } from '../../lib/auth';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import type { Location } from '../../types';

export default function SavedScreen(): React.JSX.Element {
  const { user, loading } = useAuth();
  const { savedLocations, loading: savedLoading, refetch } = useSavedLocations();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => { refetch(); }, [refetch]),
  );

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {user ? (
        /* ── Signed-in ─────────────────────────────────────────────────── */
        <View style={styles.signedIn}>
          {/* Heading + profile card */}
          <View style={styles.topSection}>
            <Text style={styles.heading}>Saved</Text>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial(user)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName(user)}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>
          </View>

          {/* List / loading / empty state */}
          {savedLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.teal} />
            </View>
          ) : savedLocations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>♡</Text>
              <Text style={styles.emptyTitle}>No saved spots yet</Text>
              <Text style={styles.emptySub}>
                Tap ♥ on any location to save it here.
              </Text>
            </View>
          ) : (
            <FlatList<Location>
              data={savedLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <LocationCard location={item} />}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Sign out */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            disabled={signingOut}
            activeOpacity={0.7}
          >
            {signingOut
              ? <ActivityIndicator color={colors.redDark} size="small" />
              : <Text style={styles.signOutText}>Sign Out</Text>
            }
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Signed-out ────────────────────────────────────────────────── */
        <View style={styles.signedOut}>
          <Text style={styles.heading}>Saved</Text>

          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>Save Your Favourites</Text>
            <Text style={styles.emptySub}>
              Sign in to bookmark locations and keep your SipReviews across devices.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => setShowSignIn(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            You can always browse and review as a guest.
          </Text>
        </View>
      )}

      <SignInSheet
        visible={showSignIn}
        onDismiss={() => setShowSignIn(false)}
        onSuccess={() => setShowSignIn(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Signed-in layout
  signedIn: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  heading: {
    fontFamily: fonts.display.extraBold,
    fontSize: 26,
    color: '#1A1A1A',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: '#1A1A1A',
  },
  profileEmail: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  // Empty state (shared)
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 52,
    color: colors.grayMid,
  },
  emptyTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 21,
  },

  // Sign out
  signOutBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.redDark,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.redDark,
  },

  // Signed-out layout
  signedOut: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  signInBtn: {
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signInBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  guestNote: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
});
