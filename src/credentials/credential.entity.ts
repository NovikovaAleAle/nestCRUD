import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Exclude } from 'class-transformer';
import { salt } from '../auth/bcrypt.pass';
import * as bcrypt from 'bcrypt';

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

  @BeforeInsert()
  async hashedPassword() {
    this.password = await bcrypt.hash(this.password, await salt());
  }

  @Expose()
  @Column()
  email: string;
}
