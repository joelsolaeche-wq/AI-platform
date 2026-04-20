/**
 * Port for realtime messaging (implemented by Pusher adapter).
 */
export interface IRealtimePort {
  publish(channel: string, event: string, payload: Record<string, unknown>): Promise<void>;
}
