import { MailerService } from '@nestjs-modules/mailer';
import { TokenUuidService } from '../token.uuid/token.uuid.service';
import { MailService } from './mail.service';
import { TestingModule, Test } from '@nestjs/testing';
import { ErrorEmailNotSent } from '../error/error.email-not-sent';

describe('MailService (unit)', () => {
  let mailService: MailService;
  let tokenUuidService: TokenUuidService;
  let mailerService: Partial<MailerService>;

  const mockTokenUuidService = {
    create: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TokenUuidService,
          useValue: mockTokenUuidService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        MailService,
      ],
    }).compile();

    mailService = moduleRef.get<MailService>(MailService);
    tokenUuidService = moduleRef.get<TokenUuidService>(TokenUuidService);
    mailerService = moduleRef.get<Partial<MailerService>>(MailerService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('sendUserConfirmation', () => {
    const credential = {
      username: 'usernameTest',
      email: 'test@mail.ru',
    };

    it('should induce mailer service to send mail with the supporting link', async () => {
      const mockTokenUuid = { uuid: 'c99a0227-79e3-4d27-ae27-2db79ee799fc' };
      mockTokenUuidService.create.mockResolvedValue(mockTokenUuid);
      const url = `http://127.0.0.1:3000/auth/confirm?uuid=${mockTokenUuid.uuid}`;
      mockMailerService.sendMail.mockResolvedValue({});

      await mailService.sendUserConfirmation(1, credential);

      expect(tokenUuidService.create).toHaveBeenCalledWith(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: credential.email,
        subject: 'Welcome to userCRUD app! Confirm your Email',
        template: './confirmation',
        context: { name: credential.username, link: url },
      });
    });

    it('should throw ErrorEmailNotSent if mail not sent', async () => {
      mockMailerService.sendMail.mockRejectedValue(Error);
      await expect(
        mailService.sendUserConfirmation(1, credential),
      ).rejects.toThrow(ErrorEmailNotSent);
    });
  });
});
