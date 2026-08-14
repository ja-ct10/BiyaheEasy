import { z } from 'zod';

export const budgetGoalSchema = z.object({
  monthly_limit: z.number().positive('Monthly limit must be positive').max(100000),
});

export const budgetSummaryQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).optional().default('month'),
});

export type BudgetGoalInput = z.infer<typeof budgetGoalSchema>;
export type BudgetSummaryQuery = z.infer<typeof budgetSummaryQuerySchema>;
