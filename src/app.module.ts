import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CredentialModule } from './credentials/credential.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, kafkaConfig, jwtConfig, mailerConfig, minioConfig],
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
    CredentialModule,
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
