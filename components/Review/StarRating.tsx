import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
}

export function StarRating({
  value,
  onChange,
  size = 'md',
}: StarRatingProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <Text style={[
            size === 'md' ? styles.starMd : styles.starSm,
            value !== null && star <= value ? styles.filled : styles.empty,
          ]}>
            {value !== null && star <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  starMd: {
    fontSize: 28,
    lineHeight: 33,
  },
  starSm: {
    fontSize: 22,
    lineHeight: 26,
  },
  filled: {
    color: colors.amber,
  },
  empty: {
    color: colors.grayLight,
  },
});
