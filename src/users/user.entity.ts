import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Credential } from '../credentials/credential.entity';
import { Expose, Exclude } from 'class-transformer';
import { Role } from '../config/constants';

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
    default: Role.GHOST,
  })
  role: Role;

  @OneToOne(() => Credential, { cascade: true })
  @JoinColumn()
  credential: Credential;
}
