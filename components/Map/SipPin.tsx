import { View, Text, StyleSheet } from 'react-native';
import { sipScoreColor, formatSipScore } from '../../lib/sipscore';
import { fonts } from '../../constants/theme';

interface SipPinProps {
  score: number | null;
  selected?: boolean;
}

export function SipPin({ score, selected = false }: SipPinProps): React.JSX.Element {
  const bg = sipScoreColor(score);
  return (
    <View style={[styles.wrapper, selected && styles.wrapperSelected]}>
      <View style={[styles.bubble, { backgroundColor: bg }, selected && styles.bubbleSelected]}>
        <Text style={styles.score}>{formatSipScore(score)}</Text>
      </View>
      <View style={[styles.tail, { borderTopColor: bg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wrapperSelected: {
    transform: [{ scale: 1.18 }],
  },
  bubble: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    minWidth: 42,
    alignItems: 'center',
  },
  bubbleSelected: {
    shadowOpacity: 0.4,
    elevation: 8,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fonts.display.bold,
    letterSpacing: 0.2,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
