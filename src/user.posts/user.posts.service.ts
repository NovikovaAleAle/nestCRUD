import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPost } from './user.post.entity';
import { InputPostDto } from '../dto/input.dto/input.post.dto';
import { UsersService } from '../users/users.service';
import { UpdatePostDto } from '../dto/input.dto/update.post.dto';
import { plainToClass } from 'class-transformer';
import { ErrorPostNotFound } from '../error/error.post-not-found';
import { OutputPostDto } from '../dto/output.dto/output.post.dto';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PagePostsDto } from '../dto/output.dto/page.posts.dto';
import { PageMetaDto } from '../dto/page.meta.dto';

@Injectable()
export class UserPostsService {
  private readonly logger = new Logger(UserPostsService.name);
  constructor(
    @InjectRepository(UserPost)
    private userPostsRepository: Repository<UserPost>,
    private usersService: UsersService,
  ) {}

  async createPost(userId: number, inputPostDto: InputPostDto): Promise<void> {
    const toUserPost = plainToClass(UserPost, inputPostDto, {
      excludeExtraneousValues: true,
    });
    const user = await this.usersService.findIdForPost(userId);
    toUserPost.user = user;
    const post = await this.userPostsRepository.save(toUserPost);
    this.logger.log(`Post id:${post.id} created`);
  }

  async deletePostById(userId: number, postId: number): Promise<void> {
    const post = await this.userPostsRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) {
      this.logger.warn(`Post to delete with id:${postId} not found`);
      throw new ErrorPostNotFound();
    }
    await this.userPostsRepository.delete(post.id);
    this.logger.log(`Post with id:${post.id} deleted`);
  }

  async updatePostById(
    userId: number,
    postId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const post = await this.userPostsRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) {
      this.logger.warn(`Post to update with id:${postId} not found`);
      throw new ErrorPostNotFound();
    }
    Object.assign(post, updatePostDto);
    await this.userPostsRepository.save(post);
    this.logger.log(`Post with id:${post.id} updated`);
  }

  async findAllPostsWithPagination(
    userId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PagePostsDto<OutputPostDto>> {
    const queryBuilder = this.userPostsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.photo',
        'user.id',
        'user.name',
      ])
      .where('user.id = :userId', { userId: userId });
    const totalItemCountByUserId: number = await queryBuilder.getCount();
    const posts = await queryBuilder
      .orderBy('post.id')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();
    const outputPosts = posts.map((post) =>
      plainToClass(OutputPostDto, post, {
        excludeExtraneousValues: true,
      }),
    );
    const pageMetaDto = new PageMetaDto(totalItemCountByUserId, pageOptionsDto);
    this.logger.log('Uploading a list of user posts');
    return new PagePostsDto(outputPosts, pageMetaDto);
  }

  async findPostById(postId: number): Promise<OutputPostDto> {
    const id = postId;
    const post: UserPost | null = await this.userPostsRepository.findOneBy({
      id,
    });
    if (!post) {
      this.logger.warn(`Post with id:${postId} not found`);
      throw new ErrorPostNotFound();
    }
    const outputUser = plainToClass(OutputPostDto, post, {
      excludeExtraneousValues: true,
    });
    this.logger.log(`Post with id:${postId} found`);
    return outputUser;
  }
}
