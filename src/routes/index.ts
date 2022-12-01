import express from 'express';
import authRouter from '@/routes/auth';

const router = express.Router();

router.use('/auth', authRouter);

router.get('/', (req, res) => {
  res.send('Hello world');
});

export default router;
