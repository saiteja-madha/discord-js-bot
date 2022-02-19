const { Message, TextChannel, User, Guild } = require("discord.js");
const { error } = require("./logger");

Message.prototype.safeReply = async function (options, seconds) {
  if (!options || !this) return;
  const perms = ["VIEW_CHANNEL", "SEND_MESSAGES"];
  if (options.embeds && options.embeds.length > 0) perms.push("EMBED_LINKS");
  if (this.channel.type !== "DM" && !this.channel.permissionsFor(this.guild.me).has(perms)) return;
  try {
    const reply = await this.reply(options);
    if (!seconds) return reply;
    setTimeout(() => reply && reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    error(`safeReply`, ex);
  }
};

TextChannel.prototype.safeSend = async function (options, seconds) {
  if (!options || !this) return;
  const perms = ["VIEW_CHANNEL", "SEND_MESSAGES"];
  if (options.embeds && options.embeds.length > 0) perms.push("EMBED_LINKS");
  if (this.type !== "DM" && !this.permissionsFor(this.guild.me).has(perms)) return;
  try {
    const reply = await this.send(options);
    if (!seconds) return reply;
    setTimeout(() => reply && reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    error(`safeSend`, ex);
  }
};

User.prototype.safeDm = async function (options, seconds) {
  if (!options || !this) return;
  try {
    const reply = await this.send(options);
    if (!seconds) return reply;
    setTimeout(() => reply && reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    /** Ignore */
  }
};

Guild.prototype.findMatchingRoles = function (query) {
  if (!this || !query || typeof query !== "string") return [];

  // Match role by ID
  const patternMatch = query.match(/<?@?&?(\d{17,20})>?/);
  if (patternMatch) {
    const id = patternMatch[1];
    const role = this.roles.cache.find((r) => r.id === id);
    if (role) return [role];
  }

  // Match role by name
  const exact = [];
  const startsWith = [];
  const includes = [];
  this.roles.cache.forEach((role) => {
    const lowerName = role.name.toLowerCase();
    if (role.name === query) exact.push(role);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(role);
    if (lowerName.includes(query.toLowerCase())) includes.push(role);
  });

  // Return best possible match
  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
};

Guild.prototype.findMatchingChannels = function (query) {
  if (!this || !query || typeof query !== "string") return [];

  // Match role by ID
  const patternMatch = query.match(/<?#?(\d{17,20})>?/);
  if (patternMatch) {
    const id = patternMatch[1];
    const channel = this.channels.cache.find((r) => r.id === id);
    if (channel) return [channel];
  }

  // Match role by name
  const exact = [];
  const startsWith = [];
  const includes = [];
  this.channels.cache.forEach((ch) => {
    const lowerName = ch.name.toLowerCase();
    if (ch.name === query) exact.push(ch);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(ch);
    if (lowerName.includes(query.toLowerCase())) includes.push(ch);
  });

  // Return best possible match
  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
};

Guild.prototype.resolveMember = async function (query, exact = false) {
  if (!this || !query || typeof query !== "string") return;

  // Match role by ID
  const patternMatch = query.match(/<?@?!?(\d{17,20})>?/);
  if (patternMatch) {
    const id = patternMatch[1];
    const member = await this.members.fetch(id);
    if (member) return member;
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
