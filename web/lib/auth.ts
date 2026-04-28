import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Uses Credentials provider as a thin adapter so the real authentication
 * logic remains in the NestJS API layer (Clean Architecture boundary).
 * The `auth()` helper is exported for use in Server Components / Actions.
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(
            `${process.env.NEXTAUTH_API_URL ?? 'http://localhost:3000'}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          if (!res.ok) return null;

          const user = (await res.json()) as {
            id: string;
            name: string;
            email: string;
          };
          return user;
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
