import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { SipScoreDisplay } from '../UI/SipScore';
import { formatDistance } from '../../lib/maps';
import type { LocationWithDistance, LocationType } from '../../types';

const SHEET_HEIGHT = 200;

const TYPE_LABEL: Record<LocationType, string> = {
  gas_station: '⛽ Gas Station',
  fast_food:   '🍔 Fast Food',
  soda_shop:   '🥤 Soda Shop',
};

interface LocationPreviewSheetProps {
  location: LocationWithDistance | null;
  onClose: () => void;
}

export function LocationPreviewSheet({
  location,
  onClose,
}: LocationPreviewSheetProps): React.JSX.Element {
  const router  = useRouter();
  const slideY  = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (location) {
      Animated.parallel([
        Animated.spring(slideY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: SHEET_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [location]);

  return (
    <>
      {/* Dimmed backdrop — only interactive when sheet is open */}
      <Animated.View
        style={[styles.backdrop, { opacity }]}
        pointerEvents={location ? 'auto' : 'none'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.fill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideY }] }]}
        pointerEvents={location ? 'auto' : 'none'}
      >
        {location && (
          <>
            {/* Drag handle */}
            <View style={styles.handle} />

            <View style={styles.content}>
              {/* Left: score */}
              <View style={styles.scoreCol}>
                <SipScoreDisplay score={location.sip_score} size="lg" />
              </View>

              {/* Right: info */}
              <View style={styles.infoCol}>
                <Text style={styles.name} numberOfLines={2}>{location.name}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.type}>{TYPE_LABEL[location.type]}</Text>
                  <Text style={styles.dot}> · </Text>
                  <Text style={styles.dist}>{formatDistance(location._distanceKm)}</Text>
                </View>

                {/* Feature pills */}
                <View style={styles.pillsRow}>
                  {location.has_pebbled_ice && <Pill label="❄ Pebble Ice" />}
                  {location.has_drive_thru  && <Pill label="🚗 Drive-Thru" />}
                  {location.has_lime        && <Pill label="🌿 Lime" />}
                  {location.has_foam_cup    && <Pill label="☕ Foam Cup" />}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.detailButton}
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                router.push(`/location/${location.id}`);
              }}
            >
              <Text style={styles.detailButtonText}>View Full Details</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </>
  );
}

function Pill({ label }: { label: string }): React.JSX.Element {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayLight,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: 8,
    gap: spacing.md,
  },
  scoreCol: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  dot: {
    color: colors.grayLight,
  },
  dist: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  pill: {
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.teal,
  },
  detailButton: {
    backgroundColor: colors.teal,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  detailButtonText: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  fill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
});
