import { supabase } from './supabase';
import type { Location, LocationWithDistance, FilterChip, SortTab } from '../types';

export const RADIUS_DEGREES = 0.15; // ~16 km bounding box half-width
export const SLC_FALLBACK = { lat: 40.7608, lng: -111.891 } as const;

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export async function fetchLocationsNear(
  coords: { lat: number; lng: number },
  filter: FilterChip,
  sort: SortTab,
): Promise<{ data: LocationWithDistance[]; error: string | null }> {
  const { lat, lng } = coords;

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .gte('lat', lat - RADIUS_DEGREES)
    .lte('lat', lat + RADIUS_DEGREES)
    .gte('lng', lng - RADIUS_DEGREES)
    .lte('lng', lng + RADIUS_DEGREES);

  if (error) return { data: [], error: error.message };

  let results: Location[] = data ?? [];

  // Apply filter chips
  switch (filter) {
    case 'gas_station':
    case 'fast_food':
    case 'soda_shop':
      results = results.filter((l) => l.type === filter);
      break;
    case 'pebbled_ice':
      results = results.filter((l) => l.has_pebbled_ice === true);
      break;
    case 'foam_cup':
      results = results.filter((l) => l.has_foam_cup === true);
      break;
    case 'lime':
      results = results.filter((l) => l.has_lime === true);
      break;
  }

  const withDist: LocationWithDistance[] = results.map((l) => ({
    ...l,
    _distanceKm: haversineKm(lat, lng, l.lat, l.lng),
  }));

  // Sort
  switch (sort) {
    case 'nearby':
      withDist.sort((a, b) => a._distanceKm - b._distanceKm);
      break;
    case 'top_rated':
      withDist.sort((a, b) => (b.sip_score ?? -1) - (a.sip_score ?? -1));
      break;
    case 'drive_thru':
      withDist.sort((a, b) => {
        if (a.has_drive_thru === b.has_drive_thru) return a._distanceKm - b._distanceKm;
        return a.has_drive_thru ? -1 : 1;
      });
      break;
    case 'new':
      withDist.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      break;
  }

  return { data: withDist, error: null };
}

// Placeholder — implemented in step 7
export async function searchCity(
  _query: string,
): Promise<{ name: string; lat: number; lng: number }[]> {
  return [];
}
