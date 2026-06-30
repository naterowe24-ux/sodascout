import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SodaMap } from '../../components/Map/SodaMap';
import { LocationCard } from '../../components/Location/LocationCard';
import { LocationPreviewSheet } from '../../components/Location/LocationPreviewSheet';
import { useNearbyLocations } from '../../hooks/useNearbyLocations';
import { colors, fonts, spacing } from '../../constants/theme';
import type { FilterChip, SortTab, LocationWithDistance } from '../../types';

const MAP_HEIGHT = Math.round(Dimensions.get('window').height * 0.42);

// ── Filter chips ──────────────────────────────────────────────────────────────
const FILTERS: { key: FilterChip; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'gas_station', label: '⛽ Gas Station' },
  { key: 'fast_food',   label: '🍔 Fast Food' },
  { key: 'soda_shop',   label: '🥤 Soda Shop' },
  { key: 'pebbled_ice', label: '❄ Pebble Ice' },
  { key: 'foam_cup',    label: '☕ Foam Cup' },
  { key: 'lime',        label: '🌿 Lime' },
];

// ── Sort tabs ─────────────────────────────────────────────────────────────────
const SORTS: { key: SortTab; label: string }[] = [
  { key: 'nearby',    label: 'Nearby' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'drive_thru', label: 'Drive-Thru' },
  { key: 'new',       label: 'New' },
];

export default function ExploreScreen(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [activeSort, setActiveSort]     = useState<SortTab>('top_rated');
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDistance | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { locations, userCoords, loading, error, permissionDenied, refresh } =
    useNearbyLocations(activeFilter, activeSort);

  useEffect(() => {
    if (!loading) setIsRefreshing(false);
  }, [loading]);

  const handleSelectPin = useCallback((loc: LocationWithDistance) => {
    setSelectedLocation(loc);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const handleFilterChange = useCallback((f: FilterChip) => {
    setActiveFilter(f);
    setSelectedLocation(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        {/* ── Map ───────────────────────────────────────────────────────── */}
        <View style={styles.mapContainer}>
          <SodaMap
            locations={locations}
            userCoords={userCoords}
            selectedId={selectedLocation?.id ?? null}
            onSelectPin={handleSelectPin}
          />
          {permissionDenied && (
            <View style={styles.locationBanner}>
              <Text style={styles.locationBannerText}>
                📍 Showing Salt Lake City — enable location for nearby results
              </Text>
            </View>
          )}
        </View>

        {/* ── Filter chips ──────────────────────────────────────────────── */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                onPress={() => handleFilterChange(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Sort tabs ─────────────────────────────────────────────────── */}
        <View style={styles.sortRow}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortTab, activeSort === s.key && styles.sortTabActive]}
              onPress={() => setActiveSort(s.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortText, activeSort === s.key && styles.sortTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Location list ─────────────────────────────────────────────── */}
        {loading && !isRefreshing ? (
          <View style={styles.centre}>
            <ActivityIndicator color={colors.teal} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centre}>
            <Text style={styles.errorText}>Couldn't load locations</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LocationCard location={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState filter={activeFilter} />}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
          />
        )}

        {/* ── Preview sheet (rendered over everything, absolutely positioned) */}
        <LocationPreviewSheet location={selectedLocation} onClose={handleCloseSheet} />
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ filter }: { filter: FilterChip }): React.JSX.Element {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🥤</Text>
      <Text style={styles.emptyTitle}>No spots found</Text>
      <Text style={styles.emptyBody}>
        {filter === 'all'
          ? 'No locations in this area yet.'
          : 'Try removing the filter or exploring a wider area.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    backgroundColor: colors.gray,
  },

  // Map
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  locationBanner: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15,110,86,0.92)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  locationBannerText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Filters
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
  },
  filtersRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
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
  chipText: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  chipTextActive: {
    color: colors.teal,
  },

  // Sort tabs
  sortRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sortTabActive: {
    borderBottomColor: colors.teal,
  },
  sortText: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  sortTextActive: {
    color: colors.teal,
  },

  // List
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  // States
  centre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.redDark,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: colors.teal,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  emptyBody: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 20,
  },
});
