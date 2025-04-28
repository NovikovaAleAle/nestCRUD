/* eslint-disable 
  @typescript-eslint/no-unsafe-member-access
*/
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import databaseConfig from '../../src/config/database.config';
import mailerConfig from '../../src/config/mailer.config';
import {
  TypeOrmModule,
  getRepositoryToken,
  getDataSourceToken,
} from '@nestjs/typeorm';
import { User } from '../../src/users/user.entity';
import { Credential } from '../../src/credentials/credential.entity';
import { UserPost } from '../../src/user.posts/user.post.entity';
import { UsersService } from '../../src/users/users.service';
import { KafkaService } from '../../src/kafka/kafka.service';
import { DataSource, Repository } from 'typeorm';
import { CredentialsService } from '../../src/credentials/credentials.service';
import { TokenUuid } from '../../src/token.uuid/token.uuid.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenUuidService } from '../../src/token.uuid/token.uuid.service';
import { MailService } from '../../src/mail/mail.service';
import uuidConfig from '../../src/config/uuid.config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { plainToClass } from 'class-transformer';
import { userData, userTwoData } from '../data/test.e2e.data';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppBasicStrategy } from '../../src/auth/guards/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { CreateUserDto } from '../../src/dto/input.dto/create.user.dto';

export type TestData = {
  user: User;
  token: TokenUuid;
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let tokenUuidRepository: Repository<TokenUuid>;
  let userFirst: TestData;

  jest.useRealTimers();

  const mockKafkaService = {};
  const mockUuidConfig = {
    uuidLifeTime: 43200000,
  };

  const createTestData = async (createUserDto: CreateUserDto) => {
    const toCredential = plainToClass(Credential, createUserDto.credential, {
      excludeExtraneousValues: true,
    });
    const toUser = plainToClass(User, createUserDto.user, {
      excludeExtraneousValues: true,
    });
    toUser.credential = toCredential;
    const userTest = await usersRepository.save(toUser);
    const tokenUuid = new TokenUuid();
    tokenUuid.userId = userTest.id;
    const tokenUuidUserTest = await tokenUuidRepository.save(tokenUuid);
    return { user: userTest, token: tokenUuidUserTest };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test'],
          load: [mailerConfig, databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          name: 'testAuthConnection',
          useFactory: (config: ConfigType<typeof databaseConfig>) => ({
            name: 'testAuthConnection',
            type: 'postgres',
            ...config,
            entities: [User, Credential, UserPost, TokenUuid],
          }),
        }),
        MailerModule.forRootAsync(mailerConfig.asProvider()),
        TypeOrmModule.forFeature(
          [User, Credential, UserPost, TokenUuid],
          'testAuthConnection',
        ),
        PassportModule,
      ],
      controllers: [AuthController],
      providers: [
        MailService,
        AppBasicStrategy,
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: uuidConfig.KEY,
          useValue: mockUuidConfig,
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
            getRepositoryToken(User, 'testAuthConnection'),
            KafkaService,
          ],
        },
        {
          provide: CredentialsService,
          useFactory: (credentialsRepository: Repository<Credential>) => {
            return new CredentialsService(credentialsRepository);
          },
          inject: [getRepositoryToken(Credential, 'testAuthConnection')],
        },
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'testsecret',
            signOptions: { expiresIn: '3600s' },
          }),
        },
        {
          provide: TokenUuidService,
          useFactory: (tokenUuidRepository: Repository<TokenUuid>) => {
            return new TokenUuidService(tokenUuidRepository);
          },
          inject: [getRepositoryToken(TokenUuid, 'testAuthConnection')],
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
      getRepositoryToken(User, 'testAuthConnection'),
    );
    tokenUuidRepository = moduleFixture.get<Repository<TokenUuid>>(
      getRepositoryToken(TokenUuid, 'testAuthConnection'),
    );
    dataSource = moduleFixture.get<DataSource>(
      getDataSourceToken('testAuthConnection'),
    );

    //creating a test users
    userFirst = await createTestData(userData);
    await createTestData(userTwoData);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('GET auth/login', () => {
    it('should return JWT token and 200 status on success', async () => {
      const username = userData.credential.username;
      const password = userData.credential.password;
      await request(app.getHttpServer())
        .get('/auth/login')
        .auth(username, password)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toMatch(
            /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
          );
        });
    });

    it('should return 401 Unauthorized if invalid data in login', () => {
      const username = 'InvalidTestUser';
      const password = userData.credential.password;
      return request(app.getHttpServer())
        .get('/auth/login')
        .auth(username, password)
        .expect(401, {
          statusCode: 401,
          message: 'Unauthorized',
        });
    });

    it('should return 401 Unauthorized if invalid data in password', () => {
      const username = userData.credential.username;
      const password = '123';
      return request(app.getHttpServer())
        .get('/auth/login')
        .auth(username, password)
        .expect(401, {
          statusCode: 401,
          message: 'Unauthorized',
        });
    });

    it('should return 401 Unauthorized for non-existent data in authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/login')
        .send()
        .expect(401, {
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });

  describe('GET auth/confirm', () => {
    it('should return credential confirmation message', async () => {
      const user = await usersRepository.findOneBy({ id: userFirst.user.id });
      expect(user).not.toBeNull();
      expect(user).toHaveProperty('role');
      expect(user?.role).toEqual('guest');

      await request(app.getHttpServer())
        .get('/auth/confirm')
        .query('uuid=' + userFirst.token.uuid)
        .send()
        .expect(200, 'Email confirm');

      const userConfirm = await usersRepository.findOneBy({
        id: userFirst.user.id,
      });
      expect(userConfirm?.role).toEqual('user');
    });

    it('should return 409 Conflict if user already confirmed', () => {
      return request(app.getHttpServer())
        .get('/auth/confirm')
        .query('uuid=' + userFirst.token.uuid)
        .send()
        .expect(409, {
          statusCode: 409,
          message: 'This email was already comfirmed',
          error: 'Conflict',
        });
    });

    it('should return 400 Bad request for invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/confirm')
        .query('uuid=1234-4567')
        .send()
        .expect(400);
    });

    it('should return 400 Bad request for non-existent uuid in query', () => {
      return request(app.getHttpServer())
        .get('/auth/confirm')
        .send()
        .expect(400);
    });
  });

  describe('GET auth/reconfirm', () => {
    it('return message about the need to confirm registration and 200 status on success', () => {
      const username = userTwoData.credential.username;
      const password = userTwoData.credential.password;
      return request(app.getHttpServer())
        .get('/auth/reconfirm')
        .auth(username, password)
        .send()
        .expect(200, 'Complete registration with email confirmation');
    });

    it('should return 409 Conflict if user already confirmed', () => {
      const username = userData.credential.username;
      const password = userData.credential.password;
      return request(app.getHttpServer())
        .get('/auth/reconfirm')
        .auth(username, password)
        .send()
        .expect(409, {
          statusCode: 409,
          message: 'This email was already comfirmed',
          error: 'Conflict',
        });
    });

    it('should return 401 Unauthorized for non-existent data in authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/reconfirm')
        .send()
        .expect(401, {
          statusCode: 401,
          message: 'Unauthorized',
        });
    });
  });
});
