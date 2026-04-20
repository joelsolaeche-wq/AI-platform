/**
 * Port for transactional email (implemented by Resend adapter).
 */
export interface IEmailPort {
  send(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void>;
}
