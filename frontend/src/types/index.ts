export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  home_location?: string;
  work_location?: string;
  preferred_transport_modes?: string[];
  preferred_priority?: string;
  daily_budget_limit?: number;
  preferences?: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  transport_modes?: string[];
  budget_limit?: number;
  walking_distance?: number;
  transfer_tolerance?: number;
  accessibility_friendly?: boolean;
  air_conditioned_only?: boolean;
  avoid_crowded?: boolean;
}

export interface RouteStep {
  mode: string;
  from: string;
  to: string;
  duration: number;
  fare: number;
  distance?: number;
  line?: string;
  instructions?: string;
}

export interface Route {
  id?: string;
  steps: RouteStep[];
  total_fare: number;
  total_duration: number;
  transfers: number;
  walking_distance: number;
  co2_estimate: number;
  comfort_score: number;
}

export interface SavedTrip {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  route_data?: Route;
  preferences?: TripPreferences;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface TripHistory {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  route_data: Route;
  fare: number;
  duration: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  transport_modes: string[];
  created_at: string;
}

export interface TripPreferences {
  priority?: 'cheapest' | 'fastest' | 'fewest-transfers' | 'comfortable';
  transport_modes?: string[];
  budget_limit?: number;
  max_walking?: number;
  departure_time?: string;
  arrival_by?: string;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  monthly_limit: number;
  daily_limit?: number;
  weekly_limit?: number;
  created_at: string;
}

export interface BudgetSummary {
  total_spent: number;
  trip_count: number;
  avg_fare: number;
  daily_spending: DailySpending[];
  transport_breakdown: Record<string, number>;
  budget_goal?: BudgetGoal;
}

export interface DailySpending {
  date: string;
  total: number;
  trips: number;
}
