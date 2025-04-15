import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  uuidToken,
  mockCurrentTimeMinusLifeTimeUuid,
  mockRecivedUuid,
} from '../data/test.data';
import { TokenUuidService } from './token.uuid.service';
import { TokenUuid } from './token.uuid.entity';

describe('TokenUuidService (unit)', () => {
  let tokenUuidService: TokenUuidService;
  let tokenUuidRepository: Repository<TokenUuid>;

  const mockTokenUuidRepository = {
    save: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(TokenUuid),
          useValue: mockTokenUuidRepository,
        },
        TokenUuidService,
      ],
    }).compile();

    tokenUuidService = moduleRef.get<TokenUuidService>(TokenUuidService);
    tokenUuidRepository = moduleRef.get<Repository<TokenUuid>>(
      getRepositoryToken(TokenUuid),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return token if received uuid-token valid', async () => {
      mockTokenUuidRepository.findOneBy.mockResolvedValue(uuidToken);

      const result = await tokenUuidService.validate(
        mockRecivedUuid,
        mockCurrentTimeMinusLifeTimeUuid,
      );

      expect(tokenUuidRepository.findOneBy).toHaveBeenCalledWith({
        uuid: mockRecivedUuid,
      });
      expect(result).toHaveProperty('uuid');
      expect(result.uuid).toBe(mockRecivedUuid);
    });

    it('should throw Error if received uuid-token invalid', async () => {
      const mockRecivedUuidInvalid = 'ed65dd14-8011-4be4-b8a1-137ef8b34d91';

      mockTokenUuidRepository.findOneBy.mockResolvedValue(null);

      await expect(
        tokenUuidService.validate(
          mockRecivedUuidInvalid,
          mockCurrentTimeMinusLifeTimeUuid,
        ),
      ).rejects.toThrow(Error);
    });

    it('should throw Error if received uuid-token expired', async () => {
      const mockCurrentTimeMinusLifeTimeUuidInvalid = new Date(
        '2025-04-14 11:43:23.219642+00',
      ).getTime();
      mockTokenUuidRepository.findOneBy.mockResolvedValue(uuidToken);

      await expect(
        tokenUuidService.validate(
          mockRecivedUuid,
          mockCurrentTimeMinusLifeTimeUuidInvalid,
        ),
      ).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should return the created uuid-token', async () => {
      mockTokenUuidRepository.save.mockResolvedValueOnce(uuidToken);

      const result = await tokenUuidService.create(1);

      expect(tokenUuidRepository.save).toHaveBeenCalledWith({ userId: 1 });
      expect(result).toHaveProperty('uuid');
      expect(result.userId).toBe(1);
    });
  });

  describe('activationTokenUuid', () => {
    it('should update property activation value on true', async () => {
      await tokenUuidService.activationTokenUuid(mockRecivedUuid);

      expect(tokenUuidRepository.update).toHaveBeenCalledWith(
        { uuid: mockRecivedUuid },
        { activation: true },
      );
    });
  });
});
