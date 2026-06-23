export type LocationType = 'gas_station' | 'fast_food' | 'soda_shop';

export type SodaType =
  | 'diet_coke'
  | 'coke_zero'
  | 'diet_pepsi'
  | 'sprite'
  | 'dr_pepper'
  | 'other';

export type PriceRange = '$' | '$$' | '$$$';

export interface Location {
  id: string;
  google_place_id: string;
  name: string;
  type: LocationType;
  address: string | null;
  lat: number;
  lng: number;
  google_rating: number | null;
  google_review_count: number;
  has_drive_thru: boolean;
  has_pebbled_ice: boolean | null;
  has_foam_cup: boolean | null;
  has_lime: boolean | null;
  price_range: PriceRange | null;
  hours: Record<string, string> | null;
  sip_score: number | null;
  sip_score_updated_at: string | null;
  created_at: string;
}

export interface SipScore {
  value: number | null;
  in_app_score: number | null;
  google_score: number | null;
  in_app_review_count: number;
  google_review_count: number;
  has_enough_reviews: boolean; // true when in-app count >= 3
}

export interface SipReview {
  id: string;
  location_id: string;
  user_id: string | null;
  soda_type: SodaType;
  // Core — required
  score_crispiness: number;
  score_flavor: number;
  // Optional
  score_ice: number | null;
  score_cup: number | null;
  score_value: number | null;
  score_drivethu: number | null;
  score_lime: number | null;
  note: string | null;
  created_at: string;
}

export interface ReviewInput {
  location_id: string;
  soda_type: SodaType;
  score_crispiness: number;
  score_flavor: number;
  score_ice: number | null;
  score_cup: number | null;
  score_value: number | null;
  score_drivethu: number | null;
  score_lime: number | null;
  note: string | null;
}

export type FilterChip =
  | 'all'
  | 'gas_station'
  | 'fast_food'
  | 'soda_shop'
  | 'pebbled_ice'
  | 'foam_cup'
  | 'lime';

export type SortTab = 'nearby' | 'top_rated' | 'drive_thru' | 'new';

export type LocationWithDistance = Location & { _distanceKm: number };
