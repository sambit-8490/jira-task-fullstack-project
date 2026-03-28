import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { loginRateLimiter, registerRateLimiter, refreshRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/register', registerRateLimiter, authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh', refreshRateLimiter, authController.refresh);
router.post('/logout', authController.logout);

export default router;
