// @root/astro/lib/database/types/user.ts
import type { Document } from 'mongoose';

export interface IUserFlag {
  reason: string;
  flaggedBy: string;
  flaggedAt: Date;
  serverId: string;
  serverName: string;
}

export interface IUserProfile {
  pronouns: string | null;
  birthdate: Date | null;
  age: number | null;
  region: string | null;
  languages: string[];
  timezone: string | null;
  bio: string | null;
  interests: string[];
  socials: Map<string, string>;
  favorites: Map<string, string>;
  goals: string[];
  privacy: {
    showAge: boolean;
    showRegion: boolean;
    showBirthdate: boolean;
    showPronouns: boolean;
  };
  lastUpdated: Date;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: string;
  username: string;
  discriminator: string;
  logged: boolean;
  coins: number;
  bank: number;
  reputation: {
    received: number;
    given: number;
    timestamp: Date | null;
  };
  daily: {
    streak: number;
    timestamp: Date | null;
  };
  flags: IUserFlag[];
  premium: {
    enabled: boolean;
    expiresAt: Date | null;
  };
  afk: {
    enabled: boolean;
    reason: string | null;
    since: Date | null;
    endTime: Date | null;
  };
  profile: IUserProfile;
  created_at: Date;
  updated_at: Date;
}
