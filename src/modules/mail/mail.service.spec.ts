import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

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
            get: (key: string) => {
              if (key === 'APP_BASE_URL') return 'http://localhost:3000';
              return undefined;
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
    await service.sendInviteEmail('user@example.com', 'token123');

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const payload = sendMailMock.mock.calls[0][0];
    expect(payload.to).toBe('user@example.com');
    expect(payload.subject).toContain('invited');
    expect(payload.text).toContain('token=token123');
    expect(payload.html).toContain('token=token123');
    expect(payload.text).toContain('http://localhost:3000/invite?token=token123');
  });

  it('propagates errors from the mailer', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP failed'));

    await expect(service.sendInviteEmail('user@example.com', 'token123')).rejects.toThrow('SMTP failed');
  });
});
