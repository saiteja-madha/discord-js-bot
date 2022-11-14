const { getMemberStats } = require("@schemas/MemberStats");
const { getRandomInt } = require("@helpers/Utils");

const cooldownCache = new Map();
const voiceStates = new Map();

const xpToAdd = () => getRandomInt(19) + 1;

/**
 * @param {string} content
 * @param {import('discord.js').GuildMember} member
 * @param {number} level
 */
const parse = (content, member, level) => {
  return content
    .replaceAll(/\\n/g, "\n")
    .replaceAll(/{server}/g, member.guild.name)
    .replaceAll(/{count}/g, member.guild.memberCount)
    .replaceAll(/{member:id}/g, member.id)
    .replaceAll(/{member:name}/g, member.displayName)
    .replaceAll(/{member:mention}/g, member.toString())
    .replaceAll(/{member:tag}/g, member.user.tag)
    .replaceAll(/{level}/g, level);
};

module.exports = {
  /**
   * This function saves stats for a new message
   * @param {import("discord.js").Message} message
   * @param {boolean} isCommand
   * @param {object} settings
   */
  async trackMessageStats(message, isCommand, settings) {
    const statsDb = await getMemberStats(message.guildId, message.member.id);
    if (isCommand) statsDb.commands.prefix++;
    statsDb.messages++;

    // TODO: Ignore possible bot commands

    // Cooldown check to prevent Message Spamming
    const key = `${message.guildId}|${message.member.id}`;
    if (cooldownCache.has(key)) {
      const difference = (Date.now() - cooldownCache.get(key)) * 0.001;
      if (difference < message.client.config.STATS.XP_COOLDOWN) {
        return statsDb.save();
      }
      cooldownCache.delete(key);
    }

    // Update member's XP in DB
    statsDb.xp += xpToAdd();

    // Check if member has levelled up
    let { xp, level } = statsDb;
    const needed = level * level * 100;

    if (xp > needed) {
      level += 1;
      xp -= needed;

      statsDb.xp = xp;
      statsDb.level = level;
      let lvlUpMessage = settings.stats.xp.message;
      lvlUpMessage = parse(lvlUpMessage, message.member, level);
      const lvlUpChannel = message.channel;

      lvlUpChannel.safeSend(lvlUpMessage);
    }
    await statsDb.save();
    cooldownCache.set(key, Date.now());
  },

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async trackInteractionStats(interaction) {
    if (!interaction.guild) return;
    const statsDb = await getMemberStats(interaction.guildId, interaction.member.id);
    if (interaction.isChatInputCommand()) statsDb.commands.slash += 1;
    if (interaction.isUserContextMenuCommand()) statsDb.contexts.user += 1;
    if (interaction.isMessageContextMenuCommand()) statsDb.contexts.message += 1;
    await statsDb.save();
  },

  /**
   * @param {import('discord.js').VoiceState} oldState
   * @param {import('discord.js').VoiceState} newState
   */
  async trackVoiceStats(oldState, newState) {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel && !newChannel) return;
    if (!newState.member) return;

    const member = await newState.member.fetch().catch(() => {});
    if (member.user.bot) return;

    // Member joined a voice channel
    if (!oldChannel && newChannel) {
      const statsDb = await getMemberStats(member.guild.id, member.id);
      statsDb.voice.connections += 1;
      await statsDb.save();
      voiceStates.set(member.id, Date.now());
    }

    // Member left a voice channel
    if (oldChannel && !newChannel) {
      const statsDb = await getMemberStats(member.guild.id, member.id);
      if (voiceStates.has(member.id)) {
        const time = Date.now() - voiceStates.get(member.id);
        statsDb.voice.time += time / 1000; // add time in seconds
        await statsDb.save();
        voiceStates.delete(member.id);
      }
    }
  },
};
