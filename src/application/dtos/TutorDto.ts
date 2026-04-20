export interface AskTutorInputDto {
  userId: string;
  courseId: string;
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AskTutorOutputDto {
  answer: string;
  citedLessonIds: string[];
}
