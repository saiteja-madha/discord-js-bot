// @/lib/data-utils.ts
import { GuildManager } from '@/lib/database/mongoose';
import type { IGuild } from '@/lib/database/types/guild';
import { getAuthCookies } from '@/lib/cookie-utils';
import type { AstroCookies } from 'astro';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  verified?: boolean;
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

export async function getDiscordUserData(
  cookies: AstroCookies
): Promise<DiscordUser> {
  const { accessToken, refreshToken, userData } = getAuthCookies(cookies);

  // First check if we have valid cached user data
  if (userData) {
    return userData;
  }

  if (!accessToken) {
    throw new Error('No access token found');
  }

  console.debug('Fetching Discord user data with access token:', accessToken);

  try {
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.error(`Failed to fetch user data: ${userResponse.statusText}`);
      throw new Error(`Failed to fetch user data: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    console.debug('Fetched Discord user data:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function getDiscordGuilds(
  cookies: AstroCookies
): Promise<DiscordGuild[]> {
  const { accessToken } = getAuthCookies(cookies);

  if (!accessToken) {
    throw new Error('No access token found');
  }

  console.debug('Fetching Discord guilds with access token:', accessToken);

  const guildsResponse = await fetch(
    'https://discord.com/api/users/@me/guilds?with_counts=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!guildsResponse.ok) {
    console.error(`Failed to fetch guilds: ${guildsResponse.statusText}`);
    throw new Error(`Failed to fetch guilds: ${guildsResponse.statusText}`);
  }

  const guildsData = await guildsResponse.json();
  console.debug('Fetched Discord guilds:', guildsData);
  return guildsData;
}

export async function getConfiguredGuilds(
  cookies: AstroCookies
): Promise<IGuild[]> {
  console.debug('Getting configured guilds');
  const userGuilds = await getDiscordGuilds(cookies);
  console.debug('User guilds:', userGuilds);

  // Filter guilds where user has admin permissions (0x8)
  const adminGuilds = userGuilds.filter((guild) => {
    const permissions = BigInt(guild.permissions);
    const hasAdminPermissions = (permissions & 0x8n) === 0x8n;
    console.debug(
      `Guild ${guild.id} has admin permissions:`,
      hasAdminPermissions
    );
    return hasAdminPermissions;
  });

  console.debug('Admin guilds:', adminGuilds);

  // Get configured guilds from database
  const guildManager = await GuildManager.getInstance();
  console.debug('GuildManager instance obtained:', guildManager);

  const configuredGuildPromises = adminGuilds.map((guild) => {
    console.debug(`Fetching configured guild for guild ID: ${guild.id}`);
    return guildManager.getGuild(guild.id);
  });

  const configuredGuildResults = await Promise.all(configuredGuildPromises);
  console.debug('Configured guild results:', configuredGuildResults);

  const configuredGuilds = configuredGuildResults.filter(
    (guild): guild is IGuild => guild !== null
  );

  console.debug('Filtered configured guilds:', configuredGuilds);
  return configuredGuilds;
}
