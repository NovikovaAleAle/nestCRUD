import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles/roles.guard';
import { validUserData } from '../data/test.e2e.data';
import { User } from '../../src/users/user.entity';
import { Credential } from '../../src/credentials/credential.entity';
import { ConfigModule, ConfigType } from '@nestjs/config';
import databaseConfig from '../../src/config/database.config';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { UserPost } from '../../src/user.posts/user.post.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../../src/users/users.service';
import { KafkaService } from '../../src/kafka/kafka.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  // let usersRepository: Repository<User>;

  const mockKafkaService = {
    sendMessage: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test'],
          load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          name: 'testAdminConnection',
          useFactory: (config: ConfigType<typeof databaseConfig>) => ({
            name: 'testAdminConnection',
            type: 'postgres',
            ...config,
            entities: [User, Credential, UserPost],
          }),
        }),
        TypeOrmModule.forFeature(
          [User, Credential, UserPost],
          'testAdminConnection',
        ),
      ],
      controllers: [AdminController],
      providers: [
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: UsersService,
          useFactory: (
            usersRepository: Repository<User>,
            kafkaService: KafkaService,
          ) => {
            return new UsersService(kafkaService, usersRepository);
          },
          inject: [
            getRepositoryToken(User, 'testAdminConnection'),
            KafkaService,
          ],
        },
        {
          provide: AdminService,
          useFactory: (usersService: UsersService) => {
            return new AdminService(usersService);
          },
          inject: [UsersService],
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(
      getDataSourceToken('testAdminConnection'),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('POST admin/users', () => {
    it('should return user creation message and 201 status on success', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .send(validUserData)
        .expect(201)
        .expect('User created');
    });
  });
});
