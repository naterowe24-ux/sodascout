import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySearch } from './CitySearch';
import { resolvePlaceCoords } from '../../lib/maps';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import type { CitySuggestion } from '../../lib/maps';

export interface RecentCity {
  name: string;
  description: string;
  lat: number;
  lng: number;
}

interface TravelEntryProps {
  onCitySelected: (city: { name: string; lat: number; lng: number }) => void;
  onDetectLocation: () => void;
  recentCities: RecentCity[];
}

export function TravelEntry({
  onCitySelected,
  onDetectLocation,
  recentCities,
}: TravelEntryProps): React.JSX.Element {
  async function handleSuggestion(suggestion: CitySuggestion): Promise<void> {
    const coords = await resolvePlaceCoords(suggestion.place_id);
    if (coords) {
      onCitySelected({ name: suggestion.name, lat: coords.lat, lng: coords.lng });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Travel Mode</Text>
          <Text style={styles.sub}>Find great fountain soda wherever you go</Text>
        </View>

        {/* Search */}
        <CitySearch onSelect={handleSuggestion} autoFocus={false} />

        {/* Detect location */}
        <TouchableOpacity
          style={styles.detectBtn}
          onPress={onDetectLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.detectIcon}>📍</Text>
          <Text style={styles.detectText}>Use My Current Location</Text>
        </TouchableOpacity>

        {/* Recent cities */}
        {recentCities.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentHeading}>Recent</Text>
            <FlatList
              data={recentCities}
              keyExtractor={(item) => `${item.lat}-${item.lng}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentRow}
                  onPress={() => onCitySelected(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recentIcon}>🕐</Text>
                  <View style={styles.recentText}>
                    <Text style={styles.recentName}>{item.name}</Text>
                    <Text style={styles.recentDesc} numberOfLines={1}>{item.description}</Text>
                  </View>
                  <Text style={styles.recentChevron}>›</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {recentCities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyText}>
              Search a city to discover the best fountain soda spots
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    gap: 4,
    paddingTop: spacing.sm,
  },
  heading: {
    fontFamily: fonts.display.extraBold,
    fontSize: 26,
    color: '#1A1A1A',
  },
  sub: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.tealLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  detectIcon: {
    fontSize: 18,
  },
  detectText: {
    fontFamily: fonts.body.medium,
    fontSize: 15,
    color: colors.teal,
    flex: 1,
  },
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  recentHeading: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.grayMid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: 10,
  },
  recentIcon: {
    fontSize: 16,
  },
  recentText: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#1A1A1A',
  },
  recentDesc: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
  },
  recentChevron: {
    fontFamily: fonts.body.regular,
    fontSize: 20,
    color: colors.grayLight,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray,
    marginHorizontal: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 21,
  },
});
