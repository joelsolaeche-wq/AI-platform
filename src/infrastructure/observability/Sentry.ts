import * as Sentry from '@sentry/node';

export function initSentry(dsn: string, environment: string): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
