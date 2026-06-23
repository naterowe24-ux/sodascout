import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../../constants/theme';

export default function ReviewTab(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.icon}>🥤</Text>
        <Text style={styles.heading}>Leave a SipReview</Text>
        <Text style={styles.body}>
          Find a location on the Explore tab, open its detail page, and tap{' '}
          <Text style={styles.cta}>+ Leave a SipReview</Text> to rate your fountain soda.
        </Text>
      </View>
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
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 52,
  },
  heading: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    fontFamily: fonts.body.medium,
    color: colors.teal,
  },
});
