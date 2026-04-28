/**
 * NextAuth.js v5 Route Handler.
 *
 * Exposes the Auth.js REST endpoints under /api/auth/* (e.g. sign-in, sign-out,
 * session, CSRF token) by re-exporting the GET and POST handlers produced by the
 * NextAuth initialiser in `lib/auth.ts`.
 *
 * @see https://authjs.dev/getting-started/installation#configure
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

export const runtime = 'nodejs';
