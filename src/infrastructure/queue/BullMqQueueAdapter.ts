import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { IQueuePort, JobName } from '../../application/ports/IQueuePort';

const QUEUE_NAME = 'ai-learning';

export class BullMqQueueAdapter implements IQueuePort {
  private readonly queue: Queue;

  constructor(redis: Redis) {
    this.queue = new Queue(QUEUE_NAME, { connection: redis });
  }

  async enqueue<T extends Record<string, unknown>>(
    name: JobName,
    payload: T,
    opts?: { delayMs?: number; attempts?: number },
  ): Promise<void> {
    await this.queue.add(name, payload, {
      delay: opts?.delayMs,
      attempts: opts?.attempts ?? 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
  }

  getQueueName(): string {
    return QUEUE_NAME;
  }
}
