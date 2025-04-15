import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CredentialsModule } from './credentials/credentials.module';
import { DataSource } from 'typeorm';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import kafkaConfig from './config/kafka.config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { UserPostsModule } from './user.posts/user.posts.module';
import mailerConfig from './config/mailer.config';
import minioConfig from './config/minio.config';
import { MinioClientModule } from './minio.client/minio.client.module';
import { TokenUuidModule } from './token.uuid/token.uuid.module';
import uuidConfig from './config/uuid.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [
        databaseConfig,
        kafkaConfig,
        jwtConfig,
        mailerConfig,
        minioConfig,
        uuidConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        ...config,
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.secret,
        signOptions: config.signOptions,
      }),
    }),
    KafkaModule,
    UsersModule,
    CredentialsModule,
    AuthModule,
    MailModule,
    AdminModule,
    UserPostsModule,
    MinioClientModule,
    TokenUuidModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
