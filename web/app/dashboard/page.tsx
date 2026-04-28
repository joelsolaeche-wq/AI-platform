import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';

/** Tailwind colour map for each role badge. */
const ROLE_COLOURS: Record<UserRole, string> = {
  STUDENT: 'bg-blue-100 text-blue-800',
  INSTRUCTOR: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { name, role } = session.user;
  const badgeColour = ROLE_COLOURS[role] ?? 'bg-gray-100 text-gray-800';

  return (
    <main className="container py-12">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Hello, {name}!</h1>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColour}`}
        >
          {role}
        </span>
      </div>
      <p className="text-muted-foreground">Welcome to your dashboard.</p>
    </main>
  );
}
