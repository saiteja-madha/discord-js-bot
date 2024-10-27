// @/middleware/auth.ts
import { defineMiddleware } from 'astro:middleware'
import { discordAuth } from '@/lib/discord-auth'

export const authGuard = defineMiddleware(
  async ({ cookies, redirect, url }, next) => {
    // Skip auth check for public routes
    const publicPaths = ['/', '/auth', '/dash/auth/callback']
    if (publicPaths.includes(url.pathname)) {
      return next()
    }

    // Check if this is a dashboard route that needs protection
    if (url.pathname.startsWith('/dash')) {
      const accessToken = cookies.get('discord_access_token')
      const refreshToken = cookies.get('discord_refresh_token')

      // No tokens present - redirect to login
      if (!accessToken || !refreshToken) {
        return redirect('/')
      }

      try {
        // First try to validate the current access token
        const isValid = await discordAuth.validateToken(accessToken.value)

        if (!isValid) {
          // Token invalid - attempt refresh
          try {
            const newTokens = await discordAuth.refreshToken(refreshToken.value)

            // Set new access token
            cookies.set('discord_access_token', newTokens.access_token, {
              path: '/',
              secure: true,
              httpOnly: true,
              sameSite: 'lax',
              maxAge: newTokens.expires_in,
            })

            // Update refresh token if provided
            if (newTokens.refresh_token) {
              cookies.set('discord_refresh_token', newTokens.refresh_token, {
                path: '/',
                secure: true,
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
              })
            }
          } catch (refreshError) {
            // Refresh failed - clear cookies and redirect to login
            cookies.delete('discord_access_token', { path: '/' })
            cookies.delete('discord_refresh_token', { path: '/' })
            return redirect('/')
          }
        }

        // Token is valid or was successfully refreshed
        return next()
      } catch (error) {
        // Any other error - clear cookies and redirect
        cookies.delete('discord_access_token', { path: '/' })
        cookies.delete('discord_refresh_token', { path: '/' })
        return redirect('/')
      }
    }

    // Not a protected route
    return next()
  }
)
