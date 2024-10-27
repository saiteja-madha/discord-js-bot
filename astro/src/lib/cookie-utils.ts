// @/lib/cookie-utils.ts
import type { AstroCookies } from 'astro'
import type { TokenData } from '@/lib/discord-auth'

interface CookieOptions {
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
}

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  secure: import.meta.env.PROD, // Only use secure in production
  httpOnly: true,
  sameSite: 'lax',
}

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'discord_access_token',
  REFRESH_TOKEN: 'discord_refresh_token',
  USER_DATA: 'discord_user',
} as const

export function setAuthCookies(
  cookies: AstroCookies,
  tokenData: TokenData,
  userData?: any
) {
  // Set access token
  cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokenData.access_token, {
    ...DEFAULT_OPTIONS,
    maxAge: tokenData.expires_in,
  })

  // Set refresh token
  cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokenData.refresh_token, {
    ...DEFAULT_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  // Set user data if provided
  if (userData) {
    cookies.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), {
      ...DEFAULT_OPTIONS,
      maxAge: tokenData.expires_in,
    })
  }
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' })
  cookies.delete(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' })
  cookies.delete(COOKIE_NAMES.USER_DATA, { path: '/' })
}
