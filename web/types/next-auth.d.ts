/**
 * Module augmentation for next-auth v5 (Auth.js).
 *
 * Extends the built-in Session and JWT types so that `session.user.id` and
 * `session.user.role` are properly typed throughout the application.
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */

import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';
import type { Role } from './index';

declare module 'next-auth' {
  /**
   * Extends the built-in Session type so that `session.user` carries
   * the extra fields populated by the session callback.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  /**
   * Extends the built-in User type so the Credentials `authorize` return value
   * is correctly typed (the object returned by `authorize` is assigned to `user`
   * inside the JWT callback).
   */
  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type with the extra claims written by the jwt callback.
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
