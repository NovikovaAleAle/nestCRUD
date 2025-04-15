import { MinioService } from 'nestjs-minio-client';
import { MinioClientService } from './minio.client.service';
import { Test, TestingModule } from '@nestjs/testing';
import minioConfig from '../config/minio.config';
import { validFile } from '../data/test.data';
import { HttpException } from '@nestjs/common';

describe('MinioClientService (unit)', () => {
  let minioClientService: MinioClientService;
  let minioService: Partial<MinioService>;

  const mockMinioConfig = {
    endPoint: 'localhost',
    port: 9000,
    bucket: 'mytestbucket',
  };

  const mockClient = {
    putObject: jest.fn().mockResolvedValue({}),
    removeObject: jest.fn().mockResolvedValue({}),
  };

  const mockMinioService = {
    client: mockClient,
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
        {
          provide: minioConfig.KEY,
          useValue: mockMinioConfig,
        },
        MinioClientService,
      ],
    }).compile();

    minioClientService = moduleRef.get<MinioClientService>(MinioClientService);
    minioClientService['bucket'] = mockMinioConfig.bucket;
    minioService = moduleRef.get<Partial<MinioService>>(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should return url file in minio', async () => {
      const result = await minioClientService.upload(validFile);
      expect(minioService.client?.putObject).toHaveBeenCalledWith(
        minioClientService['bucket'],
        expect.stringMatching(/^[a-f0-9]+\.jpg$/),
        validFile.buffer,
      );

      expect(result).toHaveProperty('url');
      expect(result.url).toMatch(
        new RegExp(
          `^${mockMinioConfig.endPoint}:${mockMinioConfig.port}/${mockMinioConfig.bucket}/[a-f0-9]+.jpg$`,
        ),
      );
    });

    it('should throw HttpExeption if minio client will not work out', async () => {
      mockClient.putObject.mockRejectedValue(Error);

      await expect(minioClientService.upload(validFile)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('remove', () => {
    const mockObjectName = '08a3d3969252e3dd7beee946063358a9.png';
    it('should induce minio client to remove file', async () => {
      await minioClientService.remove(mockObjectName);

      expect(minioService.client?.removeObject).toHaveBeenCalledWith(
        minioClientService['bucket'],
        mockObjectName,
      );
    });

    it('should throw HttpExeption if minio client will not work on deletion', async () => {
      mockClient.removeObject.mockRejectedValue(Error);

      await expect(minioClientService.remove(mockObjectName)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
