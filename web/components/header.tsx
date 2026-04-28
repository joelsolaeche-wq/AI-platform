import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';

/**
 * Server action — signs the user out and redirects to /login.
 * Must be an async function declared with "use server".
 */
async function handleSignOut() {
  'use server';
  await signOut({ redirect: false });
  redirect('/login');
}

/**
 * Header — Server Component.
 *
 * Renders a top navigation bar that is aware of the current auth session:
 *  - Authenticated  → shows the user's name and a "Log out" button.
 *  - Unauthenticated → shows "Login" and "Sign Up" links.
 */
export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          AI Learning Platform
        </Link>

        {/* Auth area */}
        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name ?? session.user.email}
              </span>
              <form action={handleSignOut}>
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
