import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { SipScoreDisplay } from '../UI/SipScore';
import { formatDistance } from '../../lib/maps';
import type { LocationWithDistance, LocationType } from '../../types';

const TYPE_LABEL: Record<LocationType, string> = {
  gas_station: 'Gas Station',
  fast_food:   'Fast Food',
  soda_shop:   'Soda Shop',
};

const TYPE_ICON: Record<LocationType, string> = {
  gas_station: '⛽',
  fast_food:   '🍔',
  soda_shop:   '🥤',
};

interface LocationCardProps {
  location: LocationWithDistance;
}

export function LocationCard({ location }: LocationCardProps): React.JSX.Element {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/location/${location.id}`)}
    >
      {/* Score */}
      <View style={styles.scoreCol}>
        <SipScoreDisplay score={location.sip_score} size="md" />
      </View>

      {/* Main info */}
      <View style={styles.infoCol}>
        <Text style={styles.name} numberOfLines={1}>{location.name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.typeIcon}>{TYPE_ICON[location.type]}</Text>
          <Text style={styles.type}>{TYPE_LABEL[location.type]}</Text>
          {location.address ? (
            <Text style={styles.address} numberOfLines={1}>
              {' · '}{location.address.split(',')[0]}
            </Text>
          ) : null}
        </View>

        {/* Feature tags */}
        <View style={styles.tagsRow}>
          {location.has_pebbled_ice && <FeatureTag label="Pebble Ice" />}
          {location.has_drive_thru  && <FeatureTag label="Drive-Thru" />}
          {location.has_lime        && <FeatureTag label="Lime" />}
          {location.has_foam_cup    && <FeatureTag label="Foam Cup" />}
        </View>
      </View>

      {/* Distance */}
      <View style={styles.distCol}>
        <Text style={styles.dist}>{formatDistance(location._distanceKm)}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function FeatureTag({ label }: { label: string }): React.JSX.Element {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  scoreCol: {
    width: 54,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  distCol: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  name: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    color: '#1A1A1A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  typeIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  type: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.grayMid,
  },
  address: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayLight,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tag: {
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.body.medium,
    fontSize: 10,
    color: colors.teal,
  },
  dist: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
  },
  chevron: {
    fontSize: 18,
    color: colors.grayLight,
    lineHeight: 20,
    marginTop: 2,
  },
});
