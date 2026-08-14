import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', validate(refreshSchema), authController.refresh);

export default router;
