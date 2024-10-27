// @root/astro/lib/database/schemas/Guild.ts
import mongoose from 'mongoose'
import type {
  IGuild,
  IGuildServer,
  IGuildStats,
  IGuildTicket,
  IGuildAutomod,
  IGuildInvite,
  IGuildLogs,
  IGuildMaxWarn,
  IGuildCounter,
  IGuildWelcomeFarewell,
  IGuildSuggestions,
} from '../types/guild'

const GuildServerSchema = new mongoose.Schema<IGuildServer>({
  name: { type: String, required: true },
  region: { type: String, required: true },
  owner: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  bots: { type: Number, default: 0 },
  updates_channel: { type: String, default: null },
  staff_roles: [{ type: String }],
  setup_completed: { type: Boolean, default: false },
  setup_message_id: { type: String, default: null },
  invite_link: { type: String, default: null },
})

const StatsSchema = new mongoose.Schema<IGuildStats>({
  enabled: { type: Boolean, default: false },
  xp: {
    message: { type: String, required: true },
    channel: String,
  },
})

const TicketSchema = new mongoose.Schema<IGuildTicket>({
  log_channel: String,
  limit: { type: Number, default: 5 },
  category: { type: String, default: null },
  enabled: { type: Boolean, default: false },
  topics: [
    {
      name: { type: String, required: true },
    },
  ],
})

const AutomodSchema = new mongoose.Schema<IGuildAutomod>({
  debug: { type: Boolean, default: false },
  strikes: { type: Number, default: 3 },
  action: {
    type: String,
    enum: ['TIMEOUT', 'KICK', 'BAN'],
    default: 'TIMEOUT',
  },
  wh_channels: [{ type: String }],
  anti_attachments: { type: Boolean, default: false },
  anti_invites: { type: Boolean, default: false },
  anti_links: { type: Boolean, default: false },
  anti_spam: { type: Boolean, default: false },
  anti_ghostping: { type: Boolean, default: false },
  anti_massmention: Number,
  max_lines: Number,
})

const InviteSchema = new mongoose.Schema<IGuildInvite>({
  tracking: { type: Boolean, default: false },
  ranks: [
    {
      invites: { type: Number, required: true },
      _id: { type: String, required: true },
    },
  ],
})

const LogsSchema = new mongoose.Schema<IGuildLogs>({
  enabled: { type: Boolean, default: false },
  member: {
    message_edit: { type: Boolean, default: false },
    message_delete: { type: Boolean, default: false },
    role_changes: { type: Boolean, default: false },
  },
  channel: {
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  role: {
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
})

const MaxWarnSchema = new mongoose.Schema<IGuildMaxWarn>({
  action: {
    type: String,
    enum: ['TIMEOUT', 'KICK', 'BAN'],
    default: 'TIMEOUT',
  },
  limit: { type: Number, default: 3 },
})

const CounterSchema = new mongoose.Schema<IGuildCounter>({
  counter_type: { type: String, required: true },
  name: { type: String, required: true },
  channel_id: { type: String, required: true },
})

const EmbedSchema = new mongoose.Schema({
  description: String,
  color: String,
  thumbnail: Boolean,
  footer: String,
  image: String,
})

const WelcomeFarewellSchema = new mongoose.Schema<IGuildWelcomeFarewell>({
  enabled: { type: Boolean, default: false },
  channel: String,
  content: String,
  embed: EmbedSchema,
})

const SuggestionsSchema = new mongoose.Schema<IGuildSuggestions>({
  enabled: { type: Boolean, default: false },
  channel_id: String,
  approved_channel: String,
  rejected_channel: String,
})

const GuildSchema = new mongoose.Schema<IGuild>({
  _id: { type: String, required: true },
  server: { type: GuildServerSchema, required: true },
  stats: { type: StatsSchema, default: () => ({}) },
  ticket: { type: TicketSchema, default: () => ({}) },
  automod: { type: AutomodSchema, default: () => ({}) },
  invite: { type: InviteSchema, default: () => ({}) },
  logs_channel: String,
  logs: { type: LogsSchema, default: () => ({}) },
  max_warn: { type: MaxWarnSchema, default: () => ({}) },
  counters: [CounterSchema],
  welcome: { type: WelcomeFarewellSchema, default: () => ({}) },
  farewell: { type: WelcomeFarewellSchema, default: () => ({}) },
  autorole: String,
  suggestions: { type: SuggestionsSchema, default: () => ({}) },
})

// Only create the model if it hasn't been created already
export const Guild =
  mongoose.models.guild || mongoose.model<IGuild>('guild', GuildSchema)

export default Guild
