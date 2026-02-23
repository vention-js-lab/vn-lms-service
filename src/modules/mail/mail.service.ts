import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import type { EnvConfig } from '#/shared/configs';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  async sendInviteEmail(to: string, token: string): Promise<void> {
    const baseUrl = this.configService.get('FRONTEND_BASE_URL', { infer: true });

    const inviteLink = `${baseUrl}/invite?token=${encodeURIComponent(token)}`;
    await this.mailerService.sendMail({
      to,
      subject: 'You have been invited',
      template: 'invite', // maps to invite.pug
      context: { inviteLink },
      // keep text for deliverability / fallback if you want:
      text: `Use this link to accept the invite:\n\n${inviteLink}`,
    });
  }
}
