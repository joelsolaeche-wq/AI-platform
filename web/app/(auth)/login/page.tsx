/**
 * Login page — task 2.4.
 *
 * Submits credentials to the Auth.js Credentials provider via a Server Action
 * and redirects to /dashboard on success.  On failure the user is sent back to
 * this page with `?error=CredentialsSignin` in the URL.
 */

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginPageProps {
  searchParams: { error?: string; callbackUrl?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage =
    searchParams.error === 'CredentialsSignin'
      ? 'Invalid email or password.'
      : searchParams.error
        ? 'Something went wrong. Please try again.'
        : null;

  const callbackUrl = searchParams.callbackUrl ?? '/dashboard';

  async function loginAction(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/login?error=${error.type}`);
      }
      // Re-throw redirect responses so Next.js handles them correctly.
      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access the platform.
          </CardDescription>
        </CardHeader>

        <form action={loginAction}>
          <CardContent className="grid gap-4">
            {errorMessage && (
              <p role="alert" className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
