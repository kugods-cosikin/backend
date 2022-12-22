import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IPayload {
  userId: number;
}

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('access-token');
    if (!token) throw new Error('token is empty');

    const secret = process.env.JWT_TOKEN_SECRET;
    const payload = jwt.verify(token, secret) as IPayload;
    req.userId = payload.userId;
    next();
  } catch (err) {
    next(err);
  }
};
