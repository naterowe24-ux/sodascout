import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Location } from '../types';

interface UseSavedLocationsResult {
  savedIds: Set<string>;
  isSaved: (locationId: string) => boolean;
  toggleSave: (locationId: string) => Promise<void>;
  savedLocations: Location[];
  loading: boolean;
  refetch: () => void;
}

export function useSavedLocations(): UseSavedLocationsResult {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback((): void => { setRefreshKey((k) => k + 1); }, []);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      setSavedLocations([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: saved } = await supabase
        .from('saved_locations')
        .select('location_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (!saved || saved.length === 0) {
        setSavedIds(new Set());
        setSavedLocations([]);
        setLoading(false);
        return;
      }

      const ids = saved.map((s) => s.location_id);
      const { data: locations } = await supabase
        .from('locations')
        .select('*')
        .in('id', ids);

      if (cancelled) return;

      const locMap = new Map((locations ?? []).map((l) => [l.id, l]));
      const ordered = ids
        .map((id) => locMap.get(id))
        .filter((l): l is Location => l !== undefined);

      setSavedIds(new Set(ids));
      setSavedLocations(ordered);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user, refreshKey]);

  const isSaved = useCallback(
    (locationId: string): boolean => savedIds.has(locationId),
    [savedIds],
  );

  const toggleSave = useCallback(
    async (locationId: string): Promise<void> => {
      if (!user) return;

      if (savedIds.has(locationId)) {
        // Optimistic remove
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
        setSavedLocations((prev) => prev.filter((l) => l.id !== locationId));

        await supabase
          .from('saved_locations')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', locationId);
      } else {
        // Optimistic add (ID only) — fetch full location in parallel
        setSavedIds((prev) => new Set([...prev, locationId]));

        const [, { data }] = await Promise.all([
          supabase
            .from('saved_locations')
            .insert({ user_id: user.id, location_id: locationId }),
          supabase
            .from('locations')
            .select('*')
            .eq('id', locationId)
            .single(),
        ]);

        if (data) {
          setSavedLocations((prev) => [data, ...prev]);
        }
      }
    },
    [user, savedIds],
  );

  return { savedIds, isSaved, toggleSave, savedLocations, loading, refetch };
}
