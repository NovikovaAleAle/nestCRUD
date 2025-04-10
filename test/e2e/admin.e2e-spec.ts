import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles/roles.guard';
import { validUserData } from '../data/test.e2e.data';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;

  const mockAdminService = {
    createUser: jest.fn(),
    deleteUserById: jest.fn(),
    updateUserById: jest.fn(),
    findAllUsersWithPagination: jest.fn(),
    findUserById: jest.fn(),
    updateRoleOnUser: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
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
  });

  describe('POST admin/users', () => {
    it('should return user creation message and 201 status on success', async () => {
      mockAdminService.createUser.mockResolvedValue(1);

      await request(app.getHttpServer())
        .post('/admin/users')
        .send(validUserData)
        .expect(201)
        .expect('User created');

      expect(mockAdminService.createUser).toHaveBeenCalledWith(validUserData);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });
});
