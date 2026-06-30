import { useState, Platform } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, Pressable,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { colors, fonts, radius, spacing } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

interface SignInSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export function SignInSheet({ visible, onDismiss, onSuccess }: SignInSheetProps): React.JSX.Element {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle(): Promise<void> {
    setLoading('google');
    setError(null);
    try {
      const redirectUri = makeRedirectUri({ scheme: 'sodascout', path: 'auth/callback' });
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (oauthError || !data.url) throw oauthError ?? new Error('No OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'success') {
        // Auth state listener in useAuth() picks up the session automatically
        onSuccess();
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleApple(): Promise<void> {
    setLoading('apple');
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identity token');

      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (authError) throw authError;
      onSuccess();
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code !== 'ERR_REQUEST_CANCELED') {
        setError('Apple sign-in failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Sign in to SodaScout</Text>
          <Text style={styles.sub}>
            Save your reviews and bookmark your favourite spots.
            {'\n'}Your data is never sold.
          </Text>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple — iOS only */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleApple}
              disabled={loading !== null}
              activeOpacity={0.8}
            >
              {loading === 'apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.appleIcon}></Text>
                  <Text style={styles.appleText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Guest fallback */}
          <TouchableOpacity onPress={onDismiss} style={styles.guestBtn} activeOpacity={0.7}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By signing in you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display.extraBold,
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 21,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.grayLight,
  },
  googleIcon: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: '#4285F4',
  },
  googleText: {
    fontFamily: fonts.body.medium,
    fontSize: 15,
    color: '#1A1A1A',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: '#000000',
  },
  appleIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  appleText: {
    fontFamily: fonts.body.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  guestBtn: {
    paddingVertical: 10,
  },
  guestText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.teal,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.redDark,
    textAlign: 'center',
  },
  legal: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.grayLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
