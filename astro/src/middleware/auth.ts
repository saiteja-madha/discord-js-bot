// @/middleware/auth.ts
import { defineMiddleware } from 'astro:middleware';
import { discordAuth } from '@/lib/discord-auth';
import {
  getAuthCookies,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/cookie-utils';


const authUrl = discordAuth.getAuthUrl();

// Add this type to better handle static/dynamic contexts
type RouteConfig = {
  path: string;
  requiresAuth: boolean;
  forceDynamic?: boolean;
};

// Define your routes configuration
const routes: RouteConfig[] = [
  { path: '/', requiresAuth: false },
  { path: '/auth', requiresAuth: false },
  { path: '/dash/auth/callback', requiresAuth: false },
  { path: '/api', requiresAuth: false },
  // All dashboard routes require auth and should be dynamic
  { path: '/dash', requiresAuth: true, forceDynamic: true },
  { path: '/api/guilds', requiresAuth: true, forceDynamic: true },
];

export const authGuard = defineMiddleware(async ({ cookies, redirect, url }, next) => {
  // Find matching route config
  const matchingRoute = routes.find((route) =>
    url.pathname.startsWith(route.path)
  );

  // If no matching route or doesn't require auth, continue
  if (!matchingRoute || !matchingRoute.requiresAuth) {
    return next();
  }

  // For routes requiring auth, ensure we're in a dynamic context
  if (matchingRoute.forceDynamic && !cookies.get) {
    console.warn(
      `Route ${url.pathname} requires dynamic rendering. Add 'export const prerender = false' to the page component.`
    );
    return redirect(authUrl);
  }

  console.log('🛡️ Auth guard checking:', url.pathname);
  const { accessToken, refreshToken } = getAuthCookies(cookies);
  // No tokens present - redirect to login
  if (!accessToken || !refreshToken) {
    console.log('🚫 No tokens found, redirecting to login');
    return redirect(authUrl);
  }

  try {
    console.log('🔄 Validating access token...');
    const isValid = await discordAuth.validateToken(accessToken);

    if (!isValid) {
      console.log('♻️ Token invalid, attempting refresh...');
      try {
        const newTokens = await discordAuth.refreshToken(refreshToken);
        const userData = await discordAuth.getUserInfo(newTokens.access_token);
        setAuthCookies(cookies, newTokens, userData);
        console.log('✨ Tokens refreshed successfully');
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        clearAuthCookies(cookies);
        return redirect('/');
      }
    }

    console.log('✅ Auth check passed');
    return next();
  } catch (error) {
    console.error('💥 Auth error:', error);
    clearAuthCookies(cookies);
    return redirect('/');
  }
});