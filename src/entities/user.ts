/* eslint-disable indent */
import {
  BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Index('User_email_uindex', ['email'], { unique: true })
@Entity('User')
class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'userId' })
  userId: number;

  @Column('varchar', { name: 'email', unique: true, length: 100 })
  email: string;

  @Column('text', { name: 'password' })
  password: string;

  /*
  @Column('text', { name: 'bio' })
  bio: string;

  @Column('varchar', { name: 'name', length: 30 })
  name: string;

  @Column('varchar', { name: 'username', length: 30 })
  username: string;

  @Column('varchar', { name: 'profileImg', length: 30 })
  profileImg: string;
  */
}

export default User;
