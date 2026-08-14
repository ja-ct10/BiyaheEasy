-- NOTE: Replace 'DEMO_USER_ID' with actual user UUID after registration

-- Sample saved trips
INSERT INTO public.saved_trips (id, user_id, origin, destination, route_data, preferences, tags, is_favorite) VALUES
(uuid_generate_v4(), 'DEMO_USER_ID', 'SM North EDSA, Quezon City', 'Ayala Center, Makati', 
  '{"steps":[{"mode":"walk","from":"SM North EDSA","to":"North Avenue MRT Station","duration":5,"fare":0},{"mode":"mrt","from":"North Avenue","to":"Ayala Station","duration":25,"fare":28},{"mode":"walk","from":"Ayala MRT Station","to":"Ayala Center","duration":8,"fare":0}],"total_fare":28,"total_duration":38,"transfers":0,"walking_distance":800,"co2_estimate":0.5,"comfort_score":7}'::jsonb,
  '{"priority":"fastest","transport_modes":["mrt","walk"]}'::jsonb,
  ARRAY['daily-commute', 'work'],
  true),

(uuid_generate_v4(), 'DEMO_USER_ID', 'Cubao, Quezon City', 'BGC, Taguig',
  '{"steps":[{"mode":"mrt","from":"Cubao MRT","to":"Ayala Station","duration":15,"fare":20},{"mode":"bus","from":"Ayala","to":"BGC Market Market","duration":20,"fare":15}],"total_fare":35,"total_duration":40,"transfers":1,"walking_distance":400,"co2_estimate":0.8,"comfort_score":6}'::jsonb,
  '{"priority":"cheapest","transport_modes":["mrt","bus"]}'::jsonb,
  ARRAY['meeting', 'bgc'],
  false),

(uuid_generate_v4(), 'DEMO_USER_ID', 'Monumento, Caloocan', 'Taft Avenue, Manila',
  '{"steps":[{"mode":"lrt1","from":"Monumento LRT","to":"EDSA Station","duration":12,"fare":20},{"mode":"walk","from":"EDSA LRT","to":"MRT Taft","duration":5,"fare":0},{"mode":"mrt","from":"Taft Avenue MRT","to":"Taft Avenue","duration":2,"fare":15}],"total_fare":35,"total_duration":19,"transfers":1,"walking_distance":300,"co2_estimate":0.4,"comfort_score":5}'::jsonb,
  '{"priority":"fastest","transport_modes":["lrt","mrt","walk"]}'::jsonb,
  ARRAY['school'],
  true);

-- Sample trip history (last 30 days of commutes)
INSERT INTO public.trip_history (id, user_id, origin, destination, route_data, fare, duration, status, transport_modes, created_at) VALUES
(uuid_generate_v4(), 'DEMO_USER_ID', 'SM North EDSA', 'Makati CBD', '{"steps":[{"mode":"mrt","from":"North Avenue","to":"Ayala","duration":25,"fare":28}]}'::jsonb, 28.00, 38, 'completed', ARRAY['mrt','walk'], NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Makati CBD', 'SM North EDSA', '{"steps":[{"mode":"mrt","from":"Ayala","to":"North Avenue","duration":25,"fare":28}]}'::jsonb, 28.00, 40, 'completed', ARRAY['mrt','walk'], NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Cubao', 'Ortigas Center', '{"steps":[{"mode":"mrt","from":"Cubao","to":"Ortigas","duration":5,"fare":15}]}'::jsonb, 15.00, 12, 'completed', ARRAY['mrt','walk'], NOW() - INTERVAL '2 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Quezon City', 'Manila', '{"steps":[{"mode":"jeepney","from":"QC","to":"Manila","duration":45,"fare":13}]}'::jsonb, 13.00, 50, 'completed', ARRAY['jeepney'], NOW() - INTERVAL '3 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Pasig', 'Makati', '{"steps":[{"mode":"jeepney","from":"Pasig","to":"Makati","duration":30,"fare":15}]}'::jsonb, 15.00, 35, 'completed', ARRAY['jeepney'], NOW() - INTERVAL '4 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'SM North EDSA', 'Ayala Center', '{"steps":[{"mode":"mrt","from":"North Avenue","to":"Ayala","duration":25,"fare":28}]}'::jsonb, 28.00, 38, 'completed', ARRAY['mrt','walk'], NOW() - INTERVAL '5 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Monumento', 'Taft Avenue', '{"steps":[{"mode":"lrt1","from":"Monumento","to":"EDSA","duration":12,"fare":20},{"mode":"mrt","from":"Taft","to":"Taft","duration":2,"fare":15}]}'::jsonb, 35.00, 19, 'completed', ARRAY['lrt','mrt'], NOW() - INTERVAL '6 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Cubao', 'BGC', '{"steps":[{"mode":"bus","from":"Cubao","to":"BGC","duration":35,"fare":25}]}'::jsonb, 25.00, 40, 'completed', ARRAY['bus'], NOW() - INTERVAL '7 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'Quezon Ave', 'Makati', '{"steps":[{"mode":"bus","from":"Quezon Ave","to":"Makati","duration":40,"fare":20}]}'::jsonb, 20.00, 45, 'completed', ARRAY['bus'], NOW() - INTERVAL '8 days'),
(uuid_generate_v4(), 'DEMO_USER_ID', 'SM North EDSA', 'Ayala Center', '{"steps":[{"mode":"mrt","from":"North Avenue","to":"Ayala","duration":25,"fare":28}]}'::jsonb, 28.00, 38, 'completed', ARRAY['mrt','walk'], NOW() - INTERVAL '10 days');

-- Sample budget goal
INSERT INTO public.budget_goals (id, user_id, monthly_limit, daily_limit) VALUES
(uuid_generate_v4(), 'DEMO_USER_ID', 3000.00, 150.00);
