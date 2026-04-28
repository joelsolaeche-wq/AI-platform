'use server';

import { z } from 'zod';
import { prisma } from '@/db';
import { hashPassword } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    name: z.string().min(1, { message: 'Name is required.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SignupInput = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export type FieldErrors = Partial<Record<keyof SignupInput, string[]>>;

export type SignupResult =
  | { success: true }
  | { errors: FieldErrors };

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

/**
 * Server action that validates signup form data, checks for duplicate emails,
 * hashes the password and persists a new User record with role STUDENT.
 *
 * Returns `{ success: true }` on success or `{ errors }` on failure.
 * Intentionally does NOT sign the user in — the calling page handles redirect.
 */
export async function signupAction(
  formData: FormData | SignupInput,
): Promise<SignupResult> {
  // Normalise FormData → plain object
  const raw: SignupInput =
    formData instanceof FormData
      ? {
          email: (formData.get('email') as string) ?? '',
          name: (formData.get('name') as string) ?? '',
          password: (formData.get('password') as string) ?? '',
          confirmPassword: (formData.get('confirmPassword') as string) ?? '',
        }
      : formData;

  // Validate
  const parsed = signupSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof SignupInput;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field]!.push(issue.message);
    }
    return { errors: fieldErrors };
  }

  const { email, name, password } = parsed.data;

  // Check for existing account
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: {
        email: ['An account with this email already exists.'],
      },
    };
  }

  // Hash password and persist user
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'STUDENT',
    },
  });

  return { success: true };
}
