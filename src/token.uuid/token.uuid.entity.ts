import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TokenUuid {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  userId: number;

  @Column({ default: false })
  activation: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: false,
  })
  createdAt: Date;
}
