/**
 * Datadog APM bootstrap. Must be imported at the very top of the process entry,
 * before any instrumented module (Express, Redis, Prisma, etc.) is required.
 */
import tracer from 'dd-trace';

export function initDatadog(service: string, env: string): void {
  if (!process.env.DD_API_KEY) return;
  tracer.init({ service, env, logInjection: true });
}

export { tracer };
