/* eslint-disable 
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access
*/
import { Test, TestingModule } from '@nestjs/testing';
import { UserPostsService } from './user.posts.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  user,
  inputUserPostDtoTest,
  userPost,
  updateUserPostDtoTest,
  pageOptionsDtoTest,
  userPosts,
} from '../data/test.data';
import { UsersService } from '../users/users.service';
import { MinioClientService } from '../minio.client/minio.client.service';
import { UserPost } from './user.post.entity';
import { ErrorPostNotFound } from '../error/error.post-not-found';
import { OutputPostDto } from '../dto/output.dto/output.post.dto';

describe('UserPostsService (unit)', () => {
  let userPostsService: UserPostsService;
  let userPostsRepository: Repository<UserPost>;
  let usersService: UsersService;
  //let minioClientService: MinioClientService;

  const mockUserPostsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
  };

  const mockUsersService = {
    findIdForPost: jest.fn(),
  };

  const mockMinioClientService = {
    upload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserPost),
          useValue: mockUserPostsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MinioClientService,
          useValue: mockMinioClientService,
        },
        UserPostsService,
      ],
    }).compile();

    userPostsService = moduleRef.get<UserPostsService>(UserPostsService);
    userPostsRepository = moduleRef.get<Repository<UserPost>>(
      getRepositoryToken(UserPost),
    );
    usersService = moduleRef.get<UsersService>(UsersService);
    //minioClientService = moduleRef.get<MinioClientService>(MinioClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create user post ', async () => {
      mockUsersService.findIdForPost.mockResolvedValue(user);
      const savedUserPost = { ...inputUserPostDtoTest, user: user };
      mockUserPostsRepository.save.mockResolvedValue(savedUserPost);

      await userPostsService.createPost(user.id, inputUserPostDtoTest);

      expect(usersService.findIdForPost).toHaveBeenCalledWith(2);
      expect(userPostsRepository.save).toHaveBeenCalledWith(savedUserPost);
    });
  });

  describe('deletePostById', () => {
    it('should delete user post', async () => {
      mockUserPostsRepository.findOne.mockResolvedValue(userPost);
      mockUserPostsRepository.delete.mockResolvedValue({ affected: 1 });

      await userPostsService.deletePostById(1, 1);

      expect(userPostsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ErrorNotFoundPost if post not found', async () => {
      mockUserPostsRepository.findOne.mockResolvedValue(null);

      await expect(userPostsService.deletePostById(2, 5)).rejects.toThrow(
        ErrorPostNotFound,
      );
    });
  });

  describe('updatePostById', () => {
    it('should update post user', async () => {
      mockUserPostsRepository.findOne.mockResolvedValue(userPost);
      mockUserPostsRepository.save.mockResolvedValue({
        ...userPost,
        ...updateUserPostDtoTest,
      });

      await userPostsService.updatePostById(1, 1, updateUserPostDtoTest);

      expect(userPost.title).toEqual('Test post for test');
      expect(userPost.content).toEqual(
        'update content, update content, update content',
      );
    });

    it('should throw ErrorNotFoundPost if post not found', async () => {
      mockUserPostsRepository.findOne.mockResolvedValue(null);

      await expect(
        userPostsService.updatePostById(2, 5, updateUserPostDtoTest),
      ).rejects.toThrow(ErrorPostNotFound);
    });
  });

  describe('findAllPostsWithPagination', () => {
    it('should return paginated posts', async () => {
      const queryBuilder = mockUserPostsRepository.createQueryBuilder();

      queryBuilder.getCount.mockResolvedValue(2);
      queryBuilder.getMany.mockResolvedValue(userPosts);

      const result = await userPostsService.findAllPostsWithPagination(
        1,
        pageOptionsDtoTest,
      );

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalItemCount).toBe(2);
    });
  });

  describe('findPostById', () => {
    it('should return post', async () => {
      mockUserPostsRepository.findOneBy.mockResolvedValue(userPost);

      const result = await userPostsService.findPostById(1);

      expect(result).not.toContain(user);
      expect(result).toBeInstanceOf(OutputPostDto);
      expect(result.id).toBe(1);
    });

    it('should throw ErrorNotFoundPost if post not found', async () => {
      mockUserPostsRepository.findOneBy.mockResolvedValue(null);

      await expect(userPostsService.findPostById(2)).rejects.toThrow(
        ErrorPostNotFound,
      );
    });
  });
});
