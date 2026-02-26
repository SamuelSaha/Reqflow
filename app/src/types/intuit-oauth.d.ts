/**
 * Type definitions for intuit-oauth
 * https://github.com/intuit/oauth-jsclient
 */

declare module "intuit-oauth" {
  export interface OAuthToken {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    x_refresh_token_expires_in?: number;
  }

  export interface OAuthClientConfig {
    clientId: string;
    clientSecret: string;
    environment: "sandbox" | "production";
    redirectUri: string;
  }

  export default class OAuthClient {
    constructor(config: OAuthClientConfig);

    authorizeUri(params: {
      scope: string[];
      state?: string;
    }): string;

    createToken(url: string): Promise<OAuthToken>;

    getToken(): OAuthToken;

    refresh(): Promise<OAuthToken>;

    revoke(params?: { access_token?: string; refresh_token?: string }): Promise<void>;

    token: {
      setToken(token: OAuthToken): void;
      getToken(): OAuthToken;
    };

    environment: string;

    static scopes: {
      Accounting: string;
      Payment: string;
      Payroll: string;
      TimeTracking: string;
      Benefits: string;
      Profile: string;
      Email: string;
      Phone: string;
      Address: string;
      OpenId: string;
      Intuit_name: string;
    };
  }
}
