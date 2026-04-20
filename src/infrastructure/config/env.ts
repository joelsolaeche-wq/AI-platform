/**
 * Centralized env loader. This is the ONLY place in the codebase that touches
 * process.env. Any other file that needs config should import from here.
 */
export interface AppEnv {
  nodeEnv: string;
  port: number;
  aiServiceUrl: string;
  databaseUrl: string;
  redisUrl: string;
  workos: {
    apiKey: string;
    clientId: string;
    redirectUri: string;
    cookiePassword: string;
  };
  anthropic: { apiKey: string; model: string };
  voyage: { apiKey: string; model: string };
  mux: { tokenId: string; tokenSecret: string; webhookSecret: string };
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicBaseUrl: string;
  };
  resend: { apiKey: string; from: string };
  pusher: { appId: string; key: string; secret: string; cluster: string };
  meili: { host: string; masterKey: string };
  sentry: { dsn: string };
  datadog: { apiKey: string; service: string; env: string };
  posthog: { apiKey: string; host: string };
}

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export function loadEnv(): AppEnv {
  return {
    nodeEnv: optional('NODE_ENV', 'development'),
    port: Number(optional('PORT', '3000')),
    aiServiceUrl: optional('AI_SERVICE_URL', 'http://localhost:8001'),
    databaseUrl: required('DATABASE_URL'),
    redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
    workos: {
      apiKey: optional('WORKOS_API_KEY'),
      clientId: optional('WORKOS_CLIENT_ID'),
      redirectUri: optional('WORKOS_REDIRECT_URI'),
      cookiePassword: optional('WORKOS_COOKIE_PASSWORD'),
    },
    anthropic: {
      apiKey: optional('ANTHROPIC_API_KEY'),
      model: optional('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514'),
    },
    voyage: {
      apiKey: optional('VOYAGE_API_KEY'),
      model: optional('VOYAGE_MODEL', 'voyage-3'),
    },
    mux: {
      tokenId: optional('MUX_TOKEN_ID'),
      tokenSecret: optional('MUX_TOKEN_SECRET'),
      webhookSecret: optional('MUX_WEBHOOK_SECRET'),
    },
    r2: {
      accountId: optional('R2_ACCOUNT_ID'),
      accessKeyId: optional('R2_ACCESS_KEY_ID'),
      secretAccessKey: optional('R2_SECRET_ACCESS_KEY'),
      bucket: optional('R2_BUCKET', 'ai-learning-assets'),
      publicBaseUrl: optional('R2_PUBLIC_BASE_URL'),
    },
    resend: {
      apiKey: optional('RESEND_API_KEY'),
      from: optional('EMAIL_FROM', 'noreply@example.com'),
    },
    pusher: {
      appId: optional('PUSHER_APP_ID'),
      key: optional('PUSHER_KEY'),
      secret: optional('PUSHER_SECRET'),
      cluster: optional('PUSHER_CLUSTER', 'us2'),
    },
    meili: {
      host: optional('MEILI_HOST', 'http://localhost:7700'),
      masterKey: optional('MEILI_MASTER_KEY', ''),
    },
    sentry: { dsn: optional('SENTRY_DSN') },
    datadog: {
      apiKey: optional('DD_API_KEY'),
      service: optional('DD_SERVICE', 'ai-learning-api'),
      env: optional('DD_ENV', 'development'),
    },
    posthog: {
      apiKey: optional('POSTHOG_API_KEY'),
      host: optional('POSTHOG_HOST', 'https://us.i.posthog.com'),
    },
  };
}
