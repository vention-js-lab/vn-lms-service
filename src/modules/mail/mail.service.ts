import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendInviteEmail(to: string, token: string): Promise<void> {
    const baseUrl = this.config.get<string>('APP_BASE_URL') ?? '';
    if (!baseUrl) throw new Error('APP_BASE_URL is not set');

    const inviteLink = `${baseUrl.replace(/\/$/, '')}/invite?token=${encodeURIComponent(token)}`;

    await this.mailer.sendMail({
      to,
      subject: 'You have been invited',
      text: `Use this link to accept the invite:\n\n${inviteLink}`,
      html: `
        <p>You have been invited.</p>
        <p><a href="${inviteLink}">Accept invite</a></p>
      `,
    });

    this.logger.log(`Invite email sent to ${to}`);
  }
}
