import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'User Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Lilu', description: 'The name of the User' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Dallas', description: 'The surname of the User' })
  @Column()
  surname: string;

  @ApiProperty({ example: 18, description: 'The age of the User' })
  @Column()
  age: number;
}
