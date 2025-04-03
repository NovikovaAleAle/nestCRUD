import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Credential } from '../credentials/credential.entity';
import { Expose, Exclude } from 'class-transformer';
import { Role } from '../config/constants';
import { UserPost } from '../user.posts/user.post.entity';

@Exclude()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  surname: string;

  @Expose()
  @Column()
  age: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.GUEST,
  })
  role: Role;

  @OneToOne(() => Credential, { cascade: true })
  @JoinColumn()
  credential: Credential;

  @OneToMany(() => UserPost, (userPost) => userPost.user)
  userPosts: UserPost[];
}
