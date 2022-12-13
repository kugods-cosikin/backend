/* eslint-disable indent */
import { BaseEntity, Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Index('profile_host_tag_profile_guest_id_tag_uindex', ['profileGuestId', 'tag'], { unique: true })
@Index('profile_host_tag_profile_guest_id_index', ['profileGuestId'])
@Index('profile_host_tag_tag_index', ['tag'])
@Entity('profile_host_tag')
class ProfileHostTag extends BaseEntity {
  @PrimaryColumn({ type: 'bigint', name: 'profile_guest_id' })
  profileGuestId: number;

  @PrimaryColumn({ type: 'varchar', name: 'tag', length: 128 })
  tag: string;

  @Column('timestamp', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: object;

  @Column('timestamp', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: object;
}

export default ProfileHostTag;
