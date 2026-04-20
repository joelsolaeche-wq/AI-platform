'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/lib/store';

interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
}

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<{ data: CourseDto[] }>('/courses'),
  });
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  return (
    <main className="container py-12">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Learning Platform</h1>
          <p className="text-muted-foreground mt-2">
            Personalized courses, AI tutoring, and adaptive learning.
          </p>
        </div>
        <Button onClick={toggleTheme} variant="outline">
          Theme: {theme}
        </Button>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured courses</h2>
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-red-600">Failed to load courses. Is the API running?</p>
        )}
        {data && (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {c.description}
                </p>
              </li>
            ))}
            {data.data.length === 0 && (
              <li className="text-muted-foreground">
                No published courses yet. Seed the database to get started.
              </li>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
