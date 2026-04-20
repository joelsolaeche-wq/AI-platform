import { Resend } from 'resend';
import { IEmailPort } from '../../application/ports/IEmailPort';

export class ResendEmailAdapter implements IEmailPort {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(params: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  }
}
