import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MailService } from '../../src/mail/mail.service';
import { App } from 'supertest/types';
import { validUserData, invalidUserData } from '../data/test.e2e.data';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { User } from '../../src/users/user.entity';
import { Repository, DataSource } from 'typeorm';
import { Credential } from '../../src/credentials/credential.entity';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersService } from '../../src/users/users.service';
import { KafkaService } from '../../src/kafka/kafka.service';
import { UsersController } from '../../src/users/users.controller';
import { UserPost } from '../../src/user.posts/user.post.entity';
import { TokenUuid } from '../../src/token.uuid/token.uuid.entity';
import { ConfigModule, ConfigType } from '@nestjs/config';
import mailerConfig from '../../src/config/mailer.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { TokenUuidService } from '../../src/token.uuid/token.uuid.service';
import databaseConfig from '../../src/config/database.config';
import { isMatch } from '../../src/helpers/bcrypt.pass.helper';

describe('UsersController (e2e)', () => {
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
          load: [mailerConfig, databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          name: 'testConnection',
          useFactory: (config: ConfigType<typeof databaseConfig>) => ({
            name: 'testConnection',
            type: 'postgres',
            ...config,
            entities: [User, Credential, UserPost, TokenUuid],
          }),
        }),
        MailerModule.forRootAsync(mailerConfig.asProvider()),
        TypeOrmModule.forFeature(
          [User, Credential, TokenUuid],
          'testConnection',
        ),
      ],
      controllers: [UsersController],
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
          inject: [getRepositoryToken(User, 'testConnection'), KafkaService],
        },
        {
          provide: TokenUuidService,
          useFactory: (tokenUuidRepository: Repository<TokenUuid>) => {
            return new TokenUuidService(tokenUuidRepository);
          },
          inject: [getRepositoryToken(TokenUuid, 'testConnection')],
        },
        MailService,
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
      getRepositoryToken(User, 'testConnection'),
    );
    dataSource = moduleFixture.get<DataSource>(
      getDataSourceToken('testConnection'),
    );

    usersRepository = dataSource.getRepository(User);
    credentialsRepository = dataSource.getRepository(Credential);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe.skip('POST /users/register', () => {
    it('should return confirmation message and 201 status on success', async () => {
      await request(app.getHttpServer())
        .post('/users/register')
        .send(validUserData)
        .expect(201)
        .expect('Complete registration with email confirmation');

      const user = await usersRepository.findOne({
        where: {
          name: validUserData.user.name,
          credential: { username: validUserData.credential.username },
        },
      });
      expect(user).not.toBeNull();
      expect(user).toEqual({
        id: 1,
        name: 'Ivan',
        surname: 'Ivanov',
        age: 21,
        role: 'guest',
      });

      const username = validUserData.credential.username;
      const credential = await credentialsRepository.findOneBy({ username });
      expect(credential).not.toBeNull();
      expect(credential?.username).toEqual('TestValidUser');
      expect(credential).toHaveProperty('password');
      expect(credential?.password).not.toBeNull();
      if (credential) {
        expect(await isMatch('Password123!', credential.password)).toBe(true);
      }
    });

    it('should return 409 when user already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'User with this username already exist',
        error: 'Conflict',
      });
    });

    it('should return 400 for invalid input data', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toContain(
        'credential.email must be an email',
      );
    });
  });
});
