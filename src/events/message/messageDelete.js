const { MessageEmbed } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial) return;
  if (message.author.bot || !message.guild) return;

  const settings = await getSettings(message.guild);
  if (!settings.automod.anti_ghostping || !settings.modlog_channel) return;
  const { members, roles, everyone } = message.mentions;

  // Check message if it contains mentions
  if (members.size > 0 || roles.size > 0 || everyone) {
    const logChannel = message.guild.channels.cache.get(settings.modlog_channel);
    if (!logChannel) return;

    const embed = new MessageEmbed()
      .setAuthor({ name: "Ghost ping detected" })
      .setDescription(
        `**Message:**\n${message.content}\n\n` +
          `**Author:** ${message.author.tag} \`${message.author.id}\`\n` +
          `**Channel:** ${message.channel.toString()}`
      )
      .addField("Members", members.size.toString(), true)
      .addField("Roles", roles.size.toString(), true)
      .addField("Everyone?", everyone.toString(), true)
      .setFooter({ text: `Sent at: ${message.createdAt}` });

    sendMessage(logChannel, { embeds: [embed] });
  }
};
