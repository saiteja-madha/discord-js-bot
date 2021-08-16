const { Guild, TextChannel, VoiceChannel } = require("discord.js");

const ROLE_MENTION = new RegExp("<?@?&?(\\d{17,20})>?", "g");

/**
 * @param {Guild} guild
 * @param {String} name
 */
function getRoleByName(guild, name) {
  return guild.roles.cache.find((role) => role.name.toLowerCase() === name);
}

/**
 * @param {TextChannel} channel
 */
function canSendEmbeds(channel) {
  return channel.permissionsFor(channel.guild.me).has(["SEND_MESSAGES", "EMBED_LINKS"]);
}

/**
 * @param {Guild} guild
 * @param {String} name
 */
function getMatchingChannel(guild, name) {
  return guild.channels.cache.filter((ch) => ch.name.includes(name));
}

/**
 * @param {VoiceChannel} vc
 * @param {String} name
 */
async function setVoiceChannelName(vc, name) {
  if (vc.manageable) {
    vc.setName(name).catch((err) => {
      console.log("Set Name error: " + err);
    });
  }
}

/**
 * @param {Guild} guild
 */
async function getMemberStats(guild) {
  const all = await guild.members.fetch({
    force: true,
    cache: false,
  });
  const total = all.size;
  const bots = all.filter((mem) => mem.user.bot).size;
  const members = total - bots;
  return [total, bots, members];
}

/**
 * @param {Guild} guild
 * @param {String} query
 */
function findMatchingRoles(guild, query) {
  const patternMatch = ROLE_MENTION.exec(query);
  if (patternMatch) {
    let id = patternMatch[1];
    let role = guild.roles.cache.filter((r) => r.id === id).first();
    if (role) return [role];
  }
  const idMatch = [];
  if (guild.roles.cache.has(query)) {
    idMatch.push(guild.roles.cache.get(query));
    return idMatch;
  }
  const exact = [];
  const startsWith = [];
  const includes = [];
  guild.roles.cache.forEach((role) => {
    let lowerName = role.name.toLowerCase();
    if (role.name === query) exact.push(role);
    if (lowerName.startsWith(query.toLowerCase())) startsWith.push(role);
    if (lowerName.includes(query.toLowerCase())) includes.push(role);
  });
  if (exact.length > 0) return exact;
  if (startsWith.length > 0) return startsWith;
  if (includes.length > 0) return includes;
  return [];
}

module.exports = {
  getRoleByName,
  canSendEmbeds,
  getMatchingChannel,
  setVoiceChannelName,
  getMemberStats,
  findMatchingRoles,
};
