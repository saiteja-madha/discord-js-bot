// @/lib/discord-auth.ts
import { z } from 'astro:content';

const envSchema = z.object({
  CLIENT_ID: z.string().min(1),
  CLIENT_SECRET: z.string().min(1),
  BASE_URL: z.string().transform((val) => {
    const isProduction = import.meta.env.PROD === true;
    if (isProduction) {
      if (val && val !== '/') {
        return val.startsWith('http') ? val : `https://${val}`;
      }
    }
    return val && val !== '/' ? val : 'http://localhost:4321';
  }),
});

interface DiscordAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export class DiscordAuth {
  private config: DiscordAuthConfig;
  private rateLimitMap = new Map<string, number>();

  constructor() {
    try {
      const env = envSchema.parse({
        CLIENT_ID: import.meta.env.CLIENT_ID,
        CLIENT_SECRET: import.meta.env.CLIENT_SECRET,
        BASE_URL: import.meta.env.BASE_URL,
      });

      this.config = {
        clientId: env.CLIENT_ID,
        clientSecret: env.CLIENT_SECRET,
        redirectUri: `${env.BASE_URL}/dash/auth/callback`,
        scopes: ['identify', 'guilds'],
      };
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw new Error('Required environment variables are missing or invalid');
    }
  }

  private async makeDiscordRequest(
    endpoint: string,
    options: RequestInit,
    skipRateLimit = false
  ): Promise<Response> {
    if (!skipRateLimit) {
      const now = Date.now();
      const lastRequest = this.rateLimitMap.get(endpoint) || 0;
      const timeGap = now - lastRequest;

      if (timeGap < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - timeGap));
      }

      this.rateLimitMap.set(endpoint, Date.now());
    }

    const response = await fetch(`https://discord.com/api/v10/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'User-Agent':
          'DiscordBot (https://github.com/yourusername/yourrepo, v1.0.0)',
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      await new Promise((resolve) =>
        setTimeout(resolve, parseInt(retryAfter || '1') * 1000)
      );
      return this.makeDiscordRequest(endpoint, options, true);
    }

    return response;
  }

  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  public async exchangeCode(code: string): Promise<TokenData> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    });

    const response = await this.makeDiscordRequest(
      'oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      },
      true
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Token exchange failed: ${error.error_description || response.statusText}`
      );
    }

    return response.json();
  }

  public async refreshToken(refreshToken: string): Promise<TokenData> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await this.makeDiscordRequest(
      'oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      },
      true
    );

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  public async getUserInfo(accessToken: string) {
    const response = await this.makeDiscordRequest('users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await this.makeDiscordRequest('oauth2/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      if (!import.meta.env.PROD && accessToken) {
        return true;
      }
      return false;
    }
  }
}

export const discordAuth = new DiscordAuth();
