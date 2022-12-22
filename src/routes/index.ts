import express from 'express';
import authRouter from '@/routes/auth';
import profileRouter from '@/routes/profile';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);

router.get('/', (req, res) => {
  res.send('Hello world');
});

export default router;
