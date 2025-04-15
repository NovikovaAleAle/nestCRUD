import { Test, TestingModule } from '@nestjs/testing';
import {
  createUserDtoTest,
  pageOptionsDtoTest,
  updateUserDtoTest,
  users,
  user,
} from '../data/test.data';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { Role } from '../config/constants';
import { PageUsersDto } from '../dto/output.dto/page.users.dto';
import { PageMetaDto } from '../dto/page.meta.dto';
import { plainToClass } from 'class-transformer';
import { OutputUserDto } from '../dto/output.dto/output.user.dto';

describe('AdminService (unit)', () => {
  let adminService: AdminService;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    setRole: jest.fn(),
    deleteId: jest.fn(),
    updateId: jest.fn(),
    findAllWithPagination: jest.fn(),
    findId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        AdminService,
      ],
    }).compile();

    adminService = moduleRef.get<AdminService>(AdminService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should induce userService to create user with role USER', async () => {
      mockUsersService.create.mockResolvedValue(1);
      mockUsersService.setRole.mockResolvedValue(undefined);

      await adminService.createUser(createUserDtoTest);

      expect(usersService.create).toHaveBeenCalledWith(createUserDtoTest);
      expect(usersService.setRole).toHaveBeenCalledWith(1, Role.USER);
    });
  });

  describe('deleteUserById', () => {
    it('should induce userService to delete user', async () => {
      mockUsersService.deleteId.mockResolvedValue(undefined);

      await adminService.deleteUserById(1);

      expect(usersService.deleteId).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserById', () => {
    it('should induce userService to update user', async () => {
      mockUsersService.updateId.mockResolvedValue(undefined);

      await adminService.updateUserById(1, updateUserDtoTest);

      expect(usersService.updateId).toHaveBeenCalledWith(1, updateUserDtoTest);
    });
  });

  describe('findAllUsersWithPagination', () => {
    it('should induce userService return paginated users', async () => {
      const pageUsers = new PageUsersDto(
        users,
        new PageMetaDto(2, pageOptionsDtoTest),
      );
      mockUsersService.findAllWithPagination.mockResolvedValue(pageUsers);

      const result =
        await adminService.findAllUsersWithPagination(pageOptionsDtoTest);

      expect(usersService.findAllWithPagination).toHaveBeenCalledWith(
        pageOptionsDtoTest,
      );
      expect(result.data.length).toBe(2);
      expect(result.meta.totalItemCount).toBe(2);
    });
  });

  describe('findUserById', () => {
    it('should induce userService return user', async () => {
      const outputUser = plainToClass(OutputUserDto, user, {
        excludeExtraneousValues: true,
      });
      mockUsersService.findId.mockResolvedValue(outputUser);
      const result = await adminService.findUserById(1);

      expect(usersService.findId).toHaveBeenCalledWith(1);
      expect(result.id).toBe(2);
    });
  });

  describe('updateRoleOnUser', () => {
    it('should induce userService update user role on USER', async () => {
      mockUsersService.setRole.mockResolvedValue(undefined);
      await adminService.updateRoleOnUser(1);

      expect(usersService.setRole).toHaveBeenCalledWith(1, Role.USER);
    });
  });
});
