// @/lib/data-utils.ts
import { GuildManager } from '@/lib/database/mongoose';
import type { IGuild } from '@/lib/database/types/guild';
import { getAuthCookies } from '@/lib/cookie-utils';
import type { AstroCookies } from 'astro';

// Cache interface
interface Cache<T> {
  data: T;
  timestamp: number;
}

// In-memory cache
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const guildsCache = new Map<string, Cache<DiscordGuild[]>>();

export function clearGuildsCache(): void {
  guildsCache.clear();
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string;
  avatar: string;
  bot?: boolean;
  verified?: boolean;
}

export function getAvatarUrl(user: DiscordUser): string {
  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
}

export function getInitials(username?: string): string {
  return username ? username.charAt(0).toUpperCase() : '?';
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count?: number;
}

export function getServerIcon(guild: DiscordGuild): string | null {
  if (guild.icon) {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
  }
  return null;
}

async function handleDiscordResponse<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    const rateLimitData = await response.json();
    const retryAfter = (rateLimitData.retry_after || 5) * 1000;

    // Wait for the retry-after period
    await new Promise((resolve) => setTimeout(resolve, retryAfter));

    // Throw a specific error that can be caught and retried
    throw new Error('RATE_LIMITED');
  }

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`);
  }

  return response.json();
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<T> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await fetch(url, options);
      return await handleDiscordResponse<T>(response);
    } catch (error) {
      attempts++;

      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        continue; // Retry after waiting
      }

      if (attempts === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }

  throw new Error('Max retries exceeded');
}

export async function getDiscordUserData(
  cookies: AstroCookies
): Promise<DiscordUser> {
  const { accessToken, userData } = getAuthCookies(cookies);

  if (userData) {
    return userData;
  }

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  return await fetchWithRetry<DiscordUser>(
    'https://discord.com/api/users/@me',
    options
  );
}

export async function getDiscordGuilds(
  cookies: AstroCookies
): Promise<DiscordGuild[]> {
  const { accessToken } = getAuthCookies(cookies);

  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Check cache first
  const cached = guildsCache.get(accessToken);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const guildsData = await fetchWithRetry<DiscordGuild[]>(
    'https://discord.com/api/users/@me/guilds?with_counts=true',
    options
  );

  // Update cache
  guildsCache.set(accessToken, {
    data: guildsData,
    timestamp: Date.now(),
  });

  return guildsData;
}

export async function getConfiguredGuilds(
  cookies: AstroCookies
): Promise<IGuild[]> {
  const userGuilds = await getDiscordGuilds(cookies);

  const adminGuilds = userGuilds.filter((guild) => {
    const permissions = BigInt(guild.permissions);
    return (permissions & 0x8n) === 0x8n;
  });

  const guildManager = await GuildManager.getInstance();

  const configuredGuildPromises = adminGuilds.map((guild) => {
    return guildManager.getGuild(guild.id);
  });

  const configuredGuildResults = await Promise.all(configuredGuildPromises);

  const configuredGuilds = configuredGuildResults.filter(
    (guild): guild is IGuild => guild !== null
  );

  return configuredGuilds;
}
