const { Message, PartialMessage, MessageEmbed } = require("discord.js");
const { BotClient } = require("@src/structures");
const { getSettings } = require("@schemas/guild-schema");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {BotClient} client
 * @param {Message | PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial) await message.fetch().catch((err) => client.log(err, "error"));
  if (!message || message.author.bot || !message.guild) return;

  const settings = (await getSettings(message.guild)).automod;
  if (!settings.anti_ghostping || !settings.log_channel) return;
  const { members, roles, everyone } = message.mentions;

  // Check message if it contains mentions
  if (members.size > 0 || roles.size > 0 || everyone) {
    const logChannel = message.guild.channels.cache.get(settings.log_channel);
    if (!logChannel) return;

    const embed = new MessageEmbed()
      .setAuthor("Ghost ping detected")
      .setDescription(
        `**Message:**\n${message.content}\n\n` +
          `**Author:** ${message.author.tag} \`${message.author.id}\`\n` +
          `**Channel:** ${message.channel.toString()}`
      )
      .addField("Members", members.size, true)
      .addField("Roles", roles.size, true)
      .addField("Everyone?", everyone, true)
      .setFooter(`Sent at: ${message.createdAt}`);

    sendMessage(logChannel, { embeds: [embed] });
  }
};
