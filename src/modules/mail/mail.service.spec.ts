import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

const TEST_EMAIL = 'user@example.com';
const TEST_TOKEN = 'token123';
const TEST_BASE_URL = 'http://localhost:3000';

describe('MailService', () => {
  let service: MailService;
  const sendMailMock = jest.fn();

  beforeEach(async () => {
    sendMailMock.mockReset().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: { sendMail: sendMailMock },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'FRONTEND_BASE_URL') return TEST_BASE_URL;
              throw new Error(`Missing config: ${key}`);
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MailService);
  });

  it('is injectable', () => {
    expect(service).toBeDefined();
  });

  it('sends an invite email containing the token link', async () => {
    await service.sendInviteEmail(TEST_EMAIL, TEST_TOKEN);

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const payload = sendMailMock.mock.calls[0][0];
    expect(payload.to).toBe(TEST_EMAIL);
    expect(payload.subject).toContain('invited');

    expect(payload.template).toBe('invite');
    expect(payload.context).toEqual({
      inviteLink: `${TEST_BASE_URL}/invite?token=${TEST_TOKEN}`,
    });
  });

  it('propagates errors from the mailer', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP failed'));

    await expect(service.sendInviteEmail(TEST_EMAIL, TEST_TOKEN)).rejects.toThrow('SMTP failed');
  });

  it('throws if email is missing', async () => {
    await expect(service.sendInviteEmail('', TEST_TOKEN)).rejects.toThrow('Email is requried');
  });

  it('throws if token is missing', async () => {
    await expect(service.sendInviteEmail(TEST_EMAIL, '')).rejects.toThrow('Invite token is Required');
  });
});
