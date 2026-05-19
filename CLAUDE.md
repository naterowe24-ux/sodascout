SodaScout — Claude Code Project Brief
> This file is read by Claude Code at the start of every session.
> It contains the full product context, architecture decisions, and coding standards for SodaScout.
---
What is SodaScout?
SodaScout is a mobile-first web app and native iOS/Android app — think Yelp for fountain soda.
Users open the app, see a map of nearby gas stations, fast food spots, and soda shops, and instantly
know which one has the best fountain soda via a proprietary rating called the SipScore.
The hero use case: someone travelling to a new city pulls up SodaScout and finds the best
Diet Coke within a few miles — factoring in carbonation crispiness, ice type, cup quality,
lime availability, price, and drive-thru speed.
---
Core Concepts
SipScore (0.0 – 10.0)
The SipScore is a weighted aggregate of in-app user reviews (60%) and Google Maps data (40%).
In-app review weights:
Category	Type	Weight
Crispiness (carbonation & bite)	Core — required	25%
Flavor (syrup ratio)	Core — required	25%
Ice (type & amount)	Optional	10%
Cup (foam vs plastic)	Optional	10%
Value (price point)	Optional	10%
Drive-thru (speed & ease)	Optional	10%
Lime / garnish (availability)	Optional	10%
Core categories (crispiness + flavor) are required on every review.
Optional categories are skippable. If skipped, their weight redistributes proportionally
across the categories the reviewer did rate.
Minimum 3 in-app reviews with core scores before the blended SipScore activates.
Below that threshold, show Google-only data with a "limited reviews" indicator.
Google Maps data (40%):
Star rating scaled from 5-star → 0–10
Tempered by review volume (confidence weight) and recency (last 12 months prioritised)
SipScore color thresholds:
8.5+ → Green (`#3B6D11`)
7.0–8.4 → Amber (`#BA7517`)
Below 7.0 → Red (`#A32D2D`)
SipReview
A user-submitted review. Contains:
Soda type (any fountain soda — Diet Coke, Coke Zero, Diet Pepsi, Sprite, Dr Pepper, Other)
Core ratings: crispiness + flavor (1–5 stars, required)
Optional ratings: ice, cup, value, drive-thru, lime (1–5 stars, each optional)
Optional text note
Authored by guest (anonymous) or logged-in user (optional login)
---
Users & Auth
Guest users: can browse and submit reviews without an account. No login required.
Logged-in users: optional Google/Apple sign-in. Same review weight as guests (no boost).
Verified vs guest reviews are labelled in the UI but carry equal algorithmic weight.
Use Supabase Auth for authentication (Google + Apple providers).
---
Screens & Features
1. Home / Explore (map view)
Google Maps overlay centred on user's current location
Pins colour-coded by SipScore (green / amber / red)
Pin label shows SipScore number
Tapping a pin opens a bottom sheet preview of that location
Below the map: ranked list of nearby locations sorted by SipScore by default
Filter chips: All · Gas Station · Fast Food · Soda Shop · Pebbled Ice · Foam Cup · Lime
Tabs: Nearby · Top Rated · Drive-Thru · New
2. Location Detail
Hero section: venue name, type, distance, SipScore (large), top badge if applicable
Quick-info chips: ice type, cup type, lime availability, service type, price range, hours
Score breakdown: bar chart for each category, labelled core vs optional
Source attribution: "142 in-app · 4.6 stars · 380 Google"
"What you're getting" grid: 6 cards (ice, cup, lime, carbonation, price, drive-thru)
— colour coded green (great), amber (ok), gray (not available)
Recent SipReviews: reviewer name/avatar, soda type tag, score, review text
CTA bar: "+ Leave a SipReview" button, Save, Share
3. Review Submission
Pre-filled with location name
Soda type selector (chips)
Star ratings for each category (core required, optional skippable)
Optional text note
Submit as guest or prompt to sign in
On submit: return to location detail with updated scores
4. Travel Mode
Entry screen: search bar (city name autocomplete) + "Use my current location" button
Recently visited cities list with best SipScore and top spot from that visit
Auto-detect screen: animated pulse ring while detecting location, then resolves to map
Travel map screen:
Same map + pin UI as home, but centred on searched/detected city
City name pill at top (tappable to search again)
Sort toggle: Top Score / Nearest
Ranked results list with tags visible (ice, lime, cup, drive-thru)
Travel tab in bottom nav (plane icon)
5. Bottom Navigation
Explore · Top Sips · Review (+ button) · Saved · Travel
---
Tech Stack
Frontend
Expo (React Native) — single codebase for iOS, Android, and mobile web
React Navigation — tab + stack navigation
NativeWind — Tailwind-style styling for React Native
TypeScript throughout
Backend & Database
Supabase — Postgres database, Auth, Storage, Edge Functions
Supabase Realtime — for live SipScore updates when new reviews come in
Maps
Google Maps API (via `react-native-maps` with Google provider)
Google Places API — for location search, autocomplete, and fetching place metadata
Google Maps data feeds the 40% of the SipScore from existing reviews
Deployment
Expo EAS Build — for iOS and Android app builds
Vercel — for the web version
Supabase — managed backend, no separate server needed
---
Database Schema
```sql
-- Locations (gas stations, fast food, soda shops)
create table locations (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique not null,
  name text not null,
  type text not null, -- 'gas_station' | 'fast_food' | 'soda_shop'
  address text,
  lat double precision not null,
  lng double precision not null,
  google_rating numeric(3,1),
  google_review_count integer default 0,
  has_drive_thru boolean default false,
  has_pebbled_ice boolean,
  has_foam_cup boolean,
  has_lime boolean,
  price_range text, -- '$' | '$$' | '$$$'
  hours jsonb,
  sip_score numeric(3,1),          -- computed, cached
  sip_score_updated_at timestamptz,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- null = guest
  soda_type text not null, -- 'diet_coke' | 'coke_zero' | 'diet_pepsi' | 'sprite' | 'dr_pepper' | 'other'
  -- Core (required)
  score_crispiness integer not null check (score_crispiness between 1 and 5),
  score_flavor integer not null check (score_flavor between 1 and 5),
  -- Optional
  score_ice integer check (score_ice between 1 and 5),
  score_cup integer check (score_cup between 1 and 5),
  score_value integer check (score_value between 1 and 5),
  score_drivethu integer check (score_drivethu between 1 and 5),
  score_lime integer check (score_lime between 1 and 5),
  note text,
  created_at timestamptz default now()
);

-- Saved locations (per user)
create table saved_locations (
  user_id uuid references auth.users(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, location_id)
);
```
---
SipScore Calculation (Edge Function)
Implement as a Supabase Edge Function `calculate-sip-score` triggered after each review insert.
```typescript
// Pseudocode — implement in /supabase/functions/calculate-sip-score/index.ts

const WEIGHTS = {
  crispiness: 0.25,
  flavor: 0.25,
  ice: 0.10,
  cup: 0.10,
  value: 0.10,
  drivethu: 0.10,
  lime: 0.10,
};

function calcInAppScore(reviews: Review[]): number | null {
  if (reviews.length < 3) return null; // not enough data yet

  const categoryAverages = computeAveragesPerCategory(reviews);

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [cat, weight] of Object.entries(WEIGHTS)) {
    if (categoryAverages[cat] !== null) {
      // scale 1–5 stars → 0–10
      weightedSum += (categoryAverages[cat] / 5) * 10 * weight;
      totalWeight += weight;
    }
  }

  // redistribute weight if optional categories were skipped
  return totalWeight > 0 ? (weightedSum / totalWeight) : null;
}

function calcSipScore(inAppScore: number | null, googleRating: number, googleCount: number): number {
  const googleScore = (googleRating / 5) * 10;
  const confidenceMultiplier = Math.min(googleCount / 100, 1); // caps at 1.0 for 100+ reviews
  const adjustedGoogle = googleScore * confidenceMultiplier;

  if (inAppScore === null) return adjustedGoogle; // fallback: Google only

  return (inAppScore * 0.60) + (adjustedGoogle * 0.40);
}
```
---
Project Structure
```
sodascout/
├── CLAUDE.md                  ← you are here
├── app/                       ← Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx          ← Explore / home map
│   │   ├── top-sips.tsx
│   │   ├── review.tsx
│   │   ├── saved.tsx
│   │   └── travel.tsx
│   ├── location/
│   │   └── [id].tsx           ← Location detail
│   └── _layout.tsx
├── components/
│   ├── Map/
│   │   ├── SodaMap.tsx        ← Google Maps + pins
│   │   └── SipPin.tsx         ← Colour-coded map pin
│   ├── Location/
│   │   ├── LocationCard.tsx   ← Card in the list
│   │   ├── ScoreBreakdown.tsx ← Bar chart of categories
│   │   └── WhatYouGet.tsx     ← Detail grid (ice, cup, lime…)
│   ├── Review/
│   │   ├── ReviewModal.tsx    ← Submission form
│   │   ├── StarRating.tsx     ← Reusable 1–5 star input
│   │   └── ReviewCard.tsx     ← Rendered review
│   ├── Travel/
│   │   ├── TravelEntry.tsx    ← Search + recent cities
│   │   ├── CitySearch.tsx     ← Autocomplete input
│   │   └── DetectingScreen.tsx← Pulse animation
│   └── UI/
│       ├── SipScore.tsx       ← Score display (number + colour)
│       ├── TagChip.tsx        ← Ice / lime / cup chips
│       └── BottomNav.tsx
├── lib/
│   ├── supabase.ts            ← Supabase client
│   ├── maps.ts                ← Google Maps/Places helpers
│   └── sipscore.ts            ← Client-side score formatting
├── supabase/
│   ├── functions/
│   │   └── calculate-sip-score/
│   │       └── index.ts
│   └── migrations/
│       └── 001_initial_schema.sql
├── constants/
│   └── theme.ts               ← Colours, fonts, spacing
└── types/
    └── index.ts               ← Shared TypeScript types
```
---
Design System
Colours
```typescript
export const colors = {
  red:        '#E24B4A',
  redLight:   '#FCEBEB',
  redDark:    '#A32D2D',
  green:      '#3B6D11',
  greenLight: '#EAF3DE',
  greenMid:   '#639922',
  amber:      '#EF9F27',
  amberLight: '#FAEEDA',
  amberDark:  '#854F0B',
  teal:       '#0F6E56',
  tealLight:  '#E1F5EE',
  blue:       '#185FA5',
  blueLight:  '#E6F1FB',
  gray:       '#F1EFE8',
  grayMid:    '#5F5E5A',
  grayLight:  '#D3D1C7',
};
```
Fonts
Display / headings: Syne (weights 700, 800)
Body: DM Sans (weights 400, 500)
Import via `expo-font` or `@expo-google-fonts`
SipScore display rules
Always show one decimal place (e.g. `9.6`, not `9.60` or `10`)
Colour the number based on threshold (green / amber / red — see above)
Label below: "SipScore" in 9px uppercase, letter-spaced
---
Environment Variables
```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```
---
Coding Standards
TypeScript strict mode — no `any`, explicit return types on all functions
Component files: one component per file, named exports
No inline styles in React Native — use StyleSheet.create or NativeWind classes
Supabase queries: always handle loading + error states
SipScore calculation always happens server-side (Edge Function) — never trust client math
Google API calls are server-side only — never expose the Maps API key in client bundles
(use a Supabase Edge Function as a proxy for Places searches)
Commit messages: conventional commits format (`feat:`, `fix:`, `chore:`)
---
Build Order (recommended sequence for Claude Code sessions)
Project scaffold — Expo + Supabase init, env vars, folder structure
Database — run migration, set up RLS policies, seed 5–10 test locations
SipScore Edge Function — implement + test calculation logic
Map screen — Google Maps, fetch nearby locations, render SipPins
Location detail screen — score breakdown, what-you-get grid, reviews list
Review submission — modal form, star inputs, submit to Supabase
Travel mode — city search autocomplete, auto-detect, travel map
Auth — optional Google/Apple sign-in, guest fallback
Saved locations — heart button, saved tab
Polish — loading states, empty states, error handling, animations
---
Key Product Decisions (do not change without discussion)
SipScore weights are 60% in-app / 40% Google — do not adjust
Crispiness and flavor are always required on reviews — never make them optional
Verified and guest reviews carry equal weight — no boost for logged-in users
A location needs minimum 3 in-app reviews before the blended score activates
The app supports any fountain soda — not just Diet Coke
No trip planning feature — travel mode is search-on-the-go only
SipScore is always displayed to one decimal place
