import { getSupabase } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { BudgetSummary } from '../types';

export class BudgetService {
  private supabase = getSupabase();

  async getSummary(userId: string, period: string = 'month'): Promise<BudgetSummary> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get trip history for the period
    const { data: trips, error: tripsError } = await this.supabase
      .from('trip_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (tripsError) {
      logger.error('Budget summary error:', { error: tripsError.message });
      throw new AppError('Failed to fetch budget summary', 500);
    }

    // Get budget goal
    const { data: goalData } = await this.supabase
      .from('budget_goals')
      .select('monthly_limit')
      .eq('user_id', userId)
      .single();

    const tripData = trips || [];
    const totalSpent = tripData.reduce((sum, trip) => sum + (trip.fare_paid || 0), 0);

    // Calculate category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    tripData.forEach((trip) => {
      if (trip.selected_route?.steps) {
        trip.selected_route.steps.forEach((step: { mode: string; fare: number }) => {
          if (step.mode !== 'walk') {
            const existing = categoryMap.get(step.mode) || { total: 0, count: 0 };
            existing.total += step.fare;
            existing.count += 1;
            categoryMap.set(step.mode, existing);
          }
        });
      }
    });

    const category_breakdown = Array.from(categoryMap.entries()).map(([mode, data]) => ({
      mode: mode as any,
      total: data.total,
      percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
      trip_count: data.count,
    }));

    // Calculate averages
    const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalSpent / daysInPeriod;

    // Weekly total (last 7 days)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weeklyTotal = tripData
      .filter((t) => new Date(t.created_at) >= weekStart)
      .reduce((sum, trip) => sum + (trip.fare_paid || 0), 0);

    const summary: BudgetSummary = {
      total_spent: totalSpent,
      daily_average: Math.round(dailyAverage * 100) / 100,
      weekly_total: weeklyTotal,
      monthly_total: totalSpent,
      category_breakdown,
      budget_goal: goalData?.monthly_limit,
      remaining: goalData?.monthly_limit ? goalData.monthly_limit - totalSpent : undefined,
    };

    return summary;
  }

  async setGoal(userId: string, monthlyLimit: number) {
    const { data: existing } = await this.supabase
      .from('budget_goals')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await this.supabase
        .from('budget_goals')
        .update({ monthly_limit: monthlyLimit, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Update budget goal error:', { error: error.message });
        throw new AppError('Failed to update budget goal', 500);
      }

      return data;
    }

    const { data, error } = await this.supabase
      .from('budget_goals')
      .insert({
        user_id: userId,
        monthly_limit: monthlyLimit,
      })
      .select()
      .single();

    if (error) {
      logger.error('Create budget goal error:', { error: error.message });
      throw new AppError('Failed to set budget goal', 500);
    }

    return data;
  }
}
