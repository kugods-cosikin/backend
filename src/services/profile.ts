import { Request } from 'express';
import ProfileGuest from '@/entities/profile_guest';
import ProfileHostGithub from '@/entities/profile_host_github';
import ProfileHostTag from '@/entities/profile_host_tag';
import { fileDto, profileDto } from '@/interfaces/profile';
import AppDataSource from '@/config/app-data-source';

export const create = async (req: Request, profileData: profileDto, fileData: fileDto) => {
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
    .returning('id')
    .execute();
  const { profileGuestId } = newProfile.raw as { profileGuestId: number };

  if (type === 'host') {
    await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(ProfileHostGithub)
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

  return true;
};
