import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPostHog(apiKey: string, host: string): PostHog | null {
  if (!apiKey) return null;
  if (!client) {
    client = new PostHog(apiKey, { host });
  }
  return client;
}
