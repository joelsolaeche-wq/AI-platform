import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export class InvalidCredentialsError extends CredentialsSignin {
  code = 'invalid_credentials';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new InvalidCredentialsError();
        }

        // Call the backend API to validate credentials
        const apiUrl =
          (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') +
          '/api/auth/login';

        let res: Response;
        try {
          res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
        } catch {
          throw new InvalidCredentialsError();
        }

        if (!res.ok) {
          throw new InvalidCredentialsError();
        }

        const user = (await res.json()) as {
          id: string;
          email: string;
          name?: string;
        };

        if (!user?.id) {
          throw new InvalidCredentialsError();
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});
