// @/middleware/auth.ts
import { defineMiddleware } from 'astro:middleware'
import { discordAuth } from '@/lib/discord-auth'
import {
  getAuthCookies,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/cookie-utils'

export const authGuard = defineMiddleware(
  async ({ cookies, redirect, url }, next) => {
    // Skip auth check for public routes
    const publicPaths = ['/', '/auth', '/dash/auth/callback']
    if (publicPaths.includes(url.pathname)) {
      return next()
    }

    // Check if this is a dashboard route that needs protection
    if (url.pathname.startsWith('/dash')) {
      console.log('🛡️ Auth guard checking:', url.pathname)
      const { accessToken, refreshToken } = getAuthCookies(cookies)

      // No tokens present - redirect to login
      if (!accessToken || !refreshToken) {
        console.log('🚫 No tokens found, redirecting to login')
        return redirect('/')
      }

      try {
        // First try to validate the current access token
        console.log('🔄 Validating access token...')
        const isValid = await discordAuth.validateToken(accessToken)

        if (!isValid) {
          console.log('♻️ Token invalid, attempting refresh...')
          // Token invalid - attempt refresh
          try {
            const newTokens = await discordAuth.refreshToken(refreshToken)
            const userData = await discordAuth.getUserInfo(
              newTokens.access_token
            )

            // Update all auth cookies with new token data
            setAuthCookies(cookies, newTokens, userData)
            console.log('✨ Tokens refreshed successfully')
          } catch (refreshError) {
            // Refresh failed - clear cookies and redirect to login
            console.error('❌ Token refresh failed:', refreshError)
            clearAuthCookies(cookies)
            return redirect('/')
          }
        }

        console.log('✅ Auth check passed')
        return next()
      } catch (error) {
        // Any other error - clear cookies and redirect
        console.error('💥 Auth error:', error)
        clearAuthCookies(cookies)
        return redirect('/')
      }
    }

    // Not a protected route
    return next()
  }
)
