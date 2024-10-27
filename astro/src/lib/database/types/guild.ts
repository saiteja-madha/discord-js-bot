// @root/astro/lib/database/types/guild.ts
import type { Document } from 'mongoose'

export interface IGuildServer {
  name: string
  region: string
  owner: string
  joinedAt: Date
  leftAt?: Date
  bots: number
  updates_channel: string | null
  staff_roles: string[]
  setup_completed: boolean
  setup_message_id: string | null
  invite_link: string | null
}

export interface IGuildStats {
  enabled: boolean
  xp: {
    message: string
    channel?: string
  }
}

export interface IGuildTicket {
  log_channel?: string
  limit: number
  category: string | null
  enabled: boolean
  topics: Array<{
    name: string
  }>
}

export interface IGuildAutomod {
  debug?: boolean
  strikes: number
  action: 'TIMEOUT' | 'KICK' | 'BAN'
  wh_channels: string[]
  anti_attachments?: boolean
  anti_invites?: boolean
  anti_links?: boolean
  anti_spam?: boolean
  anti_ghostping?: boolean
  anti_massmention?: number
  max_lines?: number
}

export interface IGuildInvite {
  tracking: boolean
  ranks: Array<{
    invites: number
    _id: string
  }>
}

export interface IGuildLogs {
  enabled: boolean
  member: {
    message_edit: boolean
    message_delete: boolean
    role_changes: boolean
  }
  channel: {
    create: boolean
    edit: boolean
    delete: boolean
  }
  role: {
    create: boolean
    edit: boolean
    delete: boolean
  }
}

export interface IGuildMaxWarn {
  action: 'TIMEOUT' | 'KICK' | 'BAN'
  limit: number
}

export interface IGuildCounter {
  counter_type: string
  name: string
  channel_id: string
}

export interface IGuildEmbed {
  description?: string
  color?: string
  thumbnail?: boolean
  footer?: string
  image?: string
}

export interface IGuildWelcomeFarewell {
  enabled?: boolean
  channel?: string
  content?: string
  embed?: IGuildEmbed
}

export interface IGuildSuggestions {
  enabled?: boolean
  channel_id?: string
  approved_channel?: string
  rejected_channel?: string
}

export interface IGuild extends Document {
  _id: string
  server: IGuildServer
  stats: IGuildStats
  ticket: IGuildTicket
  automod: IGuildAutomod
  invite: IGuildInvite
  logs_channel?: string
  logs: IGuildLogs
  max_warn: IGuildMaxWarn
  counters: IGuildCounter[]
  welcome: IGuildWelcomeFarewell
  farewell: IGuildWelcomeFarewell
  autorole?: string
  suggestions?: IGuildSuggestions
}
