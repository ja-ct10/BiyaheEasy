import { getSupabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { UpdateProfileInput } from '../validators/profile.validator';

export class ProfileService {
  private supabase = getSupabase();

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, try to get from auth
      const { data: authUser } = await this.supabase.auth.admin.getUserById(userId);

      if (authUser?.user) {
        return {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || '',
          avatar_url: null,
          home_location: null,
          work_location: null,
          preferences: null,
          created_at: authUser.user.created_at,
        };
      }

      logger.error('Get profile error:', { error: error.message });
      throw new AppError('Profile not found', 404);
    }

    return data;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.full_name !== undefined) updateData.full_name = input.full_name;
    if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url;
    if (input.home_location !== undefined) updateData.home_location = input.home_location;
    if (input.work_location !== undefined) updateData.work_location = input.work_location;
    if (input.preferences !== undefined) updateData.preferences = input.preferences;

    // Upsert profile
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updateData,
      })
      .select()
      .single();

    if (error) {
      logger.error('Update profile error:', { error: error.message });
      throw new AppError('Failed to update profile', 500);
    }

    return data;
  }
}
