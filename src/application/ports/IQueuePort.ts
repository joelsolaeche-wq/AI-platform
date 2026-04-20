/**
 * Port for background job queue (implemented by BullMQ adapter).
 * Keeps application code free of BullMQ types.
 */
export type JobName =
  | 'generate-lesson-embedding'
  | 'process-mux-webhook'
  | 'send-welcome-email'
  | 'reindex-course';

export interface IQueuePort {
  enqueue<T extends Record<string, unknown>>(
    name: JobName,
    payload: T,
    opts?: { delayMs?: number; attempts?: number },
  ): Promise<void>;
}
