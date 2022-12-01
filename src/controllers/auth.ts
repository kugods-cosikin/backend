import * as authService from '@/services/auth';
import { Request, Response, NextFunction } from 'express';
import { userAuthDto, tokenDto } from '@/interfaces/auth';
import JWT from 'jsonwebtoken';

export const login = async (
  req: Request<Record<string, never>, Record<string, never>, userAuthDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userData = req.body;
    const loginResult = await authService.login(userData);
    res.send(loginResult);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request<Record<string, never>,
    Record<string, never>, { refreshToken: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.send('logout success');
  } catch (err) {
    next(err);
  }
};
export const signup = async (
  req: Request<Record<string, never>, Record<string, never>, userAuthDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userData = req.body;
    const signUpResult = await authService.signup(userData);
    res.send(signUpResult);
  } catch (err) {
    next(err);
  }
};

export const getTokens = async (
  req: Request<Record<string, never>, Record<string, never>, tokenDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.body;
    const { userId } = JWT.decode(token.accessToken) as { userId: number };
    const newToken = await authService.getNewToken(
      userId,
      token.refreshToken,
      token.accessToken,
    );
    res.send(newToken);
  } catch (err) {
    next(err);
  }
};
