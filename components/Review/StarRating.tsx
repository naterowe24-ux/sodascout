import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../constants/theme';

interface StarRatingProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
  skipped?: boolean;
  onSkip?: () => void;
}

export function StarRating({
  label,
  value,
  onChange,
  required = false,
  skipped = false,
  onSkip,
}: StarRatingProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label}>{label}</Text>
        {!required && (
          <View style={styles.optBadge}>
            <Text style={styles.optBadgeText}>Optional</Text>
          </View>
        )}
      </View>

      <View style={styles.rightCol}>
        {skipped ? (
          <TouchableOpacity onPress={onSkip} style={styles.skippedPill} activeOpacity={0.7}>
            <Text style={styles.skippedText}>Skipped  ✕</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.stars}>
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => onChange(star)}
                  hitSlop={8}
                  activeOpacity={0.6}
                >
                  <Text style={value !== null && star <= value ? styles.starFilled : styles.starEmpty}>
                    {value !== null && star <= value ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!required && onSkip && (
              <TouchableOpacity onPress={onSkip} hitSlop={8} activeOpacity={0.7}>
                <Text style={styles.skipLink}>Skip</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 6,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#1A1A1A',
  },
  optBadge: {
    backgroundColor: colors.gray,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  optBadgeText: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.grayMid,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  starFilled: {
    fontSize: 24,
    color: colors.amber,
    lineHeight: 28,
  },
  starEmpty: {
    fontSize: 24,
    color: colors.grayLight,
    lineHeight: 28,
  },
  skipLink: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
    textDecorationLine: 'underline',
  },
  skippedPill: {
    backgroundColor: colors.gray,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  skippedText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
  },
});
