import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';

/**
 * Mux webhook receiver. Signature validation should be added using
 * MUX_WEBHOOK_SECRET before promoting this endpoint to production.
 * The webhook forwards work to a BullMQ job rather than doing anything inline.
 */
@Controller('webhooks/mux')
export class MuxWebhookController {
  @Post()
  @HttpCode(200)
  async receive(
    @Headers('mux-signature') _signature: string,
    @Body() body: { type: string; data?: { id?: string } },
  ) {
    // In production: verify signature, then enqueue 'process-mux-webhook' job.
    return { received: true, type: body.type };
  }
}
