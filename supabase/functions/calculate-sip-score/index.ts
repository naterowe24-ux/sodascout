// Supabase Edge Function — called by a pg_net trigger after each review insert.
// Recalculates the blended SipScore (60% in-app / 40% Google) for a location.
// Deployed with --no-verify-jwt; guarded by WEBHOOK_SECRET header instead.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEIGHTS: Record<string, number> = {
  crispiness: 0.25,
  flavor:     0.25,
  ice:        0.10,
  cup:        0.10,
  value:      0.10,
  drivethu:   0.10,
  lime:       0.10,
};

interface Review {
  score_crispiness: number;
  score_flavor:     number;
  score_ice:        number | null;
  score_cup:        number | null;
  score_value:      number | null;
  score_drivethu:   number | null;
  score_lime:       number | null;
}

function calcInAppScore(reviews: Review[]): number | null {
  if (reviews.length < 3) return null;

  const categoryScores: Record<string, number[]> = {
    crispiness: [], flavor: [], ice: [], cup: [], value: [], drivethu: [], lime: [],
  };

  for (const r of reviews) {
    categoryScores.crispiness.push(r.score_crispiness);
    categoryScores.flavor.push(r.score_flavor);
    if (r.score_ice      !== null) categoryScores.ice.push(r.score_ice);
    if (r.score_cup      !== null) categoryScores.cup.push(r.score_cup);
    if (r.score_value    !== null) categoryScores.value.push(r.score_value);
    if (r.score_drivethu !== null) categoryScores.drivethu.push(r.score_drivethu);
    if (r.score_lime     !== null) categoryScores.lime.push(r.score_lime);
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [cat, weight] of Object.entries(WEIGHTS)) {
    const scores = categoryScores[cat];
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      weightedSum += (avg / 5) * 10 * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function calcSipScore(
  inAppScore: number | null,
  googleRating: number | null,
  googleCount: number,
): number | null {
  const hasGoogle = googleRating !== null && googleCount > 0;
  const confidenceMultiplier = Math.min(googleCount / 100, 1);
  const adjustedGoogle = hasGoogle ? (googleRating! / 5) * 10 * confidenceMultiplier : null;

  if (inAppScore === null && adjustedGoogle === null) return null;
  if (inAppScore === null) return adjustedGoogle;
  if (adjustedGoogle === null) return inAppScore;

  return inAppScore * 0.60 + adjustedGoogle * 0.40;
}

Deno.serve(async (req: Request) => {
  // Basic auth: shared secret set as a Supabase function secret
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  if (webhookSecret) {
    const incoming = req.headers.get('x-webhook-secret');
    if (incoming !== webhookSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  let body: { record?: { location_id?: string } };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const locationId = body?.record?.location_id;
  if (!locationId) {
    return new Response(JSON.stringify({ error: 'Missing record.location_id' }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: location, error: locErr } = await supabase
    .from('locations')
    .select('google_rating, google_review_count')
    .eq('id', locationId)
    .single();

  if (locErr || !location) {
    return new Response(JSON.stringify({ error: 'Location not found' }), { status: 404 });
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('score_crispiness, score_flavor, score_ice, score_cup, score_value, score_drivethu, score_lime')
    .eq('location_id', locationId);

  const inAppScore = calcInAppScore(reviews ?? []);
  const sipScore   = calcSipScore(inAppScore, location.google_rating, location.google_review_count ?? 0);

  await supabase
    .from('locations')
    .update({ sip_score: sipScore, sip_score_updated_at: new Date().toISOString() })
    .eq('id', locationId);

  return new Response(
    JSON.stringify({ location_id: locationId, sip_score: sipScore, in_app_score: inAppScore }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
