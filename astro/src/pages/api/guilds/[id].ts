// @/pages/api/guilds/[id].ts
import type { APIRoute } from 'astro'
import { GuildManager } from '@/lib/database/mongoose'
import {
  authenticateRequest,
  AuthError,
  hasManageGuildPermission,
} from '@/lib/middleware/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

// Mark this as a server-side endpoint
export const prerender = false

// Helper to get guilds from Discord API
async function getDiscordGuilds(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch guilds from Discord')
  }

  return response.json()
}

interface DiscordGuild {
  id: string
  name: string
  permissions: string
  [key: string]: unknown
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const accessToken = await authenticateRequest(request)

    // Validate guildId parameter
    const guildId = params.id
    if (!guildId) {
      return createErrorResponse('Guild ID is required', 400)
    }

    // Get user's guilds from Discord
    const userGuilds = (await getDiscordGuilds(accessToken)) as DiscordGuild[]

    // Check if user has access to this guild
    const targetGuild = userGuilds.find(
      g => g.id === guildId && hasManageGuildPermission(g.permissions)
    )

    if (!targetGuild) {
      return createErrorResponse('No permission to manage this guild', 403)
    }

    // Get guild data from database
    const guildManager = await GuildManager.getInstance()
    const guild = await guildManager.getGuild(guildId)

    if (!guild) {
      return createErrorResponse('Guild not found', 404)
    }

    return createResponse(guild)
  } catch (error) {
    if (error instanceof AuthError) {
      return createErrorResponse(error.message, error.statusCode)
    }

    console.error('Error handling guild request:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const accessToken = await authenticateRequest(request)

    // Validate guildId parameter
    const guildId = params.id
    if (!guildId) {
      return createErrorResponse('Guild ID is required', 400)
    }

    // Get user's guilds from Discord
    const userGuilds = (await getDiscordGuilds(accessToken)) as DiscordGuild[]

    // Check if user has access to this guild
    const targetGuild = userGuilds.find(
      g => g.id === guildId && hasManageGuildPermission(g.permissions)
    )

    if (!targetGuild) {
      return createErrorResponse('No permission to manage this guild', 403)
    }

    // Parse update data
    const updateData = await request.json()

    // Get guild manager instance
    const guildManager = await GuildManager.getInstance()

    // Handle different update types
    let updatedGuild
    switch (updateData.type) {
      case 'automod':
        updatedGuild = await guildManager.updateAutomod(
          guildId,
          updateData.settings
        )
        break
      case 'welcome':
        updatedGuild = await guildManager.updateWelcome(
          guildId,
          updateData.settings
        )
        break
      case 'ticket':
        updatedGuild = await guildManager.updateTicket(
          guildId,
          updateData.settings
        )
        break
      case 'logs':
        updatedGuild = await guildManager.updateLogs(
          guildId,
          updateData.settings
        )
        break
      default:
        updatedGuild = await guildManager.updateGuild(guildId, updateData)
    }

    if (!updatedGuild) {
      return createErrorResponse('Failed to update guild', 500)
    }

    return createResponse(updatedGuild)
  } catch (error) {
    if (error instanceof AuthError) {
      return createErrorResponse(error.message, error.statusCode)
    }

    console.error('Error updating guild:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

export function getStaticPaths() {
  return []
}

