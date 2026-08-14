import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { budgetGoalSchema } from '../validators/budget.validator';

const router = Router();
const budgetController = new BudgetController();

router.get('/summary', authMiddleware, budgetController.getSummary);
router.post('/goal', authMiddleware, validate(budgetGoalSchema), budgetController.setGoal);

export default router;
