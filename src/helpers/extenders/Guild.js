const { Guild, ChannelType } = require("discord.js");

const ROLE_MENTION = /<?@?&?(\d{17,20})>?/;
const CHANNEL_MENTION = /<?#?(\d{17,20})>?/;
const MEMBER_MENTION = /<?@?!?(\d{17,20})>?/;

/**
 * Get all channels that match the query
 * @param {string} query
 * @param {import("discord.js").GuildChannelTypes[]} type
 */
Guild.prototype.findMatchingChannels = function (query, type = [ChannelType.GuildText, ChannelType.GuildAnnouncement]) {
  if (!this || !query || typeof query !== "string") return [];

  const channelManager = this.channels.cache.filter((ch) => type.includes(ch.type));

  const patternMatch = query.match(CHANNEL_MENTION);
  if (patternMatch) {
    const id = patternMatch[1];
    const channel = channelManager.find((r) => r.id === id);
    if (channel) return [channel];
  }

  const exact = [];
  const startsWith = [];
  const includes = [];
  channelManager.forEach((ch) => {
    const lowerName = ch.name.toLowerCase();
    if (ch.name === query) exact.push(ch);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(ch);
    if (lowerName.includes(query.toLowerCase())) includes.push(ch);
  });

  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
};

/**
 * Get all channels that match the query
 * @param {string} query
 * @param {import("discord.js").GuildChannelTypes[]} type
 */
Guild.prototype.findMatchingVoiceChannels = function (
  query,
  type = [ChannelType.GuildVoice, ChannelType.GuildStageVoice]
) {
  if (!this || !query || typeof query !== "string") return [];

  const channelManager = this.channels.cache.filter((ch) => type.includes(ch.type));

  const patternMatch = query.match(CHANNEL_MENTION);
  if (patternMatch) {
    const id = patternMatch[1];
    const channel = channelManager.find((r) => r.id === id);
    if (channel) return [channel];
  }

  const exact = [];
  const startsWith = [];
  const includes = [];
  channelManager.forEach((ch) => {
    const lowerName = ch.name.toLowerCase();
    if (ch.name === query) exact.push(ch);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(ch);
    if (lowerName.includes(query.toLowerCase())) includes.push(ch);
  });

  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
};

/**
 * Find all roles that match the query
 * @param {string} query
 */
Guild.prototype.findMatchingRoles = function (query) {
  if (!this || !query || typeof query !== "string") return [];

  const patternMatch = query.match(ROLE_MENTION);
  if (patternMatch) {
    const id = patternMatch[1];
    const role = this.roles.cache.find((r) => r.id === id);
    if (role) return [role];
  }

  const exact = [];
  const startsWith = [];
  const includes = [];
  this.roles.cache.forEach((role) => {
    const lowerName = role.name.toLowerCase();
    if (role.name === query) exact.push(role);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(role);
    if (lowerName.includes(query.toLowerCase())) includes.push(role);
  });
  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
};

/**
 * Resolves a guild member from search query
 * @param {string} query
 * @param {boolean} exact
 */
Guild.prototype.resolveMember = async function (query, exact = false) {
  if (!query || typeof query !== "string") return;

  // Check if mentioned or ID is passed
  const patternMatch = query.match(MEMBER_MENTION);
  if (patternMatch) {
    const id = patternMatch[1];
    const fetched = await this.members.fetch({ user: id }).catch(() => {});
    if (fetched) return fetched;
  }

  // Fetch and cache members from API
  await this.members.fetch({ query }).catch(() => {});

  // Check if exact tag is matched
  const matchingTags = this.members.cache.filter((mem) => mem.user.tag === query);
  if (matchingTags.size === 1) return matchingTags.first();

  // Check for matching username
  if (!exact) {
    return this.members.cache.find(
      (x) =>
        x.user.username === query ||
        x.user.username.toLowerCase().includes(query.toLowerCase()) ||
        x.displayName.toLowerCase().includes(query.toLowerCase())
    );
  }
};

/**
 * Fetch member stats
 */
Guild.prototype.fetchMemberStats = async function () {
  const all = await this.members.fetch({
    force: false,
    cache: false,
  });
  const total = all.size;
  const bots = all.filter((mem) => mem.user.bot).size;
  const members = total - bots;
  return [total, bots, members];
};
