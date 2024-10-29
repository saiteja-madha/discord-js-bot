// @/lib/auth-utils.ts
import type { AstroCookies } from 'astro'
import { getAuthCookies } from './cookie-utils'
import { discordAuth } from './discord-auth'

export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const { accessToken } = getAuthCookies(cookies)

  if (!accessToken) {
    return false
  }

  try {
    // Validate the token with Discord
    const isValid = await discordAuth.validateToken(accessToken)
    return isValid
  } catch (error) {
    console.error('Token validation failed:', error)
    return false
  }
}

export async function getUserData(cookies: AstroCookies) {
  const { accessToken, userData } = getAuthCookies(cookies)

  if (!accessToken) {
    return null
  }

  // If we have cached user data, return it
  if (userData) {
    return userData
  }

  // Otherwise fetch fresh data
  try {
    return await discordAuth.getUserInfo(accessToken)
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return null
  }
}
