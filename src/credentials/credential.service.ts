import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Credential } from './credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InputCredentialDto } from 'src/dto/input.dto/input.credential.dto';
import { hashedPassword } from 'src/auth/bcrypt.pass';
import { plainToClass } from 'class-transformer';
import { ErrorCredentialNotFound } from '../error/error.credential-not-found';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);
  constructor(
    @InjectRepository(Credential)
    private credentialsRepository: Repository<Credential>,
  ) {}

  async findOne(username: string): Promise<Credential | null> {
    const credential = await this.credentialsRepository.findOneBy({ username });
    if (!credential) {
      this.logger.warn(`Credential ${username} not found`);
      throw new ErrorCredentialNotFound();
    }
    return credential;
  }

  async signUp(
    inputCredential: InputCredentialDto,
  ): Promise<Partial<Credential>> {
    const hashPassword = await hashedPassword(inputCredential.password);
    inputCredential.password = hashPassword;
    const toCredential = plainToClass(Credential, inputCredential, {
      excludeExtraneousValues: true,
    });
    toCredential.authorization = false;
    try {
      const credential: Credential =
        await this.credentialsRepository.save(toCredential);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = credential;
      this.logger.log(`Credential id:${credential.id} created`);
      return result;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        this.logger.warn(
          `Credential with username ${inputCredential.username} already exist`,
        );
        throw new ConflictException(
          'Credential with this username already exist',
        );
      }
      throw error;
    }
  }

  async confirm(payloadCredential: Partial<Credential>): Promise<void> {
    const id = payloadCredential.id;
    const credential = await this.credentialsRepository.findOneBy({ id });
    if (!credential) {
      this.logger.warn(
        `Credential id: ${payloadCredential.id} from payload not found`,
      );
      throw new ErrorCredentialNotFound();
    }
    if (credential.authorization !== true) {
      credential.authorization = true;
      await this.credentialsRepository.save(credential);
      this.logger.log(
        `Credential id: ${payloadCredential.id} confirmed by email`,
      );
    }
  }
}
