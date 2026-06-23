import { useState, useEffect, useCallback } from 'react';
import * as ExpoLocation from 'expo-location';
import { fetchLocationsNear, SLC_FALLBACK } from '../lib/maps';
import type { LocationWithDistance, FilterChip, SortTab } from '../types';

interface Coords {
  lat: number;
  lng: number;
}

interface UseNearbyLocationsResult {
  locations: LocationWithDistance[];
  userCoords: Coords | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => void;
}

export function useNearbyLocations(
  filter: FilterChip,
  sort: SortTab,
): UseNearbyLocationsResult {
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Resolve user location once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setPermissionDenied(true);
          setUserCoords(SLC_FALLBACK);
        }
        return;
      }
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      if (!cancelled) {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch + filter + sort whenever coords, filter, sort, or refresh changes
  useEffect(() => {
    if (!userCoords) return;
    let cancelled = false;
    setLoading(true);
    fetchLocationsNear(userCoords, filter, sort).then(({ data, error: err }) => {
      if (!cancelled) {
        setLocations(data);
        setError(err);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [userCoords, filter, sort, refreshCount]);

  const refresh = useCallback(() => setRefreshCount((n) => n + 1), []);

  return { locations, userCoords, loading, error, permissionDenied, refresh };
}
