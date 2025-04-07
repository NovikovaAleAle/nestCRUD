import { Inject, Module, OnModuleInit, Logger } from '@nestjs/common';
import { MinioModule, MinioService } from 'nestjs-minio-client';
import { MinioClientService } from './minio.client.service';
import minioConfig from '../config/minio.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { parseStringEnv } from 'src/helpers/parse.env.helper';
import { Env } from 'src/config/constants';

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
export class MinioClientModule implements OnModuleInit {
  private readonly logger = new Logger(MinioClientModule.name);
  constructor(
    @Inject(MinioService)
    private readonly minioService: MinioService,
  ) {}
  async onModuleInit() {
    const listBuckets = await this.minioService.client.listBuckets();
    if (listBuckets.length === 0) {
      await this.minioService.client.makeBucket(
        parseStringEnv(Env.MINIO_BUCKET),
      );
      this.logger.log('Bucket in minio created');
    }
  }
}
