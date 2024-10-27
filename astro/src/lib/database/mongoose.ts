// @root/astro/lib/database/mongoose.ts
import mongoose from 'mongoose'
import { Guild } from './schemas/Guild'
import { User } from './schemas/User'
import type {
  IGuild,
  IGuildAutomod,
  IGuildWelcomeFarewell,
  IGuildTicket,
  IGuildLogs,
} from './types/guild'
import type { IUser, IUserProfile } from './types/user'

const MONGO_URI = import.meta.env.MONGO_CONNECTION

if (!MONGO_URI) {
  throw new Error('Missing MONGO_CONNECTION environment variable')
}

declare global {
  // eslint-disable-next-line no-var
  var mongoConnection: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | null
}

if (!global.mongoConnection) {
  global.mongoConnection = { conn: null, promise: null }
}

async function connectDB() {
  if (global.mongoConnection?.conn) {
    return global.mongoConnection.conn
  }

  if (!global.mongoConnection?.promise) {
    global.mongoConnection!.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
      })
      .then(mongoose => {
        console.log('MongoDB connected successfully')
        return mongoose
      })
  }

  try {
    global.mongoConnection!.conn =
      (await global.mongoConnection?.promise) || null
  } catch (e) {
    global.mongoConnection!.promise = null
    console.error('MongoDB connection error:', e)
    throw e
  }

  return global.mongoConnection!.conn
}

export class UserManager {
  private static instance: UserManager
  private constructor() {}

  static async getInstance(): Promise<UserManager> {
    if (!UserManager.instance) {
      await connectDB()
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  async getUser(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).lean()
    return user as IUser | null
  }

  async updateUser(
    userId: string,
    data: Partial<Omit<IUser, '_id'>>
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
    return user as IUser | null
  }

  async updateProfile(
    userId: string,
    profileData: Partial<IUserProfile>
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { profile: profileData } },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
    return user as IUser | null
  }

  async updatePrivacy(
    userId: string,
    privacySettings: Partial<IUserProfile['privacy']>
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'profile.privacy': privacySettings } },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
    return user as IUser | null
  }

  async togglePremium(
    userId: string,
    enabled: boolean,
    expiresAt?: Date
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'premium.enabled': enabled,
          'premium.expiresAt': expiresAt || null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
    return user as IUser | null
  }
}

export class GuildManager {
  private static instance: GuildManager
  private constructor() {}

  static async getInstance(): Promise<GuildManager> {
    if (!GuildManager.instance) {
      await connectDB()
      GuildManager.instance = new GuildManager()
    }
    return GuildManager.instance
  }

  async getGuild(guildId: string): Promise<IGuild | null> {
    const guild = await Guild.findById(guildId).lean()
    return guild as IGuild | null
  }

  async updateGuild(
    guildId: string,
    data: Partial<Omit<IGuild, '_id'>>
  ): Promise<IGuild | null> {
    const guild = await Guild.findByIdAndUpdate(
      guildId,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
    return guild as IGuild | null
  }

  async updateAutomod(
    guildId: string,
    automodSettings: Partial<IGuildAutomod>
  ): Promise<IGuild | null> {
    const currentGuild = await this.getGuild(guildId)
    if (!currentGuild) return null

    const updatedAutomod = {
      ...currentGuild.automod,
      ...automodSettings,
    }

    return this.updateGuild(guildId, { automod: updatedAutomod })
  }

  async updateWelcome(
    guildId: string,
    welcomeSettings: Partial<IGuildWelcomeFarewell>
  ): Promise<IGuild | null> {
    const currentGuild = await this.getGuild(guildId)
    if (!currentGuild) return null

    const updatedWelcome = {
      ...currentGuild.welcome,
      ...welcomeSettings,
    }

    return this.updateGuild(guildId, { welcome: updatedWelcome })
  }

  async updateTicket(
    guildId: string,
    ticketSettings: Partial<IGuildTicket>
  ): Promise<IGuild | null> {
    const currentGuild = await this.getGuild(guildId)
    if (!currentGuild) return null

    const updatedTicket = {
      ...currentGuild.ticket,
      ...ticketSettings,
    }

    return this.updateGuild(guildId, { ticket: updatedTicket })
  }

  async updateLogs(
    guildId: string,
    logsSettings: Partial<IGuildLogs>
  ): Promise<IGuild | null> {
    const currentGuild = await this.getGuild(guildId)
    if (!currentGuild) return null

    const updatedLogs = {
      ...currentGuild.logs,
      ...logsSettings,
    }

    return this.updateGuild(guildId, { logs: updatedLogs })
  }
}

export { Guild, User }
export default { GuildManager, UserManager }
