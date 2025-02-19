import { DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: 'postgres',
  entities: [User],
  synchronize: true,
};
