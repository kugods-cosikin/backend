import { Request, Response, NextFunction } from 'express';
import { profileDto } from '@/interfaces/profile';
import * as profileService from '@/services/profile';

export const create = async (
  req: Request<Record<string, never>, Record<string, never>, profileDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profileData = req.body;
    const fileData: Express.Multer.File = req.file;
    await profileService.create(req, profileData, fileData);
    res.status(200).send({ status: 200, data: null });
  } catch (err) {
    next(err);
  }
};
