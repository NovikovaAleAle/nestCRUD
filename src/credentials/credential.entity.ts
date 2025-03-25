import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
@Entity()
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ unique: true })
  username: string;

  @Expose()
  @Column()
  password: string;

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column()
  authorization: boolean;
}
