export interface VectorSearchHit {
  lessonId: string;
  score: number;
}

export interface IVectorSearchPort {
  upsertLessonEmbedding(lessonId: string, embedding: number[]): Promise<void>;
  searchLessons(embedding: number[], limit: number): Promise<VectorSearchHit[]>;
}
