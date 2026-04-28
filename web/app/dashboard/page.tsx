/**
 * Dashboard page — protected route that users land on after sign-in.
 *
 * Uses the server-side `auth()` helper to retrieve the session and display
 * the logged-in user's name, id, and role.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { signOut } from '@/lib/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome back, {user.name ?? user.email}!</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-2 text-sm">
          <p>
            <span className="font-medium">User ID:</span>{' '}
            <code className="rounded bg-muted px-1">{user.id}</code>
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span>{' '}
            <span className="capitalize">{user.role}</span>
          </p>
        </CardContent>

        <CardFooter>
          <form action={signOutAction} className="w-full">
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
