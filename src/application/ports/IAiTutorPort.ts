/**
 * Port for an AI tutor backend (implemented by Anthropic Claude adapter).
 * Defined in the application layer so use cases never depend on a specific SDK.
 */
export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorAnswer {
  answer: string;
  citedLessonIds: string[];
}

export interface IAiTutorPort {
  answer(params: {
    question: string;
    context: string[];
    history: TutorMessage[];
  }): Promise<TutorAnswer>;
}
