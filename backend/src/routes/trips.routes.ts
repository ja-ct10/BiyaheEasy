import { Router } from 'express';
import { TripsController } from '../controllers/trips.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { planTripSchema, saveTripSchema } from '../validators/trips.validator';

const router = Router();
const tripsController = new TripsController();

router.post('/plan', authMiddleware, validate(planTripSchema), tripsController.plan);
router.post('/save', authMiddleware, validate(saveTripSchema), tripsController.save);
router.get('/saved', authMiddleware, tripsController.getSaved);
router.delete('/:id', authMiddleware, tripsController.delete);

export default router;
