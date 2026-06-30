import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLocation from 'expo-location';
import { TravelEntry, RecentCity } from '../../components/Travel/TravelEntry';
import { DetectingScreen } from '../../components/Travel/DetectingScreen';
import { SodaMap } from '../../components/Map/SodaMap';
import { LocationCard } from '../../components/Location/LocationCard';
import { colors, fonts, spacing, radius } from '../../constants/theme';
import { fetchLocationsNear, haversineKm } from '../../lib/maps';
import type { LocationWithDistance } from '../../types';

type TravelView = 'entry' | 'detecting' | 'map';
type TravelSort = 'top_score' | 'nearest';

interface TravelCity {
  name: string;
  lat: number;
  lng: number;
}

const { height: SCREEN_H } = Dimensions.get('window');
const MAP_HEIGHT = Math.round(SCREEN_H * 0.38);
const MAX_RECENT = 5;

export default function TravelScreen(): React.JSX.Element {
  const [view, setView] = useState<TravelView>('entry');
  const [city, setCity] = useState<TravelCity | null>(null);
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [sort, setSort] = useState<TravelSort>('top_score');
  const [recentCities, setRecentCities] = useState<RecentCity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Load locations for a given city ────────────────────────────────────────
  const loadCity = useCallback(async (target: TravelCity): Promise<void> => {
    setCity(target);
    setView('map');
    setMapLoading(true);
    setSelectedId(null);
    const { data } = await fetchLocationsNear(
      { lat: target.lat, lng: target.lng },
      'all',
      'top_rated',
    );
    setLocations(data);
    setMapLoading(false);
  }, []);

  // ── Handle city selected from search ───────────────────────────────────────
  const handleCitySelected = useCallback(
    async (selected: { name: string; lat: number; lng: number }): Promise<void> => {
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => !(c.lat === selected.lat && c.lng === selected.lng));
        return [
          { name: selected.name, description: selected.name, lat: selected.lat, lng: selected.lng },
          ...filtered,
        ].slice(0, MAX_RECENT);
      });
      await loadCity(selected);
    },
    [loadCity],
  );

  // ── Handle auto-detect ─────────────────────────────────────────────────────
  const handleDetect = useCallback(async (): Promise<void> => {
    setView('detecting');

    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setView('entry');
      return;
    }

    const pos = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    const detected: TravelCity = {
      name: 'Current Location',
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    await loadCity(detected);
  }, [loadCity]);

  // ── Sorted locations ───────────────────────────────────────────────────────
  const sorted = [...locations].sort((a, b) =>
    sort === 'nearest'
      ? a._distanceKm - b._distanceKm
      : (b.sip_score ?? -1) - (a.sip_score ?? -1),
  );

  // ── Views ──────────────────────────────────────────────────────────────────
  if (view === 'entry') {
    return (
      <TravelEntry
        onCitySelected={handleCitySelected}
        onDetectLocation={handleDetect}
        recentCities={recentCities}
      />
    );
  }

  if (view === 'detecting') {
    return <DetectingScreen />;
  }

  // ── Travel map view ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* City pill + back */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setView('entry')} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setView('entry')} style={styles.cityPill} activeOpacity={0.8}>
          <Text style={styles.cityPillIcon}>✈️</Text>
          <Text style={styles.cityPillText} numberOfLines={1}>{city?.name ?? 'Travel'}</Text>
          <Text style={styles.cityPillCaret}>⌄</Text>
        </TouchableOpacity>

        {/* Sort toggle */}
        <View style={styles.sortToggle}>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'top_score' && styles.sortBtnActive]}
            onPress={() => setSort('top_score')}
          >
            <Text style={[styles.sortBtnText, sort === 'top_score' && styles.sortBtnTextActive]}>
              Top
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'nearest' && styles.sortBtnActive]}
            onPress={() => setSort('nearest')}
          >
            <Text style={[styles.sortBtnText, sort === 'nearest' && styles.sortBtnTextActive]}>
              Nearest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
        <SodaMap
          locations={sorted}
          userCoords={city ? { lat: city.lat, lng: city.lng } : null}
          selectedId={selectedId}
          onSelectPin={(loc) => setSelectedId(loc.id === selectedId ? null : loc.id)}
          style={styles.map}
        />
      </View>

      {/* Location list */}
      {mapLoading ? (
        <View style={styles.loadingList}>
          <ActivityIndicator color={colors.teal} size="large" />
          <Text style={styles.loadingText}>Finding soda spots…</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No spots found near {city?.name}.</Text>
              <Text style={styles.emptyListSub}>Try a larger city or nearby area.</Text>
            </View>
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {sorted.length > 0
                ? `${sorted.length} spot${sorted.length === 1 ? '' : 's'} near ${city?.name}`
                : ''}
            </Text>
          }
          renderItem={({ item }) => {
            const withDist: LocationWithDistance = city
              ? { ...item, _distanceKm: haversineKm(city.lat, city.lng, item.lat, item.lng) }
              : item;
            return <LocationCard location={withDist} />;
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.gray,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    fontFamily: fonts.body.medium,
    fontSize: 24,
    color: colors.teal,
    lineHeight: 26,
  },
  cityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cityPillIcon: {
    fontSize: 14,
  },
  cityPillText: {
    flex: 1,
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.teal,
  },
  cityPillCaret: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.teal,
  },
  sortToggle: {
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  sortBtnActive: {
    backgroundColor: colors.teal,
  },
  sortBtnText: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.grayMid,
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },

  // Map
  mapContainer: {
    width: '100%',
  },
  map: {
    flex: 1,
  },

  // List
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  listHeader: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
    paddingHorizontal: spacing.md,
    paddingBottom: 4,
  },
  loadingList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
  },
  emptyList: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyListText: {
    fontFamily: fonts.body.medium,
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptyListSub: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
    textAlign: 'center',
  },
});
