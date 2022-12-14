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

  let profileDetail: profileDetailDto = {
    isHost: false,
    isOwner: false,
    id: 0,
    name: '',
    username: '',
    bio: '',
    github: '',
    stack: [],
    email: '',
    userId: 0,
    isDeleted: false,
  };

  try {
    const profileGuestObj = await AppDataSource.getRepository(ProfileGuest)
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

    if (profileGuestObj.isDeleted) {
      const error = new Error('This user is deleted');
      (error as any).status = 404;
      throw error;
    }

    const email = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .where('user.userId = :id', { id: profileGuestObj.userId })
      .select(['user.email'])
      .getOneOrFail();

    profileDetail = {
      ...profileDetail,
      ...profileGuestObj,
      ...email,
    };
  } catch (err) {
    const error = new Error(err.message);
    (error as any).status = 404;
    throw error;
  }

  try {
    const profileHostGithub = await AppDataSource.getRepository(ProfileHostGithub)
      .createQueryBuilder('profile_host_github')
      .where('profile_host_github.profile_guest_id = :id', { id: profileDetail.id })
      .select(['profile_host_github.github'])
      .getOne();

    const isHost = profileHostGithub !== null;

    if (isHost) {
      const profileHostTags = await AppDataSource.getRepository(ProfileHostTag)
        .createQueryBuilder('profile_host_tag')
        .where('profile_host_tag.profile_guest_id = :id', { id: profileDetail.id })
        .select(['profile_host_tag.tag'])
        .getMany();

      profileDetail = {
        ...profileDetail,
        ...profileHostGithub,
        isHost,
        stack: profileHostTags.map((ProfileHostTag) => ProfileHostTag.tag),
      };
    }
  } catch (err) {
    const error = new Error(err.message);
    (error as any).status = 400;
    throw error;
  }

  const token = req.header('access-token');
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET) as IPayload;

      if (payload.userId === Number(profileDetail.userId)) {
        profileDetail = {
          ...profileDetail,
          isOwner: true,
        };
      }
    } catch (err) {}
  }

  return profileDetail;
};
