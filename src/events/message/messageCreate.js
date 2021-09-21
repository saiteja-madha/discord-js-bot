const { Message } = require("discord.js");
const { BotClient } = require("@src/structures");
const { automodHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");
const { getRandomInt } = require("@utils/miscUtils");
const { incrementXP, setLevel, incrementMessages } = require("@schemas/profile-schema");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {BotClient} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);
  const { prefix } = settings;

  if (message.content.includes(`${client.user.id}`)) message.reply(`My prefix is \`${settings.prefix}\``);

  let isCommand = false;
  if (message.content.startsWith(prefix)) {
    const args = message.content.replace(`${prefix}`, "").split(/\s+/);
    const invoke = args.shift().toLowerCase();
    const cmd = client.getCommand(invoke);
    if (cmd) {
      isCommand = true;
      try {
        await cmd.execute(message, args, invoke, prefix);
      } catch (ex) {
        sendMessage(message.channel, "Oops! An error occurred while running the command");
        console.log(ex);
      }
    }
  }

  if (!isCommand) automodHandler.performAutomod(message, settings);
  if (settings.ranking.enabled) xpHandler(message);
};

/**
 * @param {Message} message
 */
async function xpHandler(message) {
  const key = `${message.guildId}|${message.member.id}`;

  // Ignore possible bot commands

  // Cooldown check to prevent Message Spamming
  if (message.client.xpCooldownCache.has(key)) {
    const difference = Date.now() - message.client.xpCooldownCache.get(key) * 0.001;
    if (difference < message.client.config.XP_SYSTEM.COOLDOWN) {
      return incrementMessages(message.guildId, message.member.id); // if on cooldown only increment messages
    }
    message.client.xpCooldownCache.delete(key);
  }

  // Update member's XP in DB
  const xpToAdd = getRandomInt(19) + 1;
  const data = await incrementXP(message.guild.id, message.member.id, xpToAdd);
  message.client.xpCooldownCache.set(key, Date.now());

  // Check if member has levelled up
  let { xp, level } = data;
  const needed = level * level * 100;

  if (xp > needed) {
    level += 1;
    xp -= needed;

    await setLevel(message.guild.id, message.member.id, level, xp);
    let lvlUpMessage = message.client.config.XP_SYSTEM.DEFAULT_LVL_UP_MSG;
    lvlUpMessage = lvlUpMessage.replace("{l}", level).replace("{m}", message.member.user);
    const lvlUpChannel = message.channel;

    sendMessage(lvlUpChannel, lvlUpMessage);
  }
}
