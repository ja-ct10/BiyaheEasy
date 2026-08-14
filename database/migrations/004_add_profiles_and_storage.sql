-- Create profiles table (separate from auth-linked users for extensibility)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  home_location TEXT,
  work_location TEXT,
  preferred_transport_modes TEXT[] DEFAULT '{}',
  preferred_priority TEXT DEFAULT 'fastest',
  daily_budget_limit DECIMAL(10,2),
  monthly_budget_limit DECIMAL(10,2),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add daily_limit to budget_goals if not exists
ALTER TABLE public.budget_goals 
  ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS weekly_limit DECIMAL(10,2);

-- Add preferred_budget to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_transport_modes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_priority TEXT DEFAULT 'fastest',
  ADD COLUMN IF NOT EXISTS daily_budget_limit DECIMAL(10,2);

-- Updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
