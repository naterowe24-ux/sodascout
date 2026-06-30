import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

interface AutocompleteResult {
  place_id: string;
  name: string;
  description: string;
}

interface PlaceDetails {
  lat: number;
  lng: number;
  name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') ?? '';
  if (!GOOGLE_KEY) return json({ error: 'GOOGLE_MAPS_API_KEY secret not configured' }, 500);

  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const placeId = url.searchParams.get('place_id');

  // ── Resolve place_id → lat/lng ────────────────────────────────────────────
  if (placeId) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}&fields=geometry,name&key=${GOOGLE_KEY}`,
    );
    const data = await res.json() as {
      result?: {
        geometry?: { location?: { lat: number; lng: number } };
        name?: string;
      };
    };
    const loc = data.result?.geometry?.location;
    if (!loc) return json({ error: 'Place not found' }, 404);

    const result: PlaceDetails = {
      lat: loc.lat,
      lng: loc.lng,
      name: data.result?.name ?? '',
    };
    return json(result);
  }

  // ── City autocomplete ─────────────────────────────────────────────────────
  if (q) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(q)}&types=(cities)&key=${GOOGLE_KEY}`,
    );
    const data = await res.json() as {
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: { main_text?: string };
      }>;
    };
    const suggestions: AutocompleteResult[] = (data.predictions ?? [])
      .slice(0, 6)
      .map((p) => ({
        place_id: p.place_id,
        name: p.structured_formatting?.main_text ?? p.description,
        description: p.description,
      }));
    return json(suggestions);
  }

  return json({ error: 'Provide ?q=<city> or ?place_id=<id>' }, 400);
});
