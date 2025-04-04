import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenUuid } from './token.uuid.entity';
import { TokenUuidService } from './token.uuid.service';
@Module({
  imports: [TypeOrmModule.forFeature([TokenUuid])],
  providers: [TokenUuidService],
  exports: [TokenUuidService],
})
export class TokenUuidModule {}
