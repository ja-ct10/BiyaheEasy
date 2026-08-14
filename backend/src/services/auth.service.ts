import { getSupabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  private supabase = getSupabase();

  async register(input: RegisterInput) {
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
        },
      },
    });

    if (error) {
      logger.error('Registration error:', { error: error.message });
      throw new AppError(error.message, 400);
    }

    if (!data.user || !data.session) {
      throw new AppError('Registration failed. Please try again.', 500);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: input.full_name,
      },
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    };
  }

  async login(input: LoginInput) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      logger.error('Login error:', { error: error.message });
      throw new AppError('Invalid email or password', 401);
    }

    if (!data.user || !data.session) {
      throw new AppError('Login failed. Please try again.', 500);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
      },
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabase.auth.admin.signOut(accessToken);

    if (error) {
      // Try regular signout as fallback
      await this.supabase.auth.signOut();
    }

    return { message: 'Successfully logged out' };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      logger.error('Token refresh error:', { error: error.message });
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (!data.session) {
      throw new AppError('Failed to refresh token', 500);
    }

    return {
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    };
  }
}
