import {
  Injectable,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { parseStringEnv } from '../helpers/parse.env.helper';
import { Env } from '../config/constants';
import { BufferedFileDto } from '../dto/input.dto/buffered.file.dto';
import * as crypto from 'crypto';
import { UrlDto } from '../dto/url.dto';
import minioConfig from '../config/minio.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class MinioClientService {
  private readonly logger = new Logger(MinioClientService.name);
  private readonly bucket = parseStringEnv(Env.MINIO_BUCKET);

  get client() {
    return this.minioService.client;
  }

  constructor(
    private readonly minioService: MinioService,
    @Inject(minioConfig.KEY)
    private configMinio: ConfigType<typeof minioConfig>,
  ) {}

  async upload(
    file: BufferedFileDto,
    bucket: string = this.bucket,
  ): Promise<UrlDto> {
    if (
      !(
        file.mimetype.includes('jpeg') ||
        file.mimetype.includes('png') ||
        file.mimetype.includes('jpg')
      )
    ) {
      this.logger.warn(`Invalid upload file mimetype: ${file.mimetype}`);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
    const temp_filename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const filename = hashedFileName + ext;
    const fileName: string = `${filename}`;
    const fileBuffer = file.buffer;
    try {
      await this.client.putObject(bucket, fileName, fileBuffer);
      this.logger.log('Url to the object in storage created');
      return {
        url: `${this.configMinio.endPoint}:${this.configMinio.port}/${bucket}/${filename}`,
      };
    } catch (error) {
      this.logger.warn(`Error in putting the file in storage, ${error}`);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(
    objectName: string,
    bucket: string = this.bucket,
  ): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectName);
      this.logger.log(`File:${objectName} removed in storage`);
    } catch (error) {
      this.logger.warn(
        `Error in removing the file:${objectName} in storage, ${error}`,
      );
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }
}
