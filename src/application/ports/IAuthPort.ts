/**
 * Port for authentication/identity provider (implemented by WorkOS adapter).
 */
export interface AuthenticatedProfile {
  workosId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface IAuthPort {
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<AuthenticatedProfile>;
}
