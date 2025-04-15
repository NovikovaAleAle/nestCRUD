import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from './credentials.service';
import { Repository } from 'typeorm';
import { Credential } from './credential.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { credential } from '../data/test.data';
import { ErrorCredentialNotFound } from '../error/error.credential-not-found';

describe('CredentialsService (unit)', () => {
  let credentialsService: CredentialsService;
  let credentialsRepository: Repository<Credential>;

  const mockRepositoryCredentials = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Credential),
          useValue: mockRepositoryCredentials,
        },
        CredentialsService,
      ],
    }).compile();

    credentialsService = moduleRef.get<CredentialsService>(CredentialsService);
    credentialsRepository = moduleRef.get<Repository<Credential>>(
      getRepositoryToken(Credential),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneUsername', () => {
    it('should return credential by username', async () => {
      mockRepositoryCredentials.findOneBy.mockResolvedValue(credential);

      const result = await credentialsService.findOneUsername('Ivanushka');

      expect(credentialsRepository.findOneBy).toHaveBeenCalledWith({
        username: 'Ivanushka',
      });
      expect(result).toEqual(expect.objectContaining({ id: 1 }));
      expect(result).toEqual(expect.objectContaining({ password: '123' }));
    });

    it('should throw ErrorNotFoundCredential if username not found', async () => {
      mockRepositoryCredentials.findOneBy.mockResolvedValueOnce(null);

      await expect(
        credentialsService.findOneUsername('invalidUsername'),
      ).rejects.toThrow(ErrorCredentialNotFound);
    });
  });

  describe('findOneId', () => {
    it('should return credential by id without password', async () => {
      mockRepositoryCredentials.findOneBy.mockResolvedValue(credential);

      const result = await credentialsService.findOneId(1);

      expect(credentialsRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(expect.objectContaining({ id: 1 }));
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ErrorNotFoundCredential if id not found', async () => {
      mockRepositoryCredentials.findOneBy.mockResolvedValueOnce(null);

      await expect(credentialsService.findOneId(3)).rejects.toThrow(
        ErrorCredentialNotFound,
      );
    });
  });
});
