/**
 * Auth.js (next-auth v5) configuration.
 *
 * Responsibilities:
 *  - Declare the Credentials provider whose `authorize` function validates
 *    email + password against the backend API and returns { id, email, name, role }.
 *  - Wire the JWT callback so `token.id` and `token.role` are persisted from the
 *    user object returned by `authorize` (task 2.1).
 *  - Wire the session callback so `session.user.id` and `session.user.role` are
 *    exposed to every consumer of `auth()` / `useSession`.
 *
 * TypeScript types for the augmented session are declared in `types/next-auth.d.ts`.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { Role } from '@/types';

/** Shape of the object returned by the backend `/api/auth/login` endpoint. */
interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  /**
   * Use custom sign-in page instead of the built-in one.
   * The login flow (task 2.4) lives at /login.
   */
  pages: {
    signIn: '/login',
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      /**
       * Validates credentials against the backend API.
       * Must return `{ id, email, name, role }` on success, or `null` on failure.
       *
       * The returned object is forwarded as `user` inside the JWT callback so that
       * `token.id` and `token.role` can be populated on the first sign-in.
       */
      async authorize(credentials): Promise<LoginResponse | null> {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

        try {
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) return null;

          const user = (await res.json()) as LoginResponse;

          if (!user?.id || !user?.email) return null;

          return user;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback — called whenever a token is created or refreshed.
     *
     * On the first sign-in (`user` is present), we copy `id` and `role` from
     * the object returned by `authorize` into the token so they survive the
     * encryption round-trip.
     */
    async jwt({ token, user }) {
      if (user) {
        // `user` is the LoginResponse returned by `authorize` above.
        token.id = user.id as string;
        token.role = (user as LoginResponse).role;
      }
      return token;
    },

    /**
     * Session callback — called whenever a session is checked.
     *
     * Copies `id` and `role` from the (already-populated) JWT into
     * `session.user` so clients receive both fields.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
