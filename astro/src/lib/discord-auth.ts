// @/lib/discord-auth.ts
import { z } from 'astro:content'

const envSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  BASE_URL: z.string().transform(val => {
    const isProduction = import.meta.env.PROD === true
    if (isProduction) {
      if (val && val !== '/') {
        return val.startsWith('http') ? val : `https://${val}`
      }
    }
    return val && val !== '/' ? val : 'http://localhost:4321'
  }),
})

interface DiscordAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

interface TokenData {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export class DiscordAuth {
  private config: DiscordAuthConfig

  constructor() {
    try {
      const env = envSchema.parse({
        CLIENT_ID: import.meta.env.CLIENT_ID,
        CLIENT_SECRET: import.meta.env.CLIENT_SECRET,
        BASE_URL: import.meta.env.BASE_URL,
      })

      this.config = {
        clientId: env.CLIENT_ID,
        clientSecret: env.CLIENT_SECRET,
        redirectUri: `${env.BASE_URL}/dash/auth/callback`,
        scopes: ['identify', 'guilds'],
      }
    } catch (error) {
      console.error('Environment validation failed:', error)
      throw new Error('Required environment variables are missing or invalid')
    }
  }

  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  public async exchangeCode(code: string): Promise<TokenData> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  public async refreshToken(refreshToken: string): Promise<TokenData> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }

  public async getUserInfo(accessToken: string) {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    return response.json()
  }

  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://discord.com/api/oauth2/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const discordAuth: DiscordAuth = new DiscordAuth()


