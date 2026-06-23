-- SodaScout seed data — Salt Lake City metro area
-- 10 locations across gas stations, fast food, and soda shops
-- Includes enough reviews on select locations to activate the blended SipScore

-- ─────────────────────────────────────────────────────────────────────────────
-- LOCATIONS
-- ─────────────────────────────────────────────────────────────────────────────
insert into locations (
  id, google_place_id, name, type, address,
  lat, lng,
  google_rating, google_review_count,
  has_drive_thru, has_pebbled_ice, has_foam_cup, has_lime,
  price_range,
  sip_score, sip_score_updated_at
) values

-- 1. Swig Sugar House — soda shop, high scorer
(
  'a1000000-0000-0000-0000-000000000001',
  'ChIJSwig_SugarHouse_SLC001',
  'Swig', 'soda_shop',
  '2139 S 1100 E, Salt Lake City, UT 84106',
  40.7258, -111.8547,
  4.8, 1240,
  true, true, true, true,
  '$',
  9.1, now()
),

-- 2. Sodalicious Millcreek — soda shop, strong mid-tier
(
  'a1000000-0000-0000-0000-000000000002',
  'ChIJSodalicious_Millcreek_002',
  'Sodalicious', 'soda_shop',
  '3860 S Highland Dr, Salt Lake City, UT 84106',
  40.6908, -111.8401,
  4.6, 890,
  true, false, true, true,
  '$',
  8.6, now()
),

-- 3. Maverick Country Store — gas station, pebbled ice
(
  'a1000000-0000-0000-0000-000000000003',
  'ChIJMaverick_Murray_SLC003',
  'Maverick Country Store', 'gas_station',
  '5475 S State St, Murray, UT 84107',
  40.6669, -111.8879,
  4.3, 410,
  false, true, false, false,
  '$',
  7.8, now()
),

-- 4. Sonic Drive-In Sandy — fast food, drive-thru specialist
(
  'a1000000-0000-0000-0000-000000000004',
  'ChIJSonic_Sandy_SLC004',
  'Sonic Drive-In', 'fast_food',
  '9120 S 700 E, Sandy, UT 84070',
  40.5915, -111.8490,
  4.2, 630,
  true, true, false, true,
  '$',
  7.5, now()
),

-- 5. 7-Eleven Downtown SLC — gas station, lower scorer
(
  'a1000000-0000-0000-0000-000000000005',
  'ChIJ7Eleven_Downtown_SLC005',
  '7-Eleven', 'gas_station',
  '205 E 400 S, Salt Lake City, UT 84111',
  40.7550, -111.8840,
  3.8, 280,
  false, false, false, false,
  '$',
  6.2, now()
),

-- 6. Fiiz Drinks Draper — soda shop, great reviews
(
  'a1000000-0000-0000-0000-000000000006',
  'ChIJFiiz_Draper_SLC006',
  'Fiiz Drinks', 'soda_shop',
  '11400 S Auto Mall Dr, Draper, UT 84020',
  40.5246, -111.8638,
  4.7, 560,
  true, true, true, true,
  '$',
  8.9, now()
),

-- 7. McDonald''s Cottonwood Heights — fast food
(
  'a1000000-0000-0000-0000-000000000007',
  'ChIJMcDonalds_Cottonwood_007',
  'McDonald''s', 'fast_food',
  '2360 E Fort Union Blvd, Cottonwood Heights, UT 84121',
  40.6958, -111.8154,
  3.9, 720,
  true, false, false, false,
  '$',
  6.8, now()
),

-- 8. Kum & Go — gas station, mid-range
(
  'a1000000-0000-0000-0000-000000000008',
  'ChIJKumAndGo_Holladay_008',
  'Kum & Go', 'gas_station',
  '4726 S 900 E, Salt Lake City, UT 84117',
  40.6680, -111.8538,
  4.0, 190,
  false, false, false, true,
  '$',
  null, null  -- Google-only, low confidence (< 100 reviews baseline)
),

-- 9. Chick-fil-A Sandy — fast food, foam cup + lime
(
  'a1000000-0000-0000-0000-000000000009',
  'ChIJChickFilA_Sandy_SLC009',
  'Chick-fil-A', 'fast_food',
  '10510 S State St, Sandy, UT 84070',
  40.5765, -111.8879,
  4.6, 980,
  true, false, true, false,
  '$$',
  8.2, now()
),

-- 10. Extra Mile — gas station, pebbled ice sleeper pick
(
  'a1000000-0000-0000-0000-000000000010',
  'ChIJExtraMile_Murray_SLC010',
  'Extra Mile', 'gas_station',
  '88 E 5900 S, Murray, UT 84107',
  40.6530, -111.8870,
  4.1, 95,
  false, true, false, true,
  '$',
  null, null  -- below confidence threshold, no in-app reviews yet
);


-- ─────────────────────────────────────────────────────────────────────────────
-- REVIEWS — enough on 3 locations to activate blended SipScores
-- (sip_score values above were hand-computed to match these reviews)
-- ─────────────────────────────────────────────────────────────────────────────

-- Swig (5 reviews — blended active)
insert into reviews (location_id, user_id, soda_type, score_crispiness, score_flavor, score_ice, score_cup, score_value, score_drivethu, score_lime, note) values
('a1000000-0000-0000-0000-000000000001', null, 'diet_coke', 5, 5, 5, 5, 4, 5, 5, 'Perfect Diet Coke every single time. The coconut lime is incredible.'),
('a1000000-0000-0000-0000-000000000001', null, 'diet_coke', 5, 4, 5, 5, 4, 4, 5, 'Pebble ice makes it — never going anywhere else'),
('a1000000-0000-0000-0000-000000000001', null, 'coke_zero', 4, 5, 5, 4, 5, 5, 4, 'Great carbonation on the Coke Zero, nice syrup ratio'),
('a1000000-0000-0000-0000-000000000001', null, 'diet_pepsi', 5, 4, 5, 5, 4, 5, null, 'Even the Diet Pepsi slaps here — that''s saying something'),
('a1000000-0000-0000-0000-000000000001', null, 'sprite', 4, 4, 4, 5, 5, 4, 5, 'Sprite with fresh lime, can''t be beat on a hot day');

-- Fiiz Drinks (4 reviews — blended active)
insert into reviews (location_id, user_id, soda_type, score_crispiness, score_flavor, score_ice, score_cup, score_value, score_drivethu, score_lime, note) values
('a1000000-0000-0000-0000-000000000006', null, 'diet_coke', 5, 5, 5, 4, 5, 5, 5, 'Fiiz does Diet Coke better than anyone in Draper'),
('a1000000-0000-0000-0000-000000000006', null, 'dr_pepper', 4, 5, 5, 4, 4, 5, null, 'Dr Pepper with cream — game changer'),
('a1000000-0000-0000-0000-000000000006', null, 'coke_zero', 5, 4, 4, 4, 5, 5, 4, 'Super crispy. Drive-thru line moves fast too.'),
('a1000000-0000-0000-0000-000000000006', null, 'diet_coke', 4, 5, 5, 5, 4, 4, 5, 'Best pebble ice in South SLC area');

-- Maverick Murray (3 reviews — blended just activated)
insert into reviews (location_id, user_id, soda_type, score_crispiness, score_flavor, score_ice, score_cup, score_value, score_drivethu, score_lime, note) values
('a1000000-0000-0000-0000-000000000003', null, 'diet_coke', 4, 4, 5, null, 4, null, null, 'Pebble ice is the move — carbonation holds up'),
('a1000000-0000-0000-0000-000000000003', null, 'diet_coke', 3, 4, 5, null, 5, null, 3, 'Good value, pebble ice saves it, no lime though'),
('a1000000-0000-0000-0000-000000000003', null, 'sprite', 4, 3, 5, null, 4, null, null, 'Sprite + pebble ice combo is underrated');
