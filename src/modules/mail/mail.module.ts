import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';
import type { EnvConfig } from '#/shared/configs';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        const host = configService.getOrThrow<EnvConfig['MAIL_SMTP_HOST']>('MAIL_SMTP_HOST');
        const port = configService.getOrThrow<EnvConfig['MAIL_SMTP_PORT']>('MAIL_SMTP_PORT');

        return {
          transport: {
            host,
            port,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new PugAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
