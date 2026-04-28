import type { Metadata } from 'next';
import Header from '@/components/header';

export const metadata: Metadata = {
  title: 'Dashboard — AI Learning Platform',
};

/**
 * Dashboard layout — Server Component.
 *
 * Wraps all /dashboard/* pages with the shared Header so that
 * authenticated navigation is available throughout the dashboard.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
