import axios, { AxiosInstance } from 'axios';
import { IEmbeddingPort } from '../../application/ports/IEmbeddingPort';

interface VoyageResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

/**
 * Voyage AI embeddings adapter. Uses raw HTTP to keep the dep surface minimal.
 */
export class VoyageEmbeddingAdapter implements IEmbeddingPort {
  private readonly http: AxiosInstance;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.http = axios.create({
      baseURL: 'https://api.voyageai.com/v1',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    });
  }

  async embed(text: string): Promise<number[]> {
    const [vec] = await this.embedBatch([text]);
    return vec;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const resp = await this.http.post<VoyageResponse>('/embeddings', {
      input: texts,
      model: this.model,
      input_type: 'document',
    });
    return resp.data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}
