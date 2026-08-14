import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../validators/profile.validator';

const router = Router();
const profileController = new ProfileController();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, validate(updateProfileSchema), profileController.updateProfile);

export default router;
