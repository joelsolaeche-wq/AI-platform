import { WorkOS } from '@workos-inc/node';
import { AuthenticatedProfile, IAuthPort } from '../../application/ports/IAuthPort';

export class WorkosAuthAdapter implements IAuthPort {
  private readonly client: WorkOS;

  constructor(
    apiKey: string,
    private readonly clientId: string,
    private readonly redirectUri: string,
  ) {
    this.client = new WorkOS(apiKey);
  }

  getAuthorizationUrl(state: string): string {
    return this.client.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      state,
    });
  }

  async exchangeCode(code: string): Promise<AuthenticatedProfile> {
    const result = await this.client.userManagement.authenticateWithCode({
      clientId: this.clientId,
      code,
    });
    return {
      workosId: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    };
  }
}
