import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CredentialModule } from './credentials/credential.module';
import { DataSource } from 'typeorm';
import configuration from './config/configuration';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        ...config,
      }),
    }),
    KafkaModule,
    UsersModule,
    CredentialModule,
    AuthModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
