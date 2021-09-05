const { MessageReaction, User, MessageEmbed, Message, ReactionEmoji } = require("discord.js");
const { getReactionRole } = require("@schemas/reactionrole-schema");
const { getSettings } = require("@schemas/guild-schema");
const { getConfig } = require("@schemas/ticket-schema");
const ticketUtils = require("@utils/ticketUtils");
const { sendMessage } = require("@utils/botUtils");
const { isTranslated, logTranslation } = require("@schemas/trlogs-schema");
const data = require("@src/data.json");
const { getCountryLanguages } = require("country-language");
const { translate } = require("@utils/httpUtils");

/**
 * @param {MessageReaction} reaction
 */
function getRole(reaction) {
  const { message, emoji } = reaction;
  const rr = getReactionRole(message.guild.id, message.channel.id, message.id) || [];
  const emote = emoji.id ? emoji.id : emoji.toString();
  const found = rr.find((doc) => doc.emote === emote);
  if (found) return message.guild.roles.cache.get(found.role_id);
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleNewTicket(reaction, user) {
  const { message } = reaction;

  try {
    const settings = await getSettings(message.guild);
    const config = await getConfig(message.guildId, message.channelId, message.id);
    if (!config) return;

    // check if user already has an open ticket
    const alreadyExists = ticketUtils.getExistingTicketChannel(message.guild, user.id);
    if (alreadyExists) return await reaction.users.remove(user.id);

    // check if ticket limit is reached
    const existing = ticketUtils.getTicketChannels(message.guild).size;
    if (existing > settings.ticket.limit) {
      const sent = await sendMessage(message.channel, "Ticket limit reached! Try again later");
      setTimeout(() => {
        if (sent.deletable) sent.delete().catch(() => {});
      }, 3000);
      return;
    }

    await ticketUtils.openTicket(message.guild, user, config.title, config.support_role);
  } finally {
    await reaction.users.remove(user.id);
  }
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleCloseTicket(reaction, user) {
  const { message } = reaction;
  if (ticketUtils.isTicketChannel(message.channel)) {
    await ticketUtils.closeTicket(message.channel, user, "Reacted with emoji");
  }
}

/**
 * @param {ReactionEmoji} emoji
 * @param {Message} message
 * @param {User} user
 */
async function handleFlagReaction(emoji, message, user) {
  const l1 = emoji.name[0] + emoji.name[1];
  const l2 = emoji.name[2] + emoji.name[3];
  const countryCode = data.UNICODE_LETTER[l1] + data.UNICODE_LETTER[l2];

  if (!countryCode) return;
  if (await isTranslated(message, countryCode)) return;

  getCountryLanguages(countryCode, async (err, languages) => {
    if (err) return;

    // filter languages for which google translation is available
    const targetCodes = languages
      .filter((language) => data.GOOGLE_TRANSLATE[language.iso639_1] !== undefined)
      .map((language) => language.iso639_1);

    if (targetCodes.length === 0) return;

    // remove english if there are other language codes
    if (targetCodes.length > 1 && targetCodes.includes("en")) {
      targetCodes.splice(targetCodes.indexOf("en"), 1);
    }

    let src;
    let desc = "";
    for (const tc of targetCodes) {
      const response = await translate(message.content, tc);
      src = response.inputLang;
      desc += `**${response.outputLang}:**\n${response.output}\n\n`;
    }

    const head = `Original Message: [here](${message.url})\nSource Language: ${src}\n\n`;
    const embed = new MessageEmbed()
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setAuthor("Translation")
      .setDescription(head + desc)
      .setFooter(`Requested by ${user.tag}`, user.displayAvatarURL());

    sendMessage(message.channel, { embeds: [embed] });
    logTranslation(message, countryCode);
  });
}

module.exports = {
  getRole,
  handleNewTicket,
  handleCloseTicket,
  handleFlagReaction,
};
