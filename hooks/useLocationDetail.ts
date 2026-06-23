import { useState, useEffect } from 'react';
import * as ExpoLocation from 'expo-location';
import { supabase } from '../lib/supabase';
import { haversineKm } from '../lib/maps';
import type { Location, SipReview } from '../types';

export interface CategoryAverage {
  key: string;
  label: string;
  score: number | null; // 0–10 scale
  count: number;
  isCore: boolean;
}

const CATEGORY_META = [
  { key: 'crispiness', label: 'Crispiness',  isCore: true },
  { key: 'flavor',     label: 'Flavor',       isCore: true },
  { key: 'ice',        label: 'Ice',          isCore: false },
  { key: 'cup',        label: 'Cup',          isCore: false },
  { key: 'value',      label: 'Value',        isCore: false },
  { key: 'drivethu',   label: 'Drive-Thru',   isCore: false },
  { key: 'lime',       label: 'Lime',         isCore: false },
] as const;

function computeCategoryAverages(reviews: SipReview[]): CategoryAverage[] {
  return CATEGORY_META.map(({ key, label, isCore }) => {
    const scores = reviews
      .map((r) => r[`score_${key}` as keyof SipReview] as number | null)
      .filter((s): s is number => s !== null);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return {
      key,
      label,
      score: avg !== null ? (avg / 5) * 10 : null,
      count: scores.length,
      isCore,
    };
  });
}

interface UseLocationDetailResult {
  location: Location | null;
  reviews: SipReview[];
  categoryAverages: CategoryAverage[];
  distanceKm: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLocationDetail(id: string): UseLocationDetailResult {
  const [location, setLocation]   = useState<Location | null>(null);
  const [reviews, setReviews]     = useState<SipReview[]>([]);
  const [distanceKm, setDistance] = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      supabase.from('locations').select('*').eq('id', id).single(),
      supabase
        .from('reviews')
        .select('*')
        .eq('location_id', id)
        .order('created_at', { ascending: false })
        .limit(30),
    ]).then(([locRes, revRes]) => {
      if (cancelled) return;
      if (locRes.error) { setError(locRes.error.message); setLoading(false); return; }
      setLocation(locRes.data);
      setReviews(revRes.data ?? []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id, tick]);

  // Resolve distance separately so it doesn't block the main data
  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    ExpoLocation.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted' || cancelled) return;
      ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Low }).then((pos) => {
        if (!cancelled) {
          setDistance(haversineKm(
            pos.coords.latitude, pos.coords.longitude,
            location.lat, location.lng,
          ));
        }
      });
    });
    return () => { cancelled = true; };
  }, [location?.id]);

  const categoryAverages = computeCategoryAverages(reviews);
  const refresh = (): void => setTick((n) => n + 1);

  return { location, reviews, categoryAverages, distanceKm, loading, error, refresh };
}
