import { Router } from 'express';
import { RoutesController } from '../controllers/routes.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateRouteSchema } from '../validators/routes.validator';

const router = Router();
const routesController = new RoutesController();

router.post('/generate', authMiddleware, validate(generateRouteSchema), routesController.generate);
router.get('/history', authMiddleware, routesController.getHistory);

export default router;
