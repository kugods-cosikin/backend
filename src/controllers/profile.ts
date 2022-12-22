import { Request, Response, NextFunction } from 'express';
import { profileDto } from '@/interfaces/profile';
import * as profileService from '@/services/profile';

class ErrorWithStatus extends Error {
  status: number;

  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

export const validate = async (
  req: Request<Record<string, never>, Record<string, never>, profileDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profileData = req.body;
    await profileService.validate(req, profileData);
    res.status(200).send({ status: 200, data: null });
  } catch (err) {
    if (err instanceof ErrorWithStatus) {
      res.status(err.status).send({ status: err.status, message: err.message });
    } else if (err instanceof Error) {
      res.status(500).send({ status: 500, message: err.message });
    } else {
      res.status(500).send({ status: 500, message: String(err) });
    }
  }
};

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
    if (err instanceof ErrorWithStatus) {
      res.status(err.status).send({ status: err.status, message: err.message });
    } else if (err instanceof Error) {
      res.status(500).send({ status: 500, message: err.message });
    } else {
      res.status(500).send({ status: 500, message: String(err) });
    }
  }
};

export const edit = async (
  req: Request<Record<string, never>, Record<string, never>, profileDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profileData = req.body;
    const fileData: Express.Multer.File = req.file;
    await profileService.edit(req, profileData, fileData);
    res.status(200).send({ status: 200, data: null });
  } catch (err) {
    if (err instanceof ErrorWithStatus) {
      res.status(err.status).send({ status: err.status, message: err.message });
    } else if (err instanceof Error) {
      res.status(500).send({ status: 500, message: err.message });
    } else {
      res.status(500).send({ status: 500, message: String(err) });
    }
  }
};
