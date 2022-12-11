import * as authController from '@/controllers/auth';
import express from 'express';
import { TokenValidation } from '@/middlewares/jwt';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', TokenValidation, authController.logout);
router.post('/token', authController.getTokens);

export default router;
