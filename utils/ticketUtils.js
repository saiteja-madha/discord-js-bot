const { Channel, Guild, GuildMember, TextBasedChannels, MessageEmbed, User } = require("discord.js");
const { postToBin } = require("@utils/httpUtils");
const { EMBED_COLORS, EMOJIS } = require("@root/config.json");
const { outdent } = require("outdent");
const { getSettings } = require("@schemas/settings-schema");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {Channel} channel
 */
function isTicketChannel(channel) {
  return (
    channel.type === "GUILD_TEXT" &&
    channel.name.startsWith("tіcket-") &&
    channel.topic &&
    channel.topic.startsWith("tіcket|")
  );
}

/**
 * @param {Guild} guild
 */
function getTicketChannels(guild) {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
}

/**
 * @param {GuildMember} member
 */
function getExistingTicketChannel(guild, memberId) {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("\\|")[1] === memberId).first();
}

/**
 * @param {TextBasedChannels} channel
 */
async function parseTicketDetails(channel) {
  if (!channel.topic) return;
  const userId = channel.topic.split("\\|")[1];
  const title = channel.topic.split("\\|")[2];
  const user = await channel.client.users.fetch(userId, { cache: false }).catch((err) => {});
  return {
    title,
    user,
  };
}

/**
 * @param {TextBasedChannels} channel
 * @param {User} closedBy
 * @param {String} reason
 */
async function closeTicket(channel, closedBy, reason) {
  if (
    !channel.deletable ||
    !channel.permissionsFor(channel.guild.me).has(["MANAGE_CHANNELS", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"])
  ) {
    return {
      success: false,
      message: "Missing permissions",
    };
  }

  try {
    const config = await getSettings(channel.guild.id);
    const messages = await channel.messages.fetch();
    let reversed = Array.from(messages.values()).reverse();

    let content = "";
    reversed.forEach((m) => {
      content += "[" + new Date(m.createdAt).toLocaleString("en-US") + "] - " + m.author.tag + "\n";
      if (m.cleanContent !== "") content += m.cleanContent + "\n";
      if (m.attachments.size > 0) content += m.attachments.map((att) => att.proxyURL).join(", ") + "\n";
      content += "\n";
    });

    const logsUrl = await postToBin(content, "Ticket Logs for " + channel.name);
    const ticketDetails = await parseTicketDetails(channel);

    const desc = outdent`
    ${EMOJIS.WHITE_SMALL_SQUARE} **Server Name:** ${channel.guild.name}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Title:** ${ticketDetails.title}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Opened By:** ${ticketDetails.user ? ticketDetails.user.tag : "User left"}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Closed By:** ${closedBy ? closedBy.tag : "User left"}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Reason:** ${reason != null ? reason : "No reason provided"}
    ${logsUrl == null ? "" : "\n[View Logs](" + logsUrl + ")"}
    `;

    await channel.delete();
    const embed = new MessageEmbed().setAuthor("Ticket Closed").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);

    if (ticketDetails.user) ticketDetails.user.send({ embeds: [embed] }).catch((ex) => {});
    if (config.ticket.log_channel) {
      let logChannel = channel.guild.channels.cache(logChannel);
      if (logChannel) sendMessage(logChannel, { embeds: [embed] });
    }

    return {
      success: true,
      message: "success",
    };
  } catch (ex) {
    console.log(ex);
    return {
      success: false,
      message: "Unexpected error occurred",
    };
  }
}

/**
 * @param {Guild} guild
 */
async function closeAllTickets(guild) {
  const channels = getTicketChannels(guild);
  let success = 0;
  let failed = 0;
  for (const ch of channels) {
    const status = await closeTicket(ch, guild.me, "Force close all open tickets");
    if (status.success) success++;
    else failed++;
  }
  return [success, failed];
}

module.exports = {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  closeAllTickets,
};
