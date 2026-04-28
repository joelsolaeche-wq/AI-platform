/**
 * Server-side auth helper.
 *
 * `auth()` reads the session cookie set by the API after a successful
 * WorkOS authentication and returns the decoded session, or `null` when
 * the user is unauthenticated.
 *
 * This module is **server-only** — it relies on Next.js `cookies()` which
 * is not available in Client Components.
 */
import { cookies } from 'next/headers';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
}

const SESSION_COOKIE = 'session';

/**
 * Returns the current session from the session cookie, or `null` if the
 * user is not authenticated / the cookie is absent or malformed.
 */
export async function auth(): Promise<Session | null> {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) return null;

  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));

    if (
      typeof decoded?.id === 'string' &&
      typeof decoded?.name === 'string' &&
      typeof decoded?.email === 'string' &&
      typeof decoded?.role === 'string'
    ) {
      return {
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role as UserRole,
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}
