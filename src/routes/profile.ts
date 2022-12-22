import express from 'express';
import { TokenValidation } from '@/middlewares/jwt';
import * as profileController from '@/controllers/profile';

const router = express.Router();

router.get('/create', TokenValidation);
router.post('/create/apply', TokenValidation, profileController.create);
router.get('/edit', TokenValidation, profileController.validate);
router.put('/edit/apply', TokenValidation, profileController.edit);

export default router;
