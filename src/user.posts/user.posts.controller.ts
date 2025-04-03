import {
  Controller,
  Logger,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
  ParseFilePipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserPostsService } from './user.posts.service';
import { InputPostDto } from '../dto/input.dto/input.post.dto';
import { UpdatePostDto } from '../dto/input.dto/update.post.dto';
import { errorsHandler } from '../error/errors.handler';
import { ErrorUserNotFound } from '../error/error.user-not-found';
import { ErrorPostNotFound } from '../error/error.post-not-found';
import { OutputPostDto } from '../dto/output.dto/output.post.dto';
import { PagePostsDto } from '../dto/output.dto/page.posts.dto';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { BufferedFileDto } from '../dto/input.dto/buffered.file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/guards/roles/roles.decorator';
import { Role } from '../config/constants';

@ApiTags('User Posts')
@ApiBearerAuth()
@Controller('users/:id/posts')
export class UserPostsController {
  private readonly logger = new Logger(UserPostsController.name);
  constructor(private readonly userPostsService: UserPostsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Creation of a post by a user' })
  @ApiBody({ type: InputPostDto })
  @ApiResponse({
    status: 200,
    description: 'Message to create the poste',
    type: String,
  })
  @Post()
  async createPost(
    @Param('id', ParseIntPipe) userId: number,
    @Body() inputPostDto: InputPostDto,
  ): Promise<string> {
    try {
      await this.userPostsService.createPost(userId, inputPostDto);
      return 'Post created';
    } catch (error) {
      this.logger.error(`createPost, ${error}`);
      throw errorsHandler(error as Error | ErrorUserNotFound);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Deleting the user post by id' })
  @ApiResponse({
    status: 200,
    description: 'Message to delete the post',
    type: String,
  })
  @Delete(':idpost')
  async deletePostById(
    @Param('id', ParseIntPipe) userId: number,
    @Param('idpost', ParseIntPipe) postId: number,
  ): Promise<string> {
    try {
      await this.userPostsService.deletePostById(userId, postId);
      return 'Post deleted';
    } catch (error) {
      this.logger.error(
        `deletePostById, user id:${userId}, post id:${postId}, ${error}`,
      );
      throw errorsHandler(error as Error | ErrorPostNotFound);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Updating the user post by id' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Message to update the post',
    type: String,
  })
  @Patch(':idpost')
  async updatePostById(
    @Param('id', ParseIntPipe) userId: number,
    @Param('idpost', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<string> {
    try {
      await this.userPostsService.updatePostById(userId, postId, updatePostDto);
      return 'Post updated';
    } catch (error) {
      this.logger.error(
        `updatePostById, user id:${userId}, post id:${postId}, ${error}`,
      );
      throw errorsHandler(error as Error | ErrorPostNotFound);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Search for all user posts with pagination' })
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: PagePostsDto<OutputPostDto>,
  })
  @Get()
  async findAllPostsWithPagination(
    @Param('id', ParseIntPipe) userId: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PagePostsDto<OutputPostDto>> {
    try {
      const pagePosts = await this.userPostsService.findAllPostsWithPagination(
        userId,
        pageOptionsDto,
      );
      return pagePosts;
    } catch (error) {
      this.logger.error(`findAllPostsWithPagination, ${error}`);
      throw errorsHandler(error as Error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Search the user post by id' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: OutputPostDto,
  })
  @Get(':idpost')
  async findPostById(
    @Param('idpost', ParseIntPipe) postId: number,
  ): Promise<OutputPostDto> {
    try {
      const outputPost = await this.userPostsService.findPostById(postId);
      return outputPost;
    } catch (error) {
      this.logger.error(`findPostById, post id:${postId}, ${error}`);
      throw errorsHandler(error as Error | ErrorPostNotFound);
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Upload image in the user post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image for upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'MIME-type: image/png, image/jpeg, image/jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful upload message',
    type: String,
  })
  @Post(':idpost')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('idpost', ParseIntPipe) postId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    image: BufferedFileDto,
  ): Promise<string> {
    try {
      await this.userPostsService.uploadImage(postId, image);
      return 'Image upload';
    } catch (error) {
      this.logger.error(`uploadImage, post id:${postId}, ${error}`);
      throw errorsHandler(error as Error | HttpException | ErrorPostNotFound);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER])
  @ApiOperation({ summary: 'Remove the image from the user post' })
  @ApiResponse({
    status: 200,
    description: 'Successful remove message',
    type: String,
  })
  @Delete(':idpost/image')
  async removeImage(
    @Param('idpost', ParseIntPipe) postId: number,
  ): Promise<string> {
    try {
      await this.userPostsService.removeImage(postId);
      return 'Image removed';
    } catch (error) {
      this.logger.error(`removeImage, post id:${postId}, ${error}`);
      throw errorsHandler(
        error as Error | HttpException | ErrorPostNotFound | ConflictException,
      );
    }
  }
}
