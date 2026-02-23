import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import type { EnvConfig } from '#/shared/configs';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        const host = configService.get('MAIL_SMTP_HOST', { infer: true });
        const port = configService.get('MAIL_SMTP_PORT', { infer: true });

        return {
          transport: {
            host,
            port,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
