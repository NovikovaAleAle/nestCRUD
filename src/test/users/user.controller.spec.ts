import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorNotFound } from '../../users/error/error-not-found';

describe('UsersController', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  const users: User[] = [
    {
      id: 1,
      name: 'Ar',
      surname: 'Nr',
      age: 18,
    },
    {
      id: 2,
      name: 'Per',
      surname: 'Wer',
      age: 20,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(() => Promise.resolve({})),
            createQueryBuilder: () => ({
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn(() => Promise.resolve(users)),
            }),
            findOneBy: jest.fn(() => Promise.resolve({})),
            delete: jest.fn(() => Promise.resolve({})),
          },
        },
      ],
    }).compile();
    usersService = await module.get(UsersService);
    usersRepository = await module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser: User = { id: 1, name: 'Al', surname: 'Nov', age: 23 };
      jest.spyOn(usersRepository, 'save').mockResolvedValue(newUser);

      await usersService.create(newUser);

      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('findAllWithPagination', () => {
    it('should found all users', async () => {
      const result: User[] = await usersService.findAllWithPagination(
        1,
        users.length,
      );
      expect(result).toEqual(users);
    });
  });

  describe('findId', () => {
    it('should found user by id', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(users[0]);
      const result: User = await usersService.findId(1);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result.name).toEqual('Ar');
    });

    it('should be thrown error "ErrorNotFound" if user not found', async () => {
      expect.assertions(1);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      try {
        await usersService.findId(99);
      } catch (error) {
        expect(error instanceof ErrorNotFound).toBe(true);
      }
    });
  });
});
