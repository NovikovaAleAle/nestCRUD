import { ConflictException, Injectable, Logger } from '@nestjs/common';
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
import { BufferedFileDto } from '../dto/input.dto/buffered.file.dto';
import { MinioClientService } from '../minio.client/minio.client.service';
import { User } from '../users/user.entity';
import { UrlDto } from '../dto/interfaces';

@Injectable()
export class UserPostsService {
  private readonly logger = new Logger(UserPostsService.name);
  constructor(
    @InjectRepository(UserPost)
    private userPostsRepository: Repository<UserPost>,
    private readonly usersService: UsersService,
    private readonly minioClientService: MinioClientService,
  ) {}

  async createPost(userId: number, inputPostDto: InputPostDto): Promise<void> {
    const toUserPost: UserPost = plainToClass(UserPost, inputPostDto, {
      excludeExtraneousValues: true,
    });
    const user: User = await this.usersService.findIdForPost(userId);
    toUserPost.user = user;
    const post: UserPost = await this.userPostsRepository.save(toUserPost);
    this.logger.log(`Post id:${post.id} created`);
  }

  async deletePostById(userId: number, postId: number): Promise<void> {
    const post: UserPost | null = await this.userPostsRepository.findOne({
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
    const post: UserPost | null = await this.userPostsRepository.findOne({
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
        'post.image',
        'user.id',
        'user.name',
      ])
      .where('user.id = :userId', { userId: userId });
    const totalItemCountByUserId: number = await queryBuilder.getCount();
    const posts: UserPost[] = await queryBuilder
      .orderBy('post.id')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();
    const outputPosts: OutputPostDto[] = posts.map((post) =>
      plainToClass(OutputPostDto, post, {
        excludeExtraneousValues: true,
      }),
    );
    const pageMetaDto: PageMetaDto = new PageMetaDto(
      totalItemCountByUserId,
      pageOptionsDto,
    );
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
    const outputPost: OutputPostDto = plainToClass(OutputPostDto, post, {
      excludeExtraneousValues: true,
    });
    this.logger.log(`Post with id:${postId} found`);
    return outputPost;
  }

  async uploadImage(postId: number, image: BufferedFileDto): Promise<void> {
    const id = postId;
    const post: UserPost | null = await this.userPostsRepository.findOneBy({
      id,
    });
    if (!post) {
      this.logger.warn(`Post with id:${postId} not found`);
      throw new ErrorPostNotFound();
    }
    const urlImage: UrlDto = await this.minioClientService.upload(image);
    post.image = urlImage.url;
    await this.userPostsRepository.save(post);
    this.logger.log('Image saved');
  }

  async removeImage(postId: number): Promise<void> {
    const id = postId;
    const post: UserPost | null = await this.userPostsRepository.findOneBy({
      id,
    });
    if (!post) {
      this.logger.warn(`Post with id:${postId} not found`);
      throw new ErrorPostNotFound();
    }
    if (post.image !== null) {
      const parts = post.image.split('/');
      const extractedFilename = parts.pop();
      if (!extractedFilename) {
        this.logger.warn(`File name extraction error, post id:${postId}`);
        throw new Error('File name extraction error');
      }
      await this.minioClientService.remove(extractedFilename);
      post.image = null;
      await this.userPostsRepository.save(post);
      this.logger.log('Image removed');
    } else {
      this.logger.warn(`Image missing from the post id:${postId}`);
      throw new ConflictException('Image missing from the post');
    }
  }
}
