import { CredentialsService } from '../credentials/credentials.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { TestingModule, Test } from '@nestjs/testing';
import { TokenUuidService } from '../token.uuid/token.uuid.service';
import { hashedPassword } from '../helpers/bcrypt.pass.helper';
import { Role } from '../config/constants';
import { ErrorCredentialNotFound } from '../error/error.credential-not-found';
import uuidConfig from '../config/uuid.config';
import { uuidToken } from '../data/test.data';
import { ConflictException } from '@nestjs/common';

describe('AuthService (unit)', () => {
  let authService: AuthService;
  let credentialService: CredentialsService;
  let usersService: UsersService;
  let tokenUuidService: TokenUuidService;
  let mailService: MailService;

  const mockCredentialService = {
    findOneUsername: jest.fn(),
  };
  const mockUsersService = {
    findUserRolebyIdCredential: jest.fn(),
    findUserRolebyId: jest.fn(),
    setRole: jest.fn(),
  };
  const mockTokenUuidService = {
    validate: jest.fn(),
    activationTokenUuid: jest.fn(),
  };
  const mockMailService = {
    sendUserConfirmation: jest.fn(),
  };
  const mockUuidConfig = {
    uuidLifeTime: 43200000,
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CredentialsService,
          useValue: mockCredentialService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TokenUuidService,
          useValue: mockTokenUuidService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'testsecret',
            signOptions: { expiresIn: '3600s' },
          }),
        },
        {
          provide: uuidConfig.KEY,
          useValue: mockUuidConfig,
        },
        AuthService,
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    credentialService = moduleRef.get<CredentialsService>(CredentialsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    tokenUuidService = moduleRef.get<TokenUuidService>(TokenUuidService);
    mailService = moduleRef.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCredential', () => {
    it('should return credential without password if valid', async () => {
      const credential = {
        id: 1,
        username: 'usernameTest',
        password: await hashedPassword('123'),
        email: 'test@mail.ru',
      };
      mockCredentialService.findOneUsername.mockResolvedValue(credential);

      const result = await authService.validateCredential(
        'usernameTest',
        '123',
      );

      expect(credentialService.findOneUsername).toHaveBeenCalledWith(
        'usernameTest',
      );
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username');
      expect(result?.username).toContain('usernameTest');
    });

    it('should return null if password invalid', async () => {
      const credentialTestInvalid = {
        id: 1,
        username: 'usernameTest',
        password: await hashedPassword('456'),
        email: 'test@mail.ru',
      };
      mockCredentialService.findOneUsername.mockResolvedValue(
        credentialTestInvalid,
      );

      const result = await authService.validateCredential(
        'usernameTest',
        '123',
      );

      expect(result).toBeNull();
    });

    it('should return null if username invalid', async () => {
      mockCredentialService.findOneUsername.mockResolvedValue(null);

      const result = await authService.validateCredential(
        'usernameTest',
        '123',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const userRole = {
      id: 1,
      role: Role.USER,
    };

    it('should return jwt token', async () => {
      const credentialPartial = {
        id: 1,
        username: 'usernameTest',
        email: 'test@mailService.ru',
      };
      mockUsersService.findUserRolebyIdCredential.mockResolvedValue(userRole);

      const result = await authService.login(credentialPartial);

      expect(usersService.findUserRolebyIdCredential).toHaveBeenCalledWith(
        credentialPartial.id,
      );
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toMatch(
        /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      );
    });

    it('should throw ErrorCredentialNotFound if credential does not contain id', async () => {
      const credentialPartial = {
        username: 'usernameTest',
        email: 'test@mailService.ru',
      };
      await expect(authService.login(credentialPartial)).rejects.toThrow(
        ErrorCredentialNotFound,
      );
    });
  });

  describe('confirm', () => {
    const mockInputUuid = { uuid: 'c99a0227-79e3-4d27-ae27-2db79ee799fc' };
    it('should induce user service to set the role USER', async () => {
      const userRole = {
        id: 1,
        role: Role.GUEST,
      };
      mockTokenUuidService.validate.mockResolvedValue(uuidToken);
      mockUsersService.findUserRolebyId.mockResolvedValue(userRole);

      await authService.confirm(mockInputUuid);

      expect(usersService.setRole).toHaveBeenCalledWith(1, Role.USER);
      expect(tokenUuidService.activationTokenUuid).toHaveBeenCalledWith(
        uuidToken.uuid,
      );
    });

    it('should throw ConflictException if role USER alredy established', async () => {
      const userRole = {
        id: 1,
        role: Role.USER,
      };
      mockTokenUuidService.validate.mockResolvedValue(uuidToken);
      mockUsersService.findUserRolebyId.mockResolvedValue(userRole);

      await expect(authService.confirm(mockInputUuid)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('reconfirm', () => {
    const credentialPartial = {
      id: 1,
      username: 'usernameTest',
      email: 'test@mailService.ru',
    };
    it('should induce mail service to sent mail', async () => {
      const userRole = {
        id: 1,
        role: Role.GUEST,
      };
      mockUsersService.findUserRolebyIdCredential.mockResolvedValue(userRole);

      await authService.reconfirm(credentialPartial);

      expect(mailService.sendUserConfirmation).toHaveBeenCalledWith(
        1,
        credentialPartial,
      );
    });
    it('should throw ConflictException if role USER alredy established', async () => {
      const userRole = {
        id: 1,
        role: Role.USER,
      };
      mockUsersService.findUserRolebyIdCredential.mockResolvedValue(userRole);

      await expect(authService.reconfirm(credentialPartial)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
