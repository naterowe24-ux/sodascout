import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../constants/theme';

export default function TopSipsScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Sips</Text>
      <Text style={styles.subtitle}>Ranked locations — coming in step 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 28,
    color: colors.teal,
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    marginTop: 8,
  },
});
