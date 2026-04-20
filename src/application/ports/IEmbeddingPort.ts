/**
 * Port for text embedding providers (implemented by Voyage AI adapter).
 */
export interface IEmbeddingPort {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
