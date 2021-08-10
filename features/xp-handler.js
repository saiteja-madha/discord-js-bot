const { Client, Collection } = require("discord.js");
const { getSettings } = require("@schemas/settings-schema");
const { incrementXP, setLevel } = require("@schemas/profile-schema");
const { getRandomInt } = require("@utils/miscUtils");
const { DEFAULT_LVL_UP_MSG } = require("@root/config.json");
const { sendMessage } = require("@utils/botUtils");

const XP_COOLDOWN = new Collection();
const COOLDOWN_SECONDS = 5;

/**
 * @param {Client} client
 */
function run(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.webhookId || message.channel.type === "DM") return;

    const settings = await getSettings(message.channel.guild.id);
    if (!settings?.ranking_enabled) return;
    const key = message.channel.guild.id + "|" + message.member.id;

    // Cooldown check to prevent Message Spamming
    if (isOnCooldown(key)) return;
    else applyCooldown(key);

    // Update member's XP in DB
    const xpToAdd = getRandomXP();
    const data = await incrementXP(message.channel.guild.id, message.member.id, xpToAdd);

    // Check if member has levelled up
    let { xp, level } = data;
    const needed = getXPNeeded(level);

    if (xp > needed) {
      ++level;
      xp -= needed;

      await setLevel(message.channel.guild.id, message.member.id, level, xp);
      let lvlUpMessage = settings.level_up_message || DEFAULT_LVL_UP_MSG;
      lvlUpMessage = lvlUpMessage.replace("{l}", level).replace("{m}", message.member.user);
      const lvlUpChannel = message.channel.guild.channels.cache.get(settings.level_up_channel) || message.channel;

      sendMessage(lvlUpChannel, lvlUpMessage);
    }
  });
}

/**
 * Get Random XP value between 1 and 20
 */
function getRandomXP() {
  return getRandomInt(19) + 1;
}
/**
 * Get XP Needed to reach the specified level
 * @param {Number} level
 */
function getXPNeeded(level) {
  return level * level * 100;
}

/**
 * Check if the Cooldown cache contains the key
 * @param {String} key
 */
function isOnCooldown(key) {
  if (XP_COOLDOWN.has(key)) {
    const difference = Date.now() - XP_COOLDOWN.get(key);
    if (difference > COOLDOWN_SECONDS) {
      XP_COOLDOWN.delete(key);
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Add cooldown key to cache
 * @param {String} key
 */
function applyCooldown(key) {
  XP_COOLDOWN.set(key, Date.now());
}

module.exports = {
  run,
};
