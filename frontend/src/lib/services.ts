import { supabase } from './supabase';
import { api } from './api';
import type { SavedTrip, TripHistory, TripPreferences, Route, BudgetGoal, User } from '@/types';

// ============================================
// AUTH TOKEN HELPER
// ============================================

async function getToken(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

// ============================================
// TRIPS SERVICE
// ============================================

export const tripsService = {
  async getSavedTrips(): Promise<SavedTrip[]> {
    const { data, error } = await supabase
      .from('saved_trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async saveTrip(trip: {
    origin: string;
    destination: string;
    route_data?: Route;
    preferences?: TripPreferences;
    tags?: string[];
  }): Promise<SavedTrip> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('saved_trips')
      .insert({
        user_id: user.id,
        origin: trip.origin,
        destination: trip.destination,
        route_data: trip.route_data || null,
        preferences: trip.preferences || {},
        tags: trip.tags || [],
        is_favorite: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteTrip(tripId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_trips')
      .delete()
      .eq('id', tripId);

    if (error) throw new Error(error.message);
  },

  async toggleFavorite(tripId: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('saved_trips')
      .update({ is_favorite: isFavorite })
      .eq('id', tripId);

    if (error) throw new Error(error.message);
  },

  async getTripHistory(): Promise<TripHistory[]> {
    const { data, error } = await supabase
      .from('trip_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async addToHistory(entry: {
    origin: string;
    destination: string;
    route_data: Route;
    fare: number;
    duration: number;
    transport_modes: string[];
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('trip_history')
      .insert({
        user_id: user.id,
        origin: entry.origin,
        destination: entry.destination,
        route_data: entry.route_data,
        fare: entry.fare,
        duration: entry.duration,
        transport_modes: entry.transport_modes,
        status: 'completed',
      });

    if (error) throw new Error(error.message);
  },
};

// ============================================
// ROUTES SERVICE (uses backend API for generation)
// ============================================

export interface RouteGenerationResult {
  origin: string;
  destination: string;
  preferred: Route[];
  other_suggestions: Route[];
  routes: Route[];
}

export const routesService = {
  async generateRoutes(
    origin: string,
    destination: string,
    preferences: TripPreferences
  ): Promise<RouteGenerationResult> {
    const token = await getToken();
    const response = await api<RouteGenerationResult>(
      '/api/routes/generate',
      {
        method: 'POST',
        body: { origin, destination, preferences },
        token,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate routes');
    }

    return response.data;
  },
};

// ============================================
// BUDGET SERVICE
// ============================================

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

export const budgetService = {
  async getSummary(period: BudgetPeriod = 'monthly'): Promise<{
    totalSpent: number;
    tripCount: number;
    avgFare: number;
    budgetGoal?: BudgetGoal;
    remaining?: number;
    dailyAverage: number;
    weeklyTotal: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly': {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const { data: trips, error: tripsError } = await supabase
      .from('trip_history')
      .select('fare, duration, transport_modes, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed');

    if (tripsError) throw new Error(tripsError.message);

    // Get budget goal
    const { data: goal } = await supabase
      .from('budget_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const tripData = trips || [];
    const totalSpent = tripData.reduce((sum, t) => sum + Number(t.fare), 0);
    const tripCount = tripData.length;
    const avgFare = tripCount > 0 ? totalSpent / tripCount : 0;

    // Calculate daily average
    const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalSpent / daysInPeriod;

    // Weekly total (last 7 days from today)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weeklyTotal = tripData
      .filter((t) => new Date(t.created_at) >= weekStart)
      .reduce((sum, t) => sum + Number(t.fare), 0);

    // Determine budget limit based on period
    let budgetLimit: number | undefined;
    if (goal) {
      switch (period) {
        case 'daily':
          budgetLimit = goal.daily_limit || (goal.monthly_limit / 30);
          break;
        case 'weekly':
          budgetLimit = goal.monthly_limit / 4;
          break;
        case 'monthly':
        default:
          budgetLimit = goal.monthly_limit;
          break;
      }
    }

    return {
      totalSpent,
      tripCount,
      avgFare,
      dailyAverage,
      weeklyTotal,
      budgetGoal: goal || undefined,
      remaining: budgetLimit ? budgetLimit - totalSpent : undefined,
    };
  },

  async setBudgetGoal(monthlyLimit: number, dailyLimit?: number): Promise<BudgetGoal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert budget goal
    const { data: existing } = await supabase
      .from('budget_goals')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('budget_goals')
        .update({ monthly_limit: monthlyLimit, daily_limit: dailyLimit })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const { data, error } = await supabase
      .from('budget_goals')
      .insert({ user_id: user.id, monthly_limit: monthlyLimit, daily_limit: dailyLimit })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getWeeklyBreakdown(): Promise<{ label: string; amount: number }[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: trips } = await supabase
      .from('trip_history')
      .select('fare, created_at')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (!trips || trips.length === 0) return [];

    // Group by week
    const weeks: Record<string, number> = {};
    trips.forEach((trip) => {
      const tripDate = new Date(trip.created_at);
      const weekNum = Math.ceil(tripDate.getDate() / 7);
      const key = `W${weekNum}`;
      weeks[key] = (weeks[key] || 0) + Number(trip.fare);
    });

    return Object.entries(weeks).map(([label, amount]) => ({ label, amount }));
  },

  async getDailyBreakdown(): Promise<{ label: string; amount: number }[]> {
    const now = new Date();
    // Last 7 days
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const { data: trips } = await supabase
      .from('trip_history')
      .select('fare, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (!trips || trips.length === 0) return [];

    // Group by day
    const days: Record<string, number> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    trips.forEach((trip) => {
      const tripDate = new Date(trip.created_at);
      const key = dayNames[tripDate.getDay()];
      days[key] = (days[key] || 0) + Number(trip.fare);
    });

    // Ensure all 7 days are represented
    const result: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayNames[d.getDay()];
      result.push({ label: key, amount: days[key] || 0 });
    }

    return result;
  },

  async getTransportBreakdown(): Promise<{ mode: string; amount: number; trips: number }[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: trips } = await supabase
      .from('trip_history')
      .select('fare, transport_modes')
      .gte('created_at', startOfMonth)
      .eq('status', 'completed');

    if (!trips || trips.length === 0) return [];

    const modeMap: Record<string, { amount: number; trips: number }> = {};
    trips.forEach((trip) => {
      const modes = trip.transport_modes || [];
      const farePerMode = Number(trip.fare) / Math.max(modes.length, 1);
      modes.forEach((mode: string) => {
        if (!modeMap[mode]) modeMap[mode] = { amount: 0, trips: 0 };
        modeMap[mode].amount += farePerMode;
        modeMap[mode].trips += 1;
      });
    });

    return Object.entries(modeMap).map(([mode, data]) => ({
      mode,
      amount: Math.round(data.amount),
      trips: data.trips,
    }));
  },
};

// ============================================
// PROFILE SERVICE
// ============================================

export const profileService = {
  async getProfile(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data;
  },

  async updateProfile(updates: {
    full_name?: string;
    home_location?: string;
    work_location?: string;
    avatar_url?: string;
    preferred_transport_modes?: string[];
    preferred_priority?: string;
    daily_budget_limit?: number;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
  },

  async uploadAvatar(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new avatar URL
    await profileService.updateProfile({ avatar_url: publicUrl });

    return publicUrl;
  },
};
