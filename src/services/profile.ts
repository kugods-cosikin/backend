import { Request } from 'express';
import ProfileGuest from '@/entities/profile_guest';
import ProfileHostInfo from '@/entities/profile_host_info';
import ProfileHostTag from '@/entities/profile_host_tag';
import { fileDto, profileDto } from '@/interfaces/profile';
import AppDataSource from '@/config/app-data-source';

class ErrorWithStatus extends Error {
  status: number;

  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

export const validate = async (req: Request, profileData: profileDto) => {
  try {
    const {
      profileGuestId,
    } = profileData;

    const profileGuest = await AppDataSource.getRepository(ProfileGuest)
      .createQueryBuilder('profile_guest')
      .where('profile_guest.id = :id', { id: profileGuestId })
      .select([
        'profile_guest.id',
        'profile_guest.name',
        'profile_guest.username',
        'profile_guest.bio',
        'profile_guest.image',
        'profile_guest.userId',
        'profile_guest.isDeleted',
      ])
      .getOneOrFail();
    if (profileGuest === null || profileGuest.isDeleted) {
      throw new ErrorWithStatus('profile_not_exist', 404);
    }
    if (profileGuest.userId !== req.userId) {
      throw new ErrorWithStatus('forbidden_access', 403);
    }
  } catch (e) {
    if (e instanceof ErrorWithStatus) {
      throw e;
    } else if (e instanceof Error) {
      throw new ErrorWithStatus(e.message, 500);
    } else {
      throw new ErrorWithStatus(String(e), 500);
    }
  }

  return true;
};

export const create = async (req: Request, profileData: profileDto, fileData: fileDto) => {
  try {
    const {
      name, username, bio, type, github, stack,
    } = profileData;

    // TODO - upload profile image file to AWS S3 using fileData

    const newProfile = await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(ProfileGuest)
      .values({
        name,
        username,
        bio,
        image: '',
        userId: req.userId,
        isDeleted: false,
      })
      .execute();
    const profileGuestId = newProfile.identifiers[0].id as number;

    if (type === 'host') {
      await AppDataSource
        .createQueryBuilder()
        .insert()
        .into(ProfileHostInfo)
        .values({
          profileGuestId,
          github,
        })
        .execute();

      const promises = stack.map((tag) => AppDataSource
        .createQueryBuilder()
        .insert()
        .into(ProfileHostTag)
        .values({
          profileGuestId,
          tag,
        })
        .execute());

      await Promise.all(promises);
    }
  } catch (e) {
    if (e instanceof ErrorWithStatus) {
      throw e;
    } else if (e instanceof Error) {
      throw new ErrorWithStatus(e.message, 500);
    } else {
      throw new ErrorWithStatus(String(e), 500);
    }
  }

  return true;
};

export const edit = async (req: Request, profileData: profileDto, fileData: fileDto) => {
  try {
    const {
      profileGuestId, name, username, bio, github, stack,
    } = profileData;

    const profileGuest = await AppDataSource.getRepository(ProfileGuest)
      .createQueryBuilder('profile_guest')
      .where('profile_guest.id = :id', { id: profileGuestId })
      .select([
        'profile_guest.id',
        'profile_guest.name',
        'profile_guest.username',
        'profile_guest.bio',
        'profile_guest.image',
        'profile_guest.userId',
        'profile_guest.isDeleted',
      ])
      .getOneOrFail();
    if (profileGuest === null || profileGuest.isDeleted) {
      throw new ErrorWithStatus('profile_not_exist', 404);
    }
    if (profileGuest.userId !== req.userId) {
      throw new ErrorWithStatus('forbidden_access', 403);
    }

    // TODO - upload profile image file to AWS S3 using fileData

    await AppDataSource
      .createQueryBuilder()
      .update(ProfileGuest)
      .set({
        name,
        username,
        bio,
        image: '',
      })
      .where('id = :id', { id: profileGuestId })
      .execute();

    const profileHostInfo = await AppDataSource.getRepository(ProfileHostInfo)
      .createQueryBuilder('profile_host_info')
      .where('profile_host_info.profileGuestId = :id', { id: req.params.id })
      .select([
        'profile_host_info.profileGuestId',
        'profile_host_info.github',
        'profile_host_info.like',
        'profile_host_info.averageResponseTime',
      ])
      .getOneOrFail();

    if (profileHostInfo !== null) {
      await AppDataSource
        .createQueryBuilder()
        .update(ProfileHostInfo)
        .set({
          github,
        })
        .where('profile_guest_id = :id', { id: profileGuestId })
        .execute();

      await AppDataSource
        .createQueryBuilder()
        .delete()
        .from(ProfileHostTag)
        .where('profile_guest_id = :id', { id: profileGuestId })
        .execute();

      const promises = stack.map((tag) => AppDataSource
        .createQueryBuilder()
        .insert()
        .into(ProfileHostTag)
        .values({
          profileGuestId,
          tag,
        })
        .execute());

      await Promise.all(promises);
    }
  } catch (e) {
    if (e instanceof ErrorWithStatus) {
      throw e;
    } else if (e instanceof Error) {
      throw new ErrorWithStatus(e.message, 500);
    } else {
      throw new ErrorWithStatus(String(e), 500);
    }
  }

  return true;
};
