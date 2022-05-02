const { getSettings } = require("@schemas/Guild");
const { findSuggestion, deleteSuggestionDb } = require("@schemas/Suggestions");
const { SUGGESTIONS } = require("@root/config");
const { MessageActionRow, MessageButton } = require("discord.js");

/**
 * @param {import('discord.js').Message} message
 */
const getStats = (message) => {
  const upVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.UP_VOTE).count - 1;
  const downVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.DOWN_VOTE).count - 1;
  return [upVotes, downVotes];
};

module.exports = {
  /**
   * @param {import('discord.js').GuildMember} member
   * @param {import('discord.js').TextBasedChannel} channel
   * @param {string} messageId
   */
  async approveSuggestion(member, channel, messageId) {
    const { guild } = member;
    const settings = await getSettings(guild);

    // validate permissions
    if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to approve suggestions!";

    // validate channel
    let suggestionsChannel;
    if (channel) {
      suggestionsChannel = channel;
    } else {
      suggestionsChannel = guild.channels.cache.get(settings.suggestions.channel_id);
    }
    if (!suggestionsChannel) return "Suggestion channel not found!";

    // validate document
    const doc = await findSuggestion(guild.id, messageId);
    if (!doc) return "Suggestion not found";
    if (doc.status === "APPROVED") return "Suggestion already approved";

    /**
     * @type {import('discord.js').Message}
     */
    let message;
    try {
      message = await suggestionsChannel.messages.fetch(messageId, { force: true });
    } catch (err) {
      return "Suggestion message not found";
    }

    let buttonsRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId("SUGGEST_APPROVE").setLabel("Approve").setStyle("SUCCESS").setDisabled(true),
      new MessageButton().setCustomId("SUGGEST_REJECT").setLabel("Reject").setStyle("DANGER")
    );

    const approvedEmbed = message.embeds[0]
      .setColor(SUGGESTIONS.APPROVED_EMBED)
      .setAuthor({ name: "Suggestion Approved" })
      .setTimestamp();

    if (approvedEmbed.fields.length > 0) {
      approvedEmbed.fields[0].name = "Approved by";
      approvedEmbed.fields[0].value = `${member.user.tag} [${member.id}]`;
    } else {
      const [upVotes, downVotes] = getStats(message);

      doc.stats.upvotes = upVotes;
      doc.stats.downvotes = downVotes;

      approvedEmbed.addField("Approved by", `${member.user.tag} [${member.id}]`).setFooter({
        text: `Stats: ${SUGGESTIONS.EMOJI.UP_VOTE} ${upVotes} ${SUGGESTIONS.EMOJI.DOWN_VOTE} ${downVotes}`,
      });
    }

    try {
      doc.status = "APPROVED";
      doc.status_updates.push({ user_id: member.id, status: "APPROVED", timestamp: new Date() });

      let approveChannel;
      if (settings.suggestions.approved_channel) {
        approveChannel = guild.channels.cache.get(settings.suggestions.approved_channel);
      }

      // suggestions-approve channel is not configured
      if (!approveChannel) {
        await message.edit({ embeds: [approvedEmbed], components: [buttonsRow] });
        await message.reactions.removeAll();
      }

      // suggestions-approve channel is configured
      else {
        const sent = await approveChannel.send({ embeds: [approvedEmbed], components: [buttonsRow] });
        doc.message_id = sent.id;
        await message.delete();
      }

      await doc.save();
      return true;
    } catch (ex) {
      guild.client.logger.error("approveSuggestion", ex);
      return "Failed to approve suggestion";
    }
  },

  /**
   * @param {import('discord.js').GuildMember} member
   * @param {import('discord.js').TextBasedChannel} channel
   * @param {string} messageId
   */
  async rejectSuggestion(member, channel, messageId) {
    const { guild } = member;
    const settings = await getSettings(guild);

    // validate permissions
    if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to approve suggestions!";

    // validate channel
    let suggestionsChannel;
    if (channel) {
      suggestionsChannel = channel;
    } else {
      suggestionsChannel = guild.channels.cache.get(settings.suggestions.channel_id);
    }
    if (!suggestionsChannel) return "Suggestion channel not found!";

    // validate document
    const doc = await findSuggestion(guild.id, messageId);
    if (!doc) return "Suggestion not found";
    if (doc.is_rejected) return "Suggestion already rejected";

    let message;
    try {
      message = await suggestionsChannel.messages.fetch(messageId);
    } catch (err) {
      return "Suggestion message not found";
    }

    let buttonsRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId("SUGGEST_APPROVE").setLabel("Approve").setStyle("SUCCESS"),
      new MessageButton().setCustomId("SUGGEST_REJECT").setLabel("Reject").setStyle("DANGER").setDisabled(true)
    );

    const rejectedEmbed = message.embeds[0]
      .setColor(SUGGESTIONS.DENIED_EMBED)
      .setAuthor({ name: "Suggestion Rejected" })
      .setTimestamp();

    if (rejectedEmbed.fields.length > 0) {
      rejectedEmbed.fields[0].name = "Rejected by";
      rejectedEmbed.fields[0].value = `${member.user.tag} [${member.id}]`;
    } else {
      const [upVotes, downVotes] = getStats(message);

      doc.stats.upvotes = upVotes;
      doc.stats.downvotes = downVotes;

      rejectedEmbed.addField("Rejected by", `${member.user.tag} [${member.id}]`).setFooter({
        text: `Stats: ${SUGGESTIONS.EMOJI.UP_VOTE} ${upVotes} ${SUGGESTIONS.EMOJI.DOWN_VOTE} ${downVotes}`,
      });
    }

    try {
      doc.status = "REJECTED";
      doc.status_updates.push({ user_id: member.id, status: "REJECTED", timestamp: new Date() });

      let rejectChannel;
      if (settings.suggestions.rejected_channel) {
        rejectChannel = guild.channels.cache.get(settings.suggestions.rejected_channel);
      }

      // suggestions-reject channel is not configured
      if (!rejectChannel) {
        await message.edit({ embeds: [rejectedEmbed], components: [buttonsRow] });
        await message.reactions.removeAll();
      }

      // suggestions-reject channel is configured
      else {
        const sent = await rejectChannel.send({ embeds: [rejectedEmbed], components: [buttonsRow] });
        doc.message_id = sent.id;
        await message.delete();
      }

      await doc.save();
      return true;
    } catch (ex) {
      guild.client.logger.error("rejectSuggestion", ex);
      return "Failed to reject suggestion";
    }
  },

  /**
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} member
   * @param {string} messageId
   */
  async deleteSuggestion(guild, member, messageId) {
    // validate permissions
    if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to approve suggestions!";

    // validate channel
    const settings = await getSettings(guild);
    if (!settings.suggestions.channel_id) return "Suggestions channel not set";
    const suggestionsChannel = guild.channels.cache.get(settings.suggestions.channel_id);
    if (!suggestionsChannel) return "Suggestions channel not found";

    try {
      await suggestionsChannel.messages.delete(messageId);
      await deleteSuggestionDb(guild.id, messageId);
    } catch (ex) {
      guild.client.logger.error("deleteSuggestion", ex);
      return "Failed to delete suggestion! Please delete manually";
    }
  },
};
