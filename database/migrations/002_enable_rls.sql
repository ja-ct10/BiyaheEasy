-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Saved trips policies
CREATE POLICY "Users can view own saved trips"
  ON public.saved_trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved trips"
  ON public.saved_trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved trips"
  ON public.saved_trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved trips"
  ON public.saved_trips FOR DELETE
  USING (auth.uid() = user_id);

-- Trip history policies
CREATE POLICY "Users can view own trip history"
  ON public.trip_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trip history"
  ON public.trip_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Budget goals policies
CREATE POLICY "Users can view own budget goals"
  ON public.budget_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget goals"
  ON public.budget_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget goals"
  ON public.budget_goals FOR UPDATE
  USING (auth.uid() = user_id);
