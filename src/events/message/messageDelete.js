const { EmbedBuilder, AuditLogEvent, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial) return;
  if (message.author.bot || !message.guild) return;

  const settings = await getSettings(message.guild);
  if (settings.automod.anti_ghostping && settings.modlog_channel) {
    const { members, roles, everyone } = message.mentions;

    // Check message if it contains mentions
    if (members.size > 0 || roles.size > 0 || everyone) {
      const logChannel = message.guild.channels.cache.get(settings.modlog_channel);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setAuthor({ name: "Ghost ping detected" })
        .setDescription(
          `**Message:**\n${message.content}\n\n` +
          `**Author:** ${message.author.tag} \`${message.author.id}\`\n` +
          `**Channel:** ${message.channel.toString()}`
        )
        .addFields(
          {
            name: "Members",
            value: members.size.toString(),
            inline: true,
          },
          {
            name: "Roles",
            value: roles.size.toString(),
            inline: true,
          },
          {
            name: "Everyone?",
            value: everyone ? "Yes" : "No",
            inline: true,
          }
        )
        .setFooter({ text: `Sent at: ${message.createdAt}` });

      logChannel.safeSend({ embeds: [embed] });
    }
  } else {
    const { content, author } = message;
    if (!settings.logging.messages) return
    const logChannel = client.channels.cache.get(settings.logging.messages);

    const entry = await message.guild
      .fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 })
      .then((audit) => audit.entries.first());
    let user = "";
    if (entry && entry.extra.channel.id === message.channel.id && entry.target.id === message.author.id) {
      user = entry.executor.username;
    }

    const logEmbed = new EmbedBuilder()
      .setAuthor({ name: "Message Deleted" })
      .setThumbnail(author.displayAvatarURL())
      .setColor("#2c2d31")
      .setFields(
        { name: "Author", value: author.toString(), inline: true },
        { name: "Channel", value: message.channel.toString(), inline: true },
        { name: "Deleted Message", value: `> ${content}` },
        { name: "Deleted By", value: user ? user : "Unknown" }
      )
      .setTimestamp();

    if (message?.attachments?.size !== 0) {
      let btn = [];
      let i = 0;
      message.attachments.forEach((a) => {
        i++;
        btn.push(new ButtonBuilder().setLabel(`Attachment ${i}`).setURL(a.proxyURL).setStyle(ButtonStyle.Link));
      });
      const row = new ActionRowBuilder().addComponents(btn);
      logChannel.safeSend({ embeds: [logEmbed], components: [row] }).catch(() => { });
    } else {
      logChannel.safeSend({ embeds: [logEmbed] }).catch(() => { });
    }
  }
};
