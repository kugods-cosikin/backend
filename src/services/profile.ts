import { Request } from 'express';
import ProfileGuest from '@/entities/profile_guest';
import ProfileHostGithub from '@/entities/profile_host_github';
import ProfileHostTag from '@/entities/profile_host_tag';
import { fileDto, profileDetailDto, profileDto } from '@/interfaces/profile';
import AppDataSource from '@/config/app-data-source';
import jwt from 'jsonwebtoken';
import User from '@/entities/user';
import { IPayload } from '@/middlewares/jwt';

export const create = async (req: Request, profileData: profileDto, fileData: fileDto) => {
  const { name, username, bio, type, github, stack } = profileData;

  // TODO - upload profile image file to AWS S3 using fileData

  const newProfile = await AppDataSource.createQueryBuilder()
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
    .returning('id')
    .execute();
  const { profileGuestId } = newProfile.raw as { profileGuestId: number };

  if (type === 'host') {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(ProfileHostGithub)
      .values({
        profileGuestId,
        github,
      })
      .execute();

    const promises = stack.map((tag) =>
      AppDataSource.createQueryBuilder()
        .insert()
        .into(ProfileHostTag)
        .values({
          profileGuestId,
          tag,
        })
        .execute()
    );

    await Promise.all(promises);
  }

  return true;
};

export const view = async (req: Request) => {
  /*
    View Profile Detail Service
  */
  // TODO : 평균응답시간, 좋아요, 채팅방 개수 추가

  const getProfileGuest = async () => {
    try {
      const profileGuest = await AppDataSource.getRepository(ProfileGuest)
        .createQueryBuilder('profile_guest')
        .where('profile_guest.id = :id', { id: req.params.id })
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
      if (profileGuest.isDeleted) {
        raiseError('This user is deleted', 404);
      }
      return profileGuest;
    } catch (err) {
      raiseError(err.message, 400);
    }
  };

  const getEmailFromUser = async (userId: number) => {
    try {
      return await AppDataSource.getRepository(User)
        .createQueryBuilder('user')
        .where('user.userId = :id', { id: userId })
        .select(['user.email'])
        .getOneOrFail();
    } catch (err) {
      raiseError(err.message, 400);
    }
  };

  const getProfileHostGithub = async (id: number) => {
    return await AppDataSource.getRepository(ProfileHostGithub)
      .createQueryBuilder('profile_host_github')
      .where('profile_host_github.profile_guest_id = :id', { id: id })
      .select(['profile_host_github.github'])
      .getOne();
  };

  const getProfileHostTags = async (id: number) => {
    return await AppDataSource.getRepository(ProfileHostTag)
      .createQueryBuilder('profile_host_tag')
      .where('profile_host_tag.profile_guest_id = :id', { id: id })
      .select(['profile_host_tag.tag'])
      .getMany();
  };

  const getIsOwner = async (req: Request, userId: number) => {
    const token = req.header('access-token');
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET) as IPayload;
        return payload.userId === Number(userId);
      } catch (err) {
        return false;
      }
    }
  };

  const raiseError = (msg: string, status: number) => {
    const error = new Error(msg);
    (error as any).status = status;
    throw error;
  };

  try {
    const profileGuest = await getProfileGuest();
    const email = await getEmailFromUser(profileGuest.userId);
    const profileHostGithub = await getProfileHostGithub(profileGuest.id);
    const isHost = profileHostGithub !== null;
    const profileHostTags = isHost ? await getProfileHostTags(profileGuest.id) : null;
    const profileDetail: profileDetailDto = {
      ...profileGuest,
      ...email,
      ...profileHostGithub,
      stack: profileHostTags?.map((ProfileHostTag) => ProfileHostTag.tag),
      isHost,
      isOwner: await getIsOwner(req, profileGuest.userId),
    };

    return profileDetail;
  } catch (err) {
    raiseError(err.message, err.status);
  }
};
