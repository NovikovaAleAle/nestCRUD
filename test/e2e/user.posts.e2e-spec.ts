/* eslint-disable 
  @typescript-eslint/no-unsafe-member-access
*/
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { UserPostsService } from '../../src/user.posts/user.posts.service';
import { Repository } from 'typeorm';
import { UserPost } from '../../src/user.posts/user.post.entity';
import { User } from '../../src/users/user.entity';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import databaseConfig from '../../src/config/database.config';
import {
  TypeOrmModule,
  getDataSourceToken,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { UserPostsController } from '../../src/user.posts/user.posts.controller';
import { MinioClientService } from '../../src/minio.client/minio.client.service';
import { KafkaService } from '../../src/kafka/kafka.service';
import { UsersService } from '../../src/users/users.service';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles/roles.guard';
import { plainToClass } from 'class-transformer';
import { Credential } from '../../src/credentials/credential.entity';
import { userData, userPostData } from '../data/test.e2e.data';
import minioConfig from '../../src/config/minio.config';
import { MinioClientModule } from '../../src/minio.client/minio.client.module';

describe('UserPostsController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userPostsRepository: Repository<UserPost>;
  let usersRepository: Repository<User>;
  let userTest: User;
  let postTest: UserPost;

  const mockKafkaService = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test'],
          load: [databaseConfig, minioConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          name: 'testUserPostsConnection',
          useFactory: (config: ConfigType<typeof databaseConfig>) => ({
            name: 'testUserPostsConnection',
            type: 'postgres',
            ...config,
            entities: [User, Credential, UserPost],
          }),
        }),
        TypeOrmModule.forFeature(
          [User, Credential, UserPost],
          'testUserPostsConnection',
        ),
        MinioClientModule,
      ],
      controllers: [UserPostsController],
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
            getRepositoryToken(User, 'testUserPostsConnection'),
            KafkaService,
          ],
        },
        {
          provide: UserPostsService,
          useFactory: (
            userPostsRepository: Repository<UserPost>,
            usersService: UsersService,
            minioClientService: MinioClientService,
          ) => {
            return new UserPostsService(
              userPostsRepository,
              usersService,
              minioClientService,
            );
          },
          inject: [
            getRepositoryToken(UserPost, 'testUserPostsConnection'),
            UsersService,
            MinioClientService,
          ],
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
      getRepositoryToken(User, 'testUserPostsConnection'),
    );
    userPostsRepository = moduleFixture.get<Repository<UserPost>>(
      getRepositoryToken(UserPost, 'testUserPostsConnection'),
    );
    dataSource = moduleFixture.get<DataSource>(
      getDataSourceToken('testUserPostsConnection'),
    );
    //creating a test user
    const toCredential = plainToClass(Credential, userData.credential, {
      excludeExtraneousValues: true,
    });
    const toUser = plainToClass(User, userData.user, {
      excludeExtraneousValues: true,
    });
    toUser.credential = toCredential;
    userTest = await usersRepository.save(toUser);
    //creating a post user
    const toUserPost: UserPost = plainToClass(UserPost, userPostData, {
      excludeExtraneousValues: true,
    });
    toUserPost.user = userTest;
    postTest = await userPostsRepository.save(toUserPost);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('POST users/:id/posts', () => {
    const validUserPostData = {
      title: 'Test post for test',
      content: 'test text for test, test text for test, test text for test',
    };
    it('should return user post creation message and 201 status on success', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts`)
        .send(validUserPostData)
        .expect(201, 'Post created');

      const userPost = await userPostsRepository.findOneBy({
        title: 'Test post for test',
      });
      expect(userPost).not.toBeNull();
      expect(userPost).toEqual({
        id: 2,
        title: 'Test post for test',
        content: 'test text for test, test text for test, test text for test',
        image: null,
      });
    });

    it('should return 404 for non-existent id user', async () => {
      await request(app.getHttpServer())
        .post('/users/999/posts')
        .send(validUserPostData)
        .expect(404, {
          statusCode: 404,
          message: 'User not found',
        });
    });

    it('should return 400 for invalid input data', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts`)
        .send({ ...validUserPostData, title: 134465676587899 })
        .expect(400)
        .then(({ body }: request.Response) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toContain('title must be a string');
        });
    });
  });

  describe('GET users/:id/posts', () => {
    it('should return records according to pagination parameters and 200 status on success', async () => {
      return request(app.getHttpServer())
        .get(`/users/${userTest.id}/posts`)
        .query('page=1&take=4')
        .send()
        .expect(200)
        .then(({ body }: request.Response) => {
          expect(body.data).toHaveLength(2);
          expect(body.data[1]).toEqual({
            id: 2,
            title: 'Test post for test',
            content:
              'test text for test, test text for test, test text for test',
            image: null,
          });
          expect(body.meta).toEqual({
            totalItemCount: 2,
            page: 1,
            take: 4,
            countPage: 1,
          });
        });
    });

    it('should return 400 for invalid input data in query', async () => {
      return request(app.getHttpServer())
        .get(`/users/${userTest.id}/posts`)
        .query('page=1&take=2')
        .send()
        .expect(400)
        .then(({ body }: request.Response) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toContain('take must not be less than 3');
        });
    });
  });

  describe('GET users/:id/posts/:idpost', () => {
    it('should return post record and 200 status on sucess', async () => {
      return request(app.getHttpServer())
        .get(`/users/${userTest.id}/posts/${postTest.id}`)
        .send()
        .expect(200)
        .then(({ body }: request.Response) => {
          expect(body).not.toBeNull();
          expect(body).toEqual({
            id: 1,
            title: 'First test post for test',
            content:
              'First test text for test, test text for test, test text for test',
            image: null,
          });
        });
    });

    it('should return 404 for non-existent id', async () => {
      return request(app.getHttpServer())
        .get(`/users/${userTest.id}/posts/999`)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'Post not found',
        });
    });
  });

  describe('PATCH users/:id/posts/:idpost', () => {
    const updateUserPostData = {
      title: 'Update title for the post',
    };
    it('should return message to update the post and 200 status on success', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${userTest.id}/posts/${postTest.id}`)
        .send(updateUserPostData)
        .expect(200, 'Post updated');
    });

    it('should return 400 for invalid input data ', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${userTest.id}/posts/${postTest.id}`)
        .send({ ...updateUserPostData, title: 45674448903454 })
        .expect(400)
        .then(({ body }: request.Response) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toContain('title must be a string');
        });
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${userTest.id}/posts/999`)
        .send(updateUserPostData)
        .expect(404, {
          statusCode: 404,
          message: 'Post not found',
        });
    });
  });

  describe('POST users/:id/posts/:idpost', () => {
    it('should return successful upload message and 201 status on success', async () => {
      const config = app.get(ConfigService);
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts/${postTest.id}`)
        .attach('image', Buffer.from('test'), 'test.png')
        .expect(201, 'Image upload');

      const post = await userPostsRepository.findOne({
        where: { id: postTest.id },
      });
      expect(post?.image).not.toBeNull();
      expect(post?.image).toMatch(
        new RegExp(
          `^${config.get('minio.endPoint')}:${config.get('minio.port')}/${config.get('minio.bucket')}/[a-f0-9]+.png$`,
        ),
      );
    });

    it('should return 400 if file is too large', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024);
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts/${postTest.id}`)
        .attach('image', largeFile, 'largeFile.png')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Validation failed (current file size is 6291456, expected size is less than 5242880)',
          );
        });
    });

    it('should return 400 for invalid file type', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts/${postTest.id}`)
        .attach('image', Buffer.from('test'), 'test.txt')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Validation failed (current file type is text/plain, expected type is .(png|jpeg|jpg))',
          );
        });
    });

    it('should return 400 if no file uploaded', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts/${postTest.id}`)
        .expect(400);
    });

    it('should return 404 for non-existent post id', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userTest.id}/posts/999`)
        .attach('image', Buffer.from('test'), 'test.png')
        .expect(404, {
          statusCode: 404,
          message: 'Post not found',
        });
    });
  });

  describe('DELETE users/:id/posts/:idpost/image', () => {
    it('should return message to delete file in post user and 200 status on success', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest.id}/posts/${postTest.id}/image`)
        .send()
        .expect(200, 'Image removed');

      const post = await userPostsRepository.findOne({
        where: { id: postTest.id },
      });
      expect(post?.image).toBeNull();
    });

    it('should return 409 if image non-existent', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest.id}/posts/${postTest.id}/image`)
        .send()
        .expect(409, {
          statusCode: 409,
          message: 'Image missing from the post',
          error: 'Conflict',
        });
    });

    it('should return 404 for non-existent post id', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest.id}/posts/999/image`)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'Post not found',
        });
    });
  });

  describe('DELETE users/:id/posts/:idpost', () => {
    it('should return message to delete the post and 200 status on success', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest.id}/posts/1`)
        .send()
        .expect(200, 'Post deleted');

      const post = await userPostsRepository.findOne({
        where: { id: postTest.id },
      });
      expect(post).toBeNull();
    });

    it('should return 404 for non-existent post id', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest.id}/posts/999`)
        .send()
        .expect(404, {
          statusCode: 404,
          message: 'Post not found',
        });
    });
  });
});
