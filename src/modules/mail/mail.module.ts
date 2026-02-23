import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get<string>('MAIL_SMTP_PORT') ?? '587');
        const secure = (config.get<string>('MAIL_SMTP_SECURE') ?? '').toLowerCase() === 'true';

        const host = config.get<string>('MAIL_SMTP_HOST');
        if (!host) throw new Error('MAIL_SMTP_HOST is required');

        const user = config.get<string>('MAIL_SMTP_USER') ?? '';
        const pass = config.get<string>('MAIL_SMTP_PASS') ?? '';

        return {
          transport: {
            host,
            port,
            secure,
            ...(user && pass ? { auth: { user, pass } } : {}),
          },
          defaults: {
            from: config.get<string>('MAIL_FROM') ?? 'no-reply@example.com',
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
