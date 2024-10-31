// @/lib/cookie-utils.ts
import type { AstroCookies } from 'astro';
import type { TokenData } from './discord-auth';

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_DATA: 'user_data',
} as const;

export const COOKIE_OPTIONS = {
  path: '/',
  secure: import.meta.env.PROD, // Only use secure in production
  httpOnly: true,
  sameSite: 'lax' as const,
};

export function getAuthCookies(cookies: AstroCookies) {
  const accessToken = cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;
  const userId = cookies.get(AUTH_COOKIE_NAMES.USER_ID)?.value;
  const userDataStr = cookies.get(AUTH_COOKIE_NAMES.USER_DATA)?.value;

  return {
    accessToken,
    refreshToken,
    userId,
    userData: userDataStr ? JSON.parse(userDataStr) : null,
  };
}

export function setAuthCookies(
  cookies: AstroCookies,
  tokenData: TokenData,
  userData: any
): void {
  // Set access token
  cookies.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, tokenData.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: tokenData.expires_in,
  });

  // Set refresh token
  cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, tokenData.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  // Set user data
  if (userData) {
    cookies.set(AUTH_COOKIE_NAMES.USER_ID, userData.id, {
      ...COOKIE_OPTIONS,
      maxAge: tokenData.expires_in,
    });

    cookies.set(AUTH_COOKIE_NAMES.USER_DATA, JSON.stringify(userData), {
      ...COOKIE_OPTIONS,
      maxAge: tokenData.expires_in,
    });
  }
}

export function clearAuthCookies(cookies: AstroCookies): void {
  Object.values(AUTH_COOKIE_NAMES).forEach((cookieName) => {
    cookies.delete(cookieName, { path: '/' });
  });
}
