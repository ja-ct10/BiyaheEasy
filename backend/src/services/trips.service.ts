import { getSupabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { PlanTripInput, SaveTripInput } from '../validators/trips.validator';
import { RoutesService } from './routes.service';

export class TripsService {
  private supabase = getSupabase();
  private routesService = new RoutesService();

  async planTrip(input: PlanTripInput) {
    const routes = this.routesService.generateRoutes(
      input.origin,
      input.destination,
      input.preferences
    );

    return {
      origin: input.origin,
      destination: input.destination,
      routes,
    };
  }

  async saveTrip(userId: string, input: SaveTripInput) {
    const { data, error } = await this.supabase
      .from('saved_trips')
      .insert({
        user_id: userId,
        origin: input.origin,
        destination: input.destination,
        preferences: input.preferences,
        selected_route: input.selected_route || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Save trip error:', { error: error.message });
      throw new AppError('Failed to save trip', 500);
    }

    return data;
  }

  async getSavedTrips(userId: string) {
    const { data, error } = await this.supabase
      .from('saved_trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Get saved trips error:', { error: error.message });
      throw new AppError('Failed to fetch saved trips', 500);
    }

    return data || [];
  }

  async deleteTrip(userId: string, tripId: string) {
    const { data: existing } = await this.supabase
      .from('saved_trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new AppError('Trip not found or access denied', 404);
    }

    const { error } = await this.supabase
      .from('saved_trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Delete trip error:', { error: error.message });
      throw new AppError('Failed to delete trip', 500);
    }

    return { message: 'Trip deleted successfully' };
  }
}
