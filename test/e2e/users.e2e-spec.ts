import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { MailService } from '../../src/mail/mail.service';
import { App } from 'supertest/types';
import { ErrorEmailNotSent } from '../../src/error/error.email-not-sent';
import { validUserData, invalidUserData } from '../data/test.e2e.data';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUsersService = {
    create: jest.fn(),
  };

  const mockMailService = {
    sendUserConfirmation: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
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
  });

  describe('POST /users/register', () => {
    it('should return confirmation message and 201 status on success', async () => {
      mockUsersService.create.mockResolvedValue(1);
      mockMailService.sendUserConfirmation.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/users/register')
        .send(validUserData)
        .expect(201)
        .expect('Complete registration with email confirmation');

      expect(mockUsersService.create).toHaveBeenCalledWith(validUserData);
      expect(mockMailService.sendUserConfirmation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          email: validUserData.credential.email,
          password: validUserData.credential.password,
        }),
      );
    });

    it('should return 409 when user already exists', async () => {
      const conflictError = new ConflictException(
        'User with this username already exist',
      );
      mockUsersService.create.mockRejectedValue(conflictError);

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

    it('should return 500 when email sending fails', async () => {
      mockUsersService.create.mockResolvedValue(1);
      const emailError = new ErrorEmailNotSent();
      mockMailService.sendUserConfirmation.mockRejectedValue(emailError);

      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send(validUserData)
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Email not sent',
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });
});
