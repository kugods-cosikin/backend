/* eslint-disable indent */
import {
  BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Index('Token_accessToken_uindex', ['accessToken'], { unique: true })
@Entity('Token')
class Token extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'accessToken', unique: true, length: 120 })
  accessToken: string;

  @Column('varchar', { name: 'refreshToken', unique: true, length: 120 })
  refreshToken: string;
}

export default Token;
