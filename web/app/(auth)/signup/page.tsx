'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signupAction, type SignupFormState } from '../actions/signup';

const initialState: SignupFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Creating account…
        </>
      ) : (
        'Create account'
      )}
    </Button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(signupAction, initialState);

  // Client-side password-match validation shown before submit
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

  // Redirect to /login on successful signup
  useEffect(() => {
    if (state.success) {
      router.push('/login' as unknown as Route<string>);
    }
  }, [state.success, router]);

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPasswordValue(value);
    if (confirmPasswordValue && value !== confirmPasswordValue) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError(null);
    }
  }

  function handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setConfirmPasswordValue(value);
    if (value && passwordValue && value !== passwordValue) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError(null);
    }
  }

  // Merge server-side confirm-password error with client-side error
  const confirmPasswordDisplayError =
    state.errors?.confirmPassword?.[0] ?? confirmPasswordError ?? null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to get started.
            </CardDescription>
          </CardHeader>

          <form action={formAction} noValidate>
            <CardContent className="grid gap-4">
              {/* Form-level error */}
              {state.errors?._form && state.errors._form.length > 0 && (
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {state.errors._form.map((msg) => (
                    <p key={msg}>{msg}</p>
                  ))}
                </div>
              )}

              {/* Email */}
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-describedby={state.errors?.email ? 'email-error' : undefined}
                  aria-invalid={!!state.errors?.email}
                />
                {state.errors?.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Full name */}
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  aria-describedby={state.errors?.name ? 'name-error' : undefined}
                  aria-invalid={!!state.errors?.name}
                />
                {state.errors?.name && (
                  <p id="name-error" className="text-sm text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={passwordValue}
                  onChange={handlePasswordChange}
                  aria-describedby={
                    state.errors?.password ? 'password-error' : undefined
                  }
                  aria-invalid={!!state.errors?.password}
                />
                {state.errors?.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPasswordValue}
                  onChange={handleConfirmPasswordChange}
                  aria-describedby={
                    confirmPasswordDisplayError
                      ? 'confirm-password-error'
                      : undefined
                  }
                  aria-invalid={!!confirmPasswordDisplayError}
                />
                {confirmPasswordDisplayError && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-destructive"
                  >
                    {confirmPasswordDisplayError}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <SubmitButton />

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link
                  href={'/login' as unknown as Route<string>}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
