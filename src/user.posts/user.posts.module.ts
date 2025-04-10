import { Module } from '@nestjs/common';
import { UserPostsController } from './user.posts.controller';
import { UserPostsService } from './user.posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPost } from './user.post.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { KafkaModule } from '../kafka/kafka.module';
import { MinioClientModule } from '../minio.client/minio.client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPost, User]),
    KafkaModule,
    MinioClientModule,
  ],
  controllers: [UserPostsController],
  providers: [UserPostsService, UsersService],
})
export class UserPostsModule {}
