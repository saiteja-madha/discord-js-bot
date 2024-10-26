//@root/web/src/lib/discord-auth.ts

import { z } from 'astro:content'
const envSchema = z.object({
  CLIENT_ID: z.string(),
  BOT_SECRET: z.string(),
  BASE_URL: z.string().url(),
})

interface DiscordAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export class DiscordAuth {
  private config: DiscordAuthConfig

  constructor() {
    try {
      // Validate environment variables using import.meta.env instead of process.env
      const env = envSchema.parse({
        CLIENT_ID: import.meta.env.CLIENT_ID,
        BOT_SECRET: import.meta.env.BOT_SECRET,
        BASE_URL: import.meta.env.BASE_URL || 'http://localhost:8080',
      })

      this.config = {
        clientId: env.CLIENT_ID,
        clientSecret: env.BOT_SECRET,
        redirectUri: `${env.BASE_URL}/web/auth/callback`,
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

  public async exchangeCode(code: string) {
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

    return response.json()
  }

  public async getUserInfo(accessToken: string) {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.json()
  }
}

export const discordAuth = new DiscordAuth()
console.log('Environment variables:', {
  CLIENT_ID: import.meta.env.CLIENT_ID,
  BOT_SECRET: import.meta.env.BOT_SECRET,
  BASE_URL: import.meta.env.BASE_URL,
})
