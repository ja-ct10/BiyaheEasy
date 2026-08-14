import { getSupabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { Route, TripPreferences } from '../types';

interface RouteTemplate {
  origin: string;
  destination: string;
  routes: Omit<Route, 'id'>[];
}

// Realistic Philippine commute route data
const ROUTE_DATABASE: RouteTemplate[] = [
  {
    origin: 'quezon city',
    destination: 'makati',
    routes: [
      {
        steps: [
          { mode: 'jeepney', from: 'Quezon City', to: 'North Avenue MRT Station', fare: 13, duration: 10, instructions: 'Take jeepney along Commonwealth to North Ave' },
          { mode: 'mrt', from: 'North Avenue', to: 'Ayala Station', fare: 28, duration: 25, instructions: 'Take MRT-3 southbound to Ayala' },
          { mode: 'walk', from: 'Ayala MRT Station', to: 'Makati CBD', fare: 0, duration: 8, instructions: 'Walk to Ayala Avenue' },
        ],
        total_fare: 41,
        total_duration: 43,
        transfers: 2,
        walking_distance: 500,
        co2_estimate: 0.8,
        comfort_score: 6,
      },
      {
        steps: [
          { mode: 'bus', from: 'Quezon City', to: 'EDSA-Ayala', fare: 35, duration: 45, instructions: 'Take EDSA bus from QC to Ayala' },
          { mode: 'walk', from: 'EDSA-Ayala Bus Stop', to: 'Makati CBD', fare: 0, duration: 5, instructions: 'Walk to destination' },
        ],
        total_fare: 35,
        total_duration: 50,
        transfers: 1,
        walking_distance: 300,
        co2_estimate: 1.2,
        comfort_score: 5,
      },
      {
        steps: [
          { mode: 'uv_express', from: 'Quezon City', to: 'Makati', fare: 45, duration: 35, instructions: 'Take UV Express from QC to Makati via EDSA' },
        ],
        total_fare: 45,
        total_duration: 35,
        transfers: 0,
        walking_distance: 100,
        co2_estimate: 1.0,
        comfort_score: 7,
      },
    ],
  },
  {
    origin: 'manila',
    destination: 'bgc',
    routes: [
      {
        steps: [
          { mode: 'bus', from: 'Manila City Hall', to: 'Ayala MRT', fare: 25, duration: 30, instructions: 'Take bus along EDSA' },
          { mode: 'bus', from: 'Ayala', to: 'BGC', fare: 15, duration: 15, instructions: 'Take BGC Bus from Ayala to BGC' },
          { mode: 'walk', from: 'BGC Bus Stop', to: 'BGC', fare: 0, duration: 5, instructions: 'Walk to final destination' },
        ],
        total_fare: 40,
        total_duration: 50,
        transfers: 2,
        walking_distance: 350,
        co2_estimate: 1.5,
        comfort_score: 5,
      },
      {
        steps: [
          { mode: 'jeepney', from: 'Manila', to: 'Taft LRT Station', fare: 13, duration: 12, instructions: 'Take jeepney to Taft Ave' },
          { mode: 'lrt', from: 'Taft Avenue', to: 'EDSA Station', fare: 20, duration: 10, instructions: 'Take LRT-1 to EDSA' },
          { mode: 'mrt', from: 'EDSA-Taft', to: 'Ayala', fare: 16, duration: 8, instructions: 'Transfer to MRT-3 northbound' },
          { mode: 'bus', from: 'Ayala', to: 'BGC', fare: 15, duration: 15, instructions: 'Take BGC Bus' },
        ],
        total_fare: 64,
        total_duration: 45,
        transfers: 3,
        walking_distance: 600,
        co2_estimate: 0.9,
        comfort_score: 4,
      },
      {
        steps: [
          { mode: 'grab', from: 'Manila', to: 'BGC', fare: 250, duration: 30, instructions: 'Book Grab ride to BGC' },
        ],
        total_fare: 250,
        total_duration: 30,
        transfers: 0,
        walking_distance: 0,
        co2_estimate: 2.5,
        comfort_score: 9,
      },
    ],
  },
  {
    origin: 'pasig',
    destination: 'ortigas',
    routes: [
      {
        steps: [
          { mode: 'jeepney', from: 'Pasig', to: 'Ortigas Center', fare: 13, duration: 15, instructions: 'Take jeepney along C-5/Ortigas Ave' },
        ],
        total_fare: 13,
        total_duration: 15,
        transfers: 0,
        walking_distance: 100,
        co2_estimate: 0.4,
        comfort_score: 5,
      },
      {
        steps: [
          { mode: 'tricycle', from: 'Pasig', to: 'Shaw MRT Station', fare: 30, duration: 10, instructions: 'Take tricycle to Shaw Blvd MRT' },
          { mode: 'mrt', from: 'Shaw Boulevard', to: 'Ortigas', fare: 13, duration: 3, instructions: 'Take MRT-3 one stop to Ortigas' },
          { mode: 'walk', from: 'Ortigas MRT', to: 'Ortigas Center', fare: 0, duration: 5, instructions: 'Walk to destination' },
        ],
        total_fare: 43,
        total_duration: 18,
        transfers: 2,
        walking_distance: 300,
        co2_estimate: 0.5,
        comfort_score: 6,
      },
      {
        steps: [
          { mode: 'bus', from: 'Pasig Blvd', to: 'Ortigas', fare: 15, duration: 20, instructions: 'Take city bus to Ortigas' },
          { mode: 'walk', from: 'Bus Stop', to: 'Ortigas Center', fare: 0, duration: 3, instructions: 'Short walk' },
        ],
        total_fare: 15,
        total_duration: 23,
        transfers: 1,
        walking_distance: 200,
        co2_estimate: 0.6,
        comfort_score: 5,
      },
    ],
  },
  {
    origin: 'cubao',
    destination: 'ayala',
    routes: [
      {
        steps: [
          { mode: 'mrt', from: 'Cubao-Araneta', to: 'Ayala', fare: 24, duration: 18, instructions: 'Take MRT-3 southbound from Araneta Center-Cubao to Ayala' },
          { mode: 'walk', from: 'Ayala MRT', to: 'Ayala Center', fare: 0, duration: 5, instructions: 'Walk to Glorietta/Greenbelt' },
        ],
        total_fare: 24,
        total_duration: 23,
        transfers: 1,
        walking_distance: 350,
        co2_estimate: 0.3,
        comfort_score: 6,
      },
      {
        steps: [
          { mode: 'bus', from: 'Cubao EDSA', to: 'Ayala EDSA', fare: 30, duration: 35, instructions: 'Take EDSA carousel bus southbound' },
          { mode: 'walk', from: 'Ayala Bus Stop', to: 'Ayala Center', fare: 0, duration: 5, instructions: 'Walk to destination' },
        ],
        total_fare: 30,
        total_duration: 40,
        transfers: 1,
        walking_distance: 400,
        co2_estimate: 1.0,
        comfort_score: 5,
      },
      {
        steps: [
          { mode: 'uv_express', from: 'Cubao', to: 'Makati-Ayala', fare: 40, duration: 28, instructions: 'Take UV Express van from Cubao to Makati' },
          { mode: 'walk', from: 'UV Drop-off', to: 'Ayala Center', fare: 0, duration: 3, instructions: 'Walk to destination' },
        ],
        total_fare: 40,
        total_duration: 31,
        transfers: 1,
        walking_distance: 200,
        co2_estimate: 0.9,
        comfort_score: 7,
      },
    ],
  },
  {
    origin: 'monumento',
    destination: 'taft',
    routes: [
      {
        steps: [
          { mode: 'lrt', from: 'Monumento LRT-1', to: 'Doroteo Jose', fare: 20, duration: 18, instructions: 'Take LRT-1 southbound' },
          { mode: 'walk', from: 'Doroteo Jose', to: 'Recto LRT-2', fare: 0, duration: 3, instructions: 'Transfer walkway to LRT-2' },
          { mode: 'lrt', from: 'Recto LRT-2', to: 'Taft Avenue (via transfer)', fare: 15, duration: 5, instructions: 'Continue on LRT-1 to Taft' },
        ],
        total_fare: 35,
        total_duration: 26,
        transfers: 2,
        walking_distance: 200,
        co2_estimate: 0.3,
        comfort_score: 6,
      },
      {
        steps: [
          { mode: 'lrt', from: 'Monumento', to: 'Taft Avenue', fare: 25, duration: 30, instructions: 'Take LRT-1 southbound all the way to Taft' },
        ],
        total_fare: 25,
        total_duration: 30,
        transfers: 0,
        walking_distance: 100,
        co2_estimate: 0.2,
        comfort_score: 6,
      },
      {
        steps: [
          { mode: 'bus', from: 'Monumento', to: 'Taft Avenue', fare: 20, duration: 40, instructions: 'Take bus along Rizal Avenue / Taft' },
        ],
        total_fare: 20,
        total_duration: 40,
        transfers: 0,
        walking_distance: 150,
        co2_estimate: 1.5,
        comfort_score: 4,
      },
      {
        steps: [
          { mode: 'jeepney', from: 'Monumento', to: 'Quiapo', fare: 13, duration: 15, instructions: 'Take jeepney to Quiapo' },
          { mode: 'jeepney', from: 'Quiapo', to: 'Taft Avenue', fare: 13, duration: 15, instructions: 'Transfer to Taft-bound jeepney' },
        ],
        total_fare: 26,
        total_duration: 30,
        transfers: 1,
        walking_distance: 200,
        co2_estimate: 0.8,
        comfort_score: 4,
      },
    ],
  },
];

export class RoutesService {
  private supabase = getSupabase();

  generateRoutes(origin: string, destination: string, preferences: TripPreferences): Route[] {
    const normalizedOrigin = origin.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();

    // Find matching route template
    let template = ROUTE_DATABASE.find(
      (r) =>
        normalizedOrigin.includes(r.origin) || r.origin.includes(normalizedOrigin) &&
        normalizedDest.includes(r.destination) || r.destination.includes(normalizedDest)
    );

    // Try reverse match
    if (!template) {
      template = ROUTE_DATABASE.find(
        (r) =>
          (normalizedOrigin.includes(r.destination) || r.destination.includes(normalizedOrigin)) &&
          (normalizedDest.includes(r.origin) || r.origin.includes(normalizedDest))
      );

      if (template) {
        // Reverse the routes
        return this.reverseAndAssignIds(template.routes, preferences);
      }
    }

    if (!template) {
      // Generate dynamic routes for unknown origin/destination pairs
      return this.generateDynamicRoutes(origin, destination, preferences);
    }

    let routes = template.routes.map((route) => ({
      ...route,
      id: this.generateId(),
    }));

    // Filter by transport modes
    if (preferences.transport_modes.length > 0) {
      routes = routes.filter((route) =>
        route.steps.some(
          (step) =>
            preferences.transport_modes.includes(step.mode) || step.mode === 'walk'
        )
      );
    }

    // Filter by budget
    if (preferences.budget_limit) {
      routes = routes.filter((route) => route.total_fare <= preferences.budget_limit!);
    }

    // Sort by priority
    routes = this.sortByPriority(routes, preferences.priority);

    // Return at least 1, at most 5
    return routes.length > 0 ? routes.slice(0, 5) : this.generateDynamicRoutes(origin, destination, preferences);
  }

  async getHistory(userId: string) {
    const { data, error } = await this.supabase
      .from('trip_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('Get route history error:', { error: error.message });
      throw new AppError('Failed to fetch route history', 500);
    }

    return data || [];
  }

  private reverseAndAssignIds(routes: Omit<Route, 'id'>[], preferences: TripPreferences): Route[] {
    let result = routes.map((route) => ({
      ...route,
      id: this.generateId(),
      steps: [...route.steps].reverse().map((step) => ({
        ...step,
        from: step.to,
        to: step.from,
      })),
    }));

    if (preferences.budget_limit) {
      result = result.filter((r) => r.total_fare <= preferences.budget_limit!);
    }

    return this.sortByPriority(result, preferences.priority).slice(0, 5);
  }

  private generateDynamicRoutes(origin: string, destination: string, preferences: TripPreferences): Route[] {
    const routes: Route[] = [
      {
        id: this.generateId(),
        steps: [
          { mode: 'jeepney', from: origin, to: `${origin} Terminal`, fare: 13, duration: 10, instructions: `Take jeepney from ${origin}` },
          { mode: 'mrt', from: `${origin} Terminal`, to: `${destination} Station`, fare: 25, duration: 20, instructions: 'Take MRT/LRT to nearest station' },
          { mode: 'walk', from: `${destination} Station`, to: destination, fare: 0, duration: 8, instructions: `Walk to ${destination}` },
        ],
        total_fare: 38,
        total_duration: 38,
        transfers: 2,
        walking_distance: 500,
        co2_estimate: 0.7,
        comfort_score: 6,
      },
      {
        id: this.generateId(),
        steps: [
          { mode: 'bus', from: origin, to: destination, fare: 30, duration: 45, instructions: `Take bus from ${origin} to ${destination}` },
          { mode: 'walk', from: 'Bus Stop', to: destination, fare: 0, duration: 5, instructions: 'Walk to final destination' },
        ],
        total_fare: 30,
        total_duration: 50,
        transfers: 1,
        walking_distance: 300,
        co2_estimate: 1.2,
        comfort_score: 5,
      },
      {
        id: this.generateId(),
        steps: [
          { mode: 'uv_express', from: origin, to: destination, fare: 45, duration: 30, instructions: `Take UV Express from ${origin} to ${destination}` },
        ],
        total_fare: 45,
        total_duration: 30,
        transfers: 0,
        walking_distance: 100,
        co2_estimate: 1.0,
        comfort_score: 7,
      },
      {
        id: this.generateId(),
        steps: [
          { mode: 'jeepney', from: origin, to: 'Transfer Point', fare: 15, duration: 15, instructions: `Take jeepney from ${origin}` },
          { mode: 'jeepney', from: 'Transfer Point', to: destination, fare: 15, duration: 15, instructions: `Transfer to ${destination}-bound jeepney` },
        ],
        total_fare: 30,
        total_duration: 30,
        transfers: 1,
        walking_distance: 150,
        co2_estimate: 0.6,
        comfort_score: 4,
      },
    ];

    let filtered = routes;

    if (preferences.budget_limit) {
      filtered = filtered.filter((r) => r.total_fare <= preferences.budget_limit!);
    }

    return this.sortByPriority(filtered.length > 0 ? filtered : routes, preferences.priority);
  }

  private sortByPriority(routes: Route[], priority: string): Route[] {
    switch (priority) {
      case 'fastest':
        return routes.sort((a, b) => a.total_duration - b.total_duration);
      case 'cheapest':
        return routes.sort((a, b) => a.total_fare - b.total_fare);
      case 'least_transfers':
        return routes.sort((a, b) => a.transfers - b.transfers);
      case 'most_comfortable':
        return routes.sort((a, b) => b.comfort_score - a.comfort_score);
      default:
        return routes;
    }
  }

  private generateId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
