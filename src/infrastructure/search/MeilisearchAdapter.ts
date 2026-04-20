import { MeiliSearch } from 'meilisearch';
import { ISearchIndexPort, SearchDocument } from '../../application/ports/ISearchIndexPort';

export class MeilisearchAdapter implements ISearchIndexPort {
  private readonly client: MeiliSearch;
  private readonly COURSES = 'courses';
  private readonly LESSONS = 'lessons';

  constructor(host: string, apiKey: string) {
    this.client = new MeiliSearch({ host, apiKey });
  }

  async indexCourse(doc: SearchDocument): Promise<void> {
    await this.client.index(this.COURSES).addDocuments([doc]);
  }

  async indexLesson(doc: SearchDocument): Promise<void> {
    await this.client.index(this.LESSONS).addDocuments([doc]);
  }

  async searchCourses(query: string, limit: number): Promise<string[]> {
    const res = await this.client.index(this.COURSES).search<{ id: string }>(query, { limit });
    return res.hits.map((h) => h.id);
  }
}
