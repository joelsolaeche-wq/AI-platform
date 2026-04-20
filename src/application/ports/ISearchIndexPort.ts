/**
 * Port for full-text search index (implemented by Meilisearch adapter).
 */
export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  courseId?: string;
}

export interface ISearchIndexPort {
  indexCourse(doc: SearchDocument): Promise<void>;
  indexLesson(doc: SearchDocument): Promise<void>;
  searchCourses(query: string, limit: number): Promise<string[]>;
}
