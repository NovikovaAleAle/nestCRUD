/* eslint-disable 
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access
*/
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';
import { App } from 'supertest/types';
import {
  validUserData,
  invalidUserData,
  userData,
} from '../data/test.e2e.data';
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
import { Role } from '../../src/config/constants';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../src/auth/guards/jwt.strategy';
import { CredentialsService } from '../../src/credentials/credentials.service';
import { TokenUuidService } from '../../src/token.uuid/token.uuid.service';
import { AuthService } from '../../src/auth/auth.service';
import { MailService } from '../../src/mail/mail.service';
import uuidConfig from '../../src/config/uuid.config';
import { AuthController } from '../../src/auth/auth.controller';
import { AppBasicStrategy } from '../../src/auth/guards/basic.strategy';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let userTest: User;
  let tokenJwt: string;

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
        PassportModule,
      ],
      controllers: [AdminController, AuthController],
      providers: [
        JwtStrategy,
        AppBasicStrategy,
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'testsecret',
            signOptions: { expiresIn: '3600s' },
          }),
        },
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
        {
          provide: CredentialsService,
          useFactory: (credentialsRepository: Repository<Credential>) => {
            return new CredentialsService(credentialsRepository);
          },
          inject: [getRepositoryToken(Credential, 'testAdminConnection')],
        },
        {
          provide: TokenUuidService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: uuidConfig.KEY,
          useValue: {},
        },
        {
          provide: AuthService,
          useFactory: (
            credentialsService: CredentialsService,
            usersService: UsersService,
            jwtService: JwtService,
            mailService: MailService,
            tokenUuidService: TokenUuidService,
            configUuid: ConfigType<typeof uuidConfig>,
          ) => {
            return new AuthService(
              credentialsService,
              usersService,
              jwtService,
              mailService,
              tokenUuidService,
              configUuid,
            );
          },
          inject: [
            CredentialsService,
            UsersService,
            JwtService,
            MailService,
            TokenUuidService,
            uuidConfig.KEY,
          ],
        },
      ],
    }).compile();

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
    toUser.role = Role.ADMIN;

    userTest = await usersRepository.save(toUser);

    const response = await request(app.getHttpServer())
      .get('/auth/login')
      .auth(userData.credential.username, userData.credential.password)
      .send();
    tokenJwt = response.body.access_token;
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
        .set('Authorization', 'Bearer ' + tokenJwt)
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

    it('should return 409 when user already exists', () => {
      return request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', 'Bearer ' + tokenJwt)
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
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send(invalidUserData)
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain(
            'credential.email must be an email',
          );
        });
    });
  });

  describe('GET admin/users', () => {
    it('should return records according to pagination parameters and 200 status on success', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .query('page=1&take=4')
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(200)
        .then((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[1]).toEqual({
            id: 2,
            name: 'Ivan',
            surname: 'Ivanov',
            age: 21,
          });
          expect(res.body.meta).toEqual({
            totalItemCount: 2,
            page: 1,
            take: 4,
            countPage: 1,
          });
        });
    });

    it('should return 400 for invalid input data in query', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .query('page=1&take=2')
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('take must not be less than 3');
        });
    });
  });

  describe('GET admin/users/:id', () => {
    it('should return user record and 200 status on success', async () => {
      await request(app.getHttpServer())
        .get('/admin/users/' + userTest.id)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(200)
        .then((res) => {
          expect(res.body).not.toBeNull();
          expect(res.body).toEqual({
            id: 1,
            name: 'Ivan',
            surname: 'Ivanov',
            age: 21,
          });
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/admin/users/999')
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'User not found',
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
        .patch('/admin/users/' + userTest.id)
        .set('Authorization', 'Bearer ' + tokenJwt)
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

    it('should return 409 when update username already exists', () => {
      const updateUserDto = {
        credential: {
          username: 'TestValidUser',
        },
      };
      return request(app.getHttpServer())
        .patch('/admin/users/' + userTest.id)
        .set('Authorization', 'Bearer ' + tokenJwt)
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
        .patch('/admin/users/' + userTest.id)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send(updateUserInvalidDto)
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain(
            'user.name must match /^[a-zA-Z -]{3,20}$/ regular expression',
          );
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/admin/users/999')
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'User not found',
        });
    });
  });

  describe('GET admin/users/:id/role', () => {
    it('should return successful update role message and 200 status on success', () => {
      return request(app.getHttpServer())
        .get(`/admin/users/${userTest.id}/role`)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(200, 'User role updated');
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get(`/admin/users/999/role`)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'User not found',
        });
    });

    it('should return 409 when user role USER already exists', () => {
      return request(app.getHttpServer())
        .get(`/admin/users/${userTest.id}/role`)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(409, {
          statusCode: 409,
          message: 'Conflict',
        });
    });
  });

  describe('DELETE admin/users/:id', () => {
    it('should return user delete message and 200 status on success', async () => {
      await request(app.getHttpServer())
        .delete('/admin/users/' + userTest.id)
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(200, 'User deleted');

      const user = await usersRepository.findOneBy({ id: 1 });
      expect(user).toBeNull();
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/admin/users/999')
        .set('Authorization', 'Bearer ' + tokenJwt)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'User not found',
        });
    });
  });
});
