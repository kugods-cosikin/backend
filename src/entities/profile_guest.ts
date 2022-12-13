/* eslint-disable indent */
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('profile_guest_name_index', ['name'])
@Index('profile_guest_username_index', ['username'])
@Index('profile_guest_user_id_index', ['userId'])
@Entity('profile_guest')
class ProfileGuest extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 128 })
  name: string;

  @Column('varchar', { name: 'username', length: 128 })
  username: string;

  @Column('text', { name: 'bio' })
  bio: string;

  @Column('varchar', { name: 'image', length: 1024 })
  image: string;

  @Column('bigint', { name: 'user_id' })
  userId: number;

  @Column('tinyint', { name: 'is_deleted' })
  isDeleted: boolean;

  @Column('timestamp', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: object;

  @Column('timestamp', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: object;
}

export default ProfileGuest;
