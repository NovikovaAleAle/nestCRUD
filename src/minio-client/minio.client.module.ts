import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minio.client.service';
import minioConfig from '../config/minio.config';
import { ConfigModule, ConfigType } from '@nestjs/config';

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule.forFeature(minioConfig)],
      useFactory: (config: ConfigType<typeof minioConfig>) => ({
        endPoint: config.endPoint,
        port: config.port,
        useSSL: false,
        accessKey: config.accessKey,
        secretKey: config.secretKey,
      }),
      inject: [minioConfig.KEY],
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
