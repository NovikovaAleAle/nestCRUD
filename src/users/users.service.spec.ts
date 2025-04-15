/* eslint-disable 
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access
*/
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { KafkaService } from '../kafka/kafka.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  createUserDtoTest,
  user,
  users,
  updateUserDtoTest,
  pageOptionsDtoTest,
} from '../data/test.data';
import { Role } from '../config/constants';
import { ErrorUserNotFound } from '../error/error.user-not-found';

describe('UsersService (unit)', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;
  let kafkaService: KafkaService;

  const mockUsersRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    }),
  };

  const mockKafkaService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        UsersService,
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    kafkaService = moduleRef.get<KafkaService>(KafkaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and send kafka message', async () => {
      const savedUser = { id: 1, ...createUserDtoTest.user };

      mockUsersRepository.save.mockResolvedValue(savedUser);

      const result = await usersService.create(createUserDtoTest);

      expect(result).toBe(1);
      expect(usersRepository.save).toHaveBeenCalled();
      expect(kafkaService.sendMessage).toHaveBeenCalledWith(
        'User id:1 created',
      );
    });

    it('should throw ConflictException on duplicate username', async () => {
      mockUsersRepository.save.mockRejectedValue({ code: '23505' });
      await expect(usersService.create(createUserDtoTest)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('setRole', () => {
    it('should update user role', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(user);
      mockUsersRepository.save.mockResolvedValue({
        ...user,
        role: Role.USER,
      });

      await usersService.setRole(1, Role.USER);

      expect(user.role).toBe(Role.USER);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw ErrorUserNotFound if user not found', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      await expect(usersService.setRole(1, Role.USER)).rejects.toThrow(
        ErrorUserNotFound,
      );
    });
  });

  describe('findAllWithPagination', () => {
    it('should return paginated users', async () => {
      const queryBuilder = mockUsersRepository.createQueryBuilder();

      queryBuilder.getCount.mockResolvedValue(2);
      queryBuilder.getMany.mockResolvedValue(users);

      const result =
        await usersService.findAllWithPagination(pageOptionsDtoTest);

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalItemCount).toBe(2);
    });
  });

  describe('findId', () => {
    it('should return user by id', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(user);

      const result = await usersService.findId(2);

      expect(result).toEqual(expect.objectContaining({ id: 2 }));
    });

    it('should throw ErrorUserNotFound if user not found', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      await expect(usersService.findId(1)).rejects.toThrow(ErrorUserNotFound);
    });
  });

  describe('deleteId', () => {
    it('should delete user', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await usersService.deleteId(1);

      expect(mockUsersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ErrorUserNotFound if user not found', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(usersService.deleteId(1)).rejects.toThrow(ErrorUserNotFound);
    });
  });

  describe('updateId', () => {
    it('should update user and credential', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(user);
      mockUsersRepository.save.mockResolvedValue({
        ...user,
        ...updateUserDtoTest.user,
      });

      await usersService.updateId(2, updateUserDtoTest);

      expect(user.name).toBe('Peter');
      expect(user.credential.username).toBe('Petrovich');
    });
  });

  describe('findUserRolebyIdCredential', () => {
    it('should return user role by credential id', async () => {
      const queryBuilder = mockUsersRepository.createQueryBuilder();
      queryBuilder.getOne.mockResolvedValue(users[0]);
      const result = await usersService.findUserRolebyIdCredential(1);

      expect(result).toEqual({ id: 1, role: Role.ADMIN });
    });
  });

  describe('findUserRolebyId', () => {
    it('should return user role by user id', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(users[0]);

      const result = await usersService.findUserRolebyId(1);

      expect(result).toEqual({ id: 1, role: Role.ADMIN });
    });
  });
});
