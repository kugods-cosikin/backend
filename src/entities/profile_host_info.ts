/* eslint-disable indent */
import {
  BaseEntity, Column, Entity, PrimaryColumn,
} from 'typeorm';

@Entity('profile_host_info')
class ProfileHostInfo extends BaseEntity {
  @PrimaryColumn({ type: 'bigint', name: 'profile_guest_id' })
  profileGuestId: number;

  @Column('varchar', { name: 'github', length: 1024 })
  github: string;

  @Column('int', { name: 'like', default: 0 })
  like: number;

  @Column('double', { name: 'average_response_time', default: -1 })
  averageResponseTime: number;

  @Column('timestamp', { name: 'updated_at', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: object;

  @Column('timestamp', { name: 'created_at', default: 'CURRENT_TIMESTAMP' })
  createdAt: object;
}

export default ProfileHostInfo;
