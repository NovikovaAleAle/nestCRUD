import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CredentialModule } from './credentials/credential.module';
import { DataSource } from 'typeorm';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    DatabaseModule,
    KafkaModule,
    UsersModule,
    CredentialModule,
    AuthModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
