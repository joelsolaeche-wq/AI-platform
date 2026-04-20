import Anthropic from '@anthropic-ai/sdk';
import { IAiTutorPort, TutorAnswer, TutorMessage } from '../../application/ports/IAiTutorPort';

const SYSTEM_PROMPT = `You are a helpful AI tutor on an online learning platform.
Answer the learner's question using ONLY the provided course context.
If the context doesn't contain the answer, say so honestly.
When citing, reference lesson titles inline.
Keep answers concise, structured, and encouraging.`;

export class AnthropicTutorAdapter implements IAiTutorPort {
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async answer(params: {
    question: string;
    context: string[];
    history: TutorMessage[];
  }): Promise<TutorAnswer> {
    const contextBlock = params.context.length
      ? params.context.map((c, i) => `[Source ${i + 1}]\n${c}`).join('\n\n---\n\n')
      : '(no context available)';

    const messages: Anthropic.MessageParam[] = [
      ...params.history.map((m) => ({ role: m.role, content: m.content })),
      {
        role: 'user' as const,
        content: `Course context:\n${contextBlock}\n\nQuestion: ${params.question}`,
      },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    // Infra layer does not extract citations semantically; upstream pipeline
    // may pass cited IDs via context ordering. For now, return empty.
    return { answer: text, citedLessonIds: [] };
  }
}
