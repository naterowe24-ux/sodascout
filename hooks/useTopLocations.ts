import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Location, FilterChip } from '../types';

interface UseTopLocationsResult {
  locations: Location[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTopLocations(filter: FilterChip): UseTopLocationsResult {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const isUserRefresh = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (isUserRefresh.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    supabase
      .from('locations')
      .select('*')
      .not('sip_score', 'is', null)
      .order('sip_score', { ascending: false })
      .limit(100)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        isUserRefresh.current = false;
        setLoading(false);
        setRefreshing(false);
        if (err) {
          setError(err.message);
          return;
        }
        setAllLocations(data ?? []);
      });

    return () => { cancelled = true; };
  }, [refreshCount]);

  const locations = allLocations.filter((l) => {
    switch (filter) {
      case 'gas_station':
      case 'fast_food':
      case 'soda_shop':
        return l.type === filter;
      case 'pebbled_ice':
        return l.has_pebbled_ice === true;
      case 'foam_cup':
        return l.has_foam_cup === true;
      case 'lime':
        return l.has_lime === true;
      default:
        return true;
    }
  });

  const refresh = useCallback((): void => {
    isUserRefresh.current = true;
    setRefreshCount((n) => n + 1);
  }, []);

  return { locations, loading, refreshing, error, refresh };
}
