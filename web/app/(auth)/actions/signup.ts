'use server';

export interface SignupFormState {
  errors?: {
    email?: string[];
    name?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Field-level validation
  const errors: SignupFormState['errors'] = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Please enter a valid email address.'];
  }

  if (!name || name.trim().length < 2) {
    errors.name = ['Full name must be at least 2 characters.'];
  }

  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters.'];
  }

  if (!confirmPassword || confirmPassword !== password) {
    errors.confirmPassword = ['Passwords do not match.'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const apiUrl =
      (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + '/api';

    const res = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      const messages = Array.isArray(body?.message)
        ? body.message
        : [body?.message ?? 'Signup failed. Please try again.'];
      return { errors: { _form: messages } };
    }

    return { success: true };
  } catch {
    return {
      errors: { _form: ['Unable to reach the server. Please try again later.'] },
    };
  }
}
