import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Request, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles/roles.guard';
import { validUserData, invalidUserData, userData} from '../data/test.e2e.data';
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
import { plainToClass } from 'class-transformer';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let credentialsRepository: Repository<Credential>;

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

    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User, 'testAdminConnection'),
    );

    credentialsRepository = moduleFixture.get<Repository<Credential>>(
      getRepositoryToken(Credential, 'testAdminConnection'),
    );

    dataSource = moduleFixture.get<DataSource>(
      getDataSourceToken('testAdminConnection'),
    );
    //creating a test user
    const toCredential = plainToClass(Credential, userData.credential, {
      excludeExtraneousValues: true,
    });
    const toUser = plainToClass(User, userData.user, {
      excludeExtraneousValues: true,
    });
    toUser.credential = toCredential;

    const userTest = await usersRepository.save(toUser);

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
        .expect(201, 'User created');

      const user = await usersRepository.findOne({
        where: {
          name: validUserData.user.name,
          credential: { username: validUserData.credential.username },
        },
      });

      expect(user).not.toBeNull();
      expect(user).toHaveProperty('role');
      expect(user?.role).toBe('user');
    });

    it('should return 409 when user already exists', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .send(validUserData)
        .expect(409, {
          statusCode: 409,
          message: 'User with this username already exist',
          error: 'Conflict',
        });
    });

    it('should return 400 for invalid input data', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .send(invalidUserData)
        .expect(400)
        .then(({ body }: request.Response) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toContain('credential.email must be an email');
        });
    });
  });

  describe('PATCH admin/users/:id', () => {
    const updateUserDto = {
      user: {
        name: 'Peter',
      },
      credential: {
        username: 'UpdateTest',
      },
    };

    it('should return user update message and 200 status on success', async () => {
      await request(app.getHttpServer())
        .patch('/admin/users/1')
        .send(updateUserDto)
        .expect(200, 'User updated');
      
      const user = await usersRepository.findOne({ 
        where: { id: 1 },
        relations: ['credential'],
      });
      expect(user).not.toBeNull();
      expect(user?.name).toEqual('Peter');
      expect(user?.credential.username).toEqual('UpdateTest');
    });

    it('should return 409 when update username already exists', async () => {
      const updateUserDto = {
        credential: {
          username: 'TestValidUser',
        },
      };  
      await request(app.getHttpServer())
        .patch('/admin/users/1')
        .send(updateUserDto)
        .expect(409, {
          statusCode: 409,
          message: 'User with this username already exist',
          error: 'Conflict',
        });
    });

    it('should return 400 for invalid input data', async () => {
      const updateUserInvalidDto = {
        user: {
          name: '123Peter',
        },
      };
      await request(app.getHttpServer())
        .patch('/admin/users/1')
        .send(updateUserInvalidDto)
        .expect(400)
        .then(({ body }: request.Response) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toContain(
            'user.name must match /^[a-zA-Z -]{3,20}$/ regular expression',
          );
        });
    });
  });

  describe('GET admin/users', () => {
    it('should return records according to pagination parameters and 200 status on success', async () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .query('page=1&take=4')
        .send()
        .expect(200)
        .then(({ body }: request.Response) => {
          expect(body.data).toHaveLength(2);
          expect(body.data[1]).toEqual(
            { 
              id: 2,
              name: 'Ivan',
              surname: 'Ivanov',
              age: 21,
            }
          );
          expect(body.meta).toEqual({
            totalItemCount: 2,
            page: 1,
            take: 4,
            countPage: 1,
          })
        });
    });
  });

  describe('DELETE admin/users/:id', () => {
    it('should return user delete message and 200 status on success', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/1`)
        .send()
        .expect(200, 'User deleted');        

      const user = await usersRepository.findOneBy({ id: 1 });
      expect(user).toBeNull();
    });
  });
});
