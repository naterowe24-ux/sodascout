import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, fonts } from '../../constants/theme';

export function DetectingScreen(): React.JSX.Element {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    function pulse(anim: Animated.Value, delay: number): void {
      anim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    pulse(ring1, 0);
    pulse(ring2, 600);
  }, [ring1, ring2]);

  const ringStyle = (anim: Animated.Value): object => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.2] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 0.2, 0] }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.ring, ringStyle(ring1)]} />
        <Animated.View style={[styles.ring, ringStyle(ring2)]} />
        <View style={styles.dot}>
          <Text style={styles.dotIcon}>📍</Text>
        </View>
      </View>
      <Text style={styles.title}>Detecting Location</Text>
      <Text style={styles.sub}>Finding the best soda near you…</Text>
    </View>
  );
}

const DOT = 64;
const RING = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray,
    gap: 20,
  },
  pulseWrap: {
    width: RING,
    height: RING,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderColor: colors.teal,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotIcon: {
    fontSize: 28,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: '#1A1A1A',
  },
  sub: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
  },
});
