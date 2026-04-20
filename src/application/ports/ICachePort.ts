/**
 * Port for distributed cache (implemented by Redis adapter).
 */
export interface ICachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSec?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
