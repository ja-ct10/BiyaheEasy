import { Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const budgetService = new BudgetService();

export class BudgetController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const period = (req.query.period as string) || 'month';
      const summary = await budgetService.getSummary(userId, period);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async setGoal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { monthly_limit } = req.body;
      const goal = await budgetService.setGoal(userId, monthly_limit);
      sendSuccess(res, goal, 'Budget goal set successfully');
    } catch (error) {
      next(error);
    }
  }
}
