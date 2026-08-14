import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  home_location?: string;
  work_location?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  preferred_modes: TransportMode[];
  budget_limit?: number;
  priority: RoutePriority;
  avoid_walking_over?: number;
}

export type TransportMode = 'mrt' | 'lrt' | 'bus' | 'jeepney' | 'uv_express' | 'tricycle' | 'walk' | 'grab';
export type RoutePriority = 'fastest' | 'cheapest' | 'least_transfers' | 'most_comfortable';

export interface Trip {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  preferences: TripPreferences;
  selected_route?: Route;
  created_at: string;
}

export interface TripPreferences {
  transport_modes: TransportMode[];
  budget_limit?: number;
  priority: RoutePriority;
}

export interface Route {
  id: string;
  steps: RouteStep[];
  total_fare: number;
  total_duration: number;
  transfers: number;
  walking_distance: number;
  co2_estimate: number;
  comfort_score: number;
}

export interface RouteStep {
  mode: TransportMode;
  from: string;
  to: string;
  fare: number;
  duration: number;
  distance?: number;
  instructions?: string;
}

export interface BudgetSummary {
  total_spent: number;
  daily_average: number;
  weekly_total: number;
  monthly_total: number;
  category_breakdown: CategoryBreakdown[];
  budget_goal?: number;
  remaining?: number;
}

export interface CategoryBreakdown {
  mode: TransportMode;
  total: number;
  percentage: number;
  trip_count: number;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface RouteGenerationRequest {
  origin: string;
  destination: string;
  preferences: TripPreferences;
}

export interface TripHistoryEntry {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  selected_route: Route;
  fare_paid: number;
  created_at: string;
}
