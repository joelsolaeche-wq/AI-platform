import Pusher from 'pusher';
import { IRealtimePort } from '../../application/ports/IRealtimePort';

export class PusherRealtimeAdapter implements IRealtimePort {
  private readonly client: Pusher;

  constructor(appId: string, key: string, secret: string, cluster: string) {
    this.client = new Pusher({ appId, key, secret, cluster, useTLS: true });
  }

  async publish(channel: string, event: string, payload: Record<string, unknown>): Promise<void> {
    await this.client.trigger(channel, event, payload);
  }
}
