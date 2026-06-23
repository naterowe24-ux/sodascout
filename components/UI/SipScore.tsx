import { View, Text, StyleSheet } from 'react-native';
import { formatSipScore, sipScoreColor } from '../../lib/sipscore';
import { fonts } from '../../constants/theme';

interface SipScoreProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export function SipScoreDisplay({ score, size = 'md' }: SipScoreProps): React.JSX.Element {
  const color = sipScoreColor(score);
  const fontSize = size === 'lg' ? 48 : size === 'md' ? 32 : 20;

  return (
    <View style={styles.container}>
      <Text style={[styles.number, { color, fontSize }]}>{formatSipScore(score)}</Text>
      <Text style={styles.label}>SIPSCORE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  number: { fontFamily: fonts.display.extraBold, lineHeight: undefined },
  label: {
    fontFamily: fonts.body.regular,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
