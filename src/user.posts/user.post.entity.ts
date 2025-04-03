import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
@Entity()
export class UserPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  title: string;

  @Expose()
  @Column()
  content: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  image: string | null;

  @ManyToOne(() => User, (user) => user.userPosts)
  user: User;
}
