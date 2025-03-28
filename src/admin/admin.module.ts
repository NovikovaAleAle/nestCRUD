import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { AdminService } from './admin.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [
    AdminService,
  ],
})
export class AdminModule {}
