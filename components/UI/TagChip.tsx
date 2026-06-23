import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../constants/theme';

interface TagChipProps {
  label: string;
  active?: boolean;
}

export function TagChip({ label, active = false }: TagChipProps): React.JSX.Element {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  chipActive: {
    backgroundColor: colors.tealLight,
    borderColor: colors.teal,
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  labelActive: {
    color: colors.teal,
  },
});
