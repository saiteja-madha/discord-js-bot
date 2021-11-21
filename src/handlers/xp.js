const { getMember } = require("@schemas/Member");
const { getRandomInt } = require("@utils/miscUtils");
const { sendMessage } = require("@utils/botUtils");

const xpToAdd = () => getRandomInt(19) + 1;

/**
 * This function adds random xp to the message author
 * @param {import("discord.js").Message} message
 */
async function handleXp(message) {
  const key = `${message.guildId}|${message.member.id}`;

  // Ignore possible bot commands

  // Cooldown check to prevent Message Spamming
  if (message.client.xpCooldownCache.has(key)) {
    const difference = (Date.now() - message.client.xpCooldownCache.get(key)) * 0.001;
    if (difference < message.client.config.XP_SYSTEM.COOLDOWN) {
      return;
    }
    message.client.xpCooldownCache.delete(key);
  }

  // Update member's XP in DB
  const memberDb = await getMember(message.guild.id, message.member.id);
  memberDb.xp += xpToAdd();
  message.client.xpCooldownCache.set(key, Date.now());

  // Check if member has levelled up
  let { xp, level } = memberDb;
  const needed = level * level * 100;

  if (xp > needed) {
    level += 1;
    xp -= needed;

    memberDb.xp = xp;
    memberDb.level = level;
    let lvlUpMessage = message.client.config.XP_SYSTEM.DEFAULT_LVL_UP_MSG;
    lvlUpMessage = lvlUpMessage.replace("{l}", level).replace("{m}", message.member.user.toString());
    const lvlUpChannel = message.channel;

    sendMessage(lvlUpChannel, lvlUpMessage);
  }
  await memberDb.save();
}

module.exports = {
  handleXp,
};
