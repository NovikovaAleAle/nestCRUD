import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenUuid } from './token.uuid.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenUuidService {
  private readonly logger = new Logger(TokenUuidService.name);
  constructor(
    @InjectRepository(TokenUuid)
    private tokenUuidRepository: Repository<TokenUuid>,
  ) {}

  async validate(
    uuid: string,
    currentTimeMinusLifeTimeUuid: number,
  ): Promise<TokenUuid> {
    const token: TokenUuid | null = await this.tokenUuidRepository.findOneBy({ 
      uuid,
    });
    if (token && (token.createdAt.getTime() >= currentTimeMinusLifeTimeUuid)) {
      this.logger.log(`Token-uuid: ${uuid} valid`);
      return token;
    }
    this.logger.warn(`Invalid token-uuid: ${uuid}`);
    throw new Error('Invalid token-uuid');
  }

  async create(userId: number): Promise<TokenUuid> {
    const token = new TokenUuid();
    token.userId = userId;
    const tokenUuid: TokenUuid = await this.tokenUuidRepository.save(token);
    this.logger.log(`Token UUID: ${token} created`);
    return tokenUuid;
  }

  async activationTokenUuid(uuid: string): Promise<void> {
    await this.tokenUuidRepository.update({ uuid }, { activation: true });
    this.logger.log(`Token activated`);
  }
}
