const { getSettings } = require("@schemas/Guild");
const { findSuggestion, deleteSuggestionDb } = require("@schemas/Suggestions");
const { SUGGESTIONS } = require("@root/config");
const { MessageActionRow, MessageButton } = require("discord.js");
const { stripIndents } = require("common-tags");
const { Modal, showModal } = require("discord-modals");

/**
 * @param {import('discord.js').Message} message
 */
const getStats = (message) => {
  const upVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.UP_VOTE).count - 1;
  const downVotes = message.reactions.resolve(SUGGESTIONS.EMOJI.DOWN_VOTE).count - 1;
  return [upVotes, downVotes];
};

/**
 * @param {number} upVotes
 * @param {number} downVotes
 */
const getVotesMessage = (upVotes, downVotes) => {
  const total = upVotes + downVotes;
  if (total === 0) {
    return stripIndents`
  _Upvotes: NA_
  _Downvotes: NA_
  `;
  } else {
    return stripIndents`
  _Upvotes: ${upVotes} [${Math.round((upVotes / (upVotes + downVotes)) * 100)}%]_
  _Downvotes: ${downVotes} [${Math.round((downVotes / (upVotes + downVotes)) * 100)}%]_
  `;
  }
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function approveSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to approve suggestions!";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "Suggestion not found";
  if (doc.status === "APPROVED") return "Suggestion already approved";

  /**
   * @type {import('discord.js').Message}
   */
  let message;
  try {
    message = await channel.messages.fetch(messageId, { force: true });
  } catch (err) {
    return "Suggestion message not found";
  }

  let buttonsRow = new MessageActionRow().addComponents(
    new MessageButton().setCustomId("SUGGEST_APPROVE").setLabel("Approve").setStyle("SUCCESS").setDisabled(true),
    new MessageButton().setCustomId("SUGGEST_REJECT").setLabel("Reject").setStyle("DANGER"),
    new MessageButton().setCustomId("SUGGEST_DELETE").setLabel("Delete").setStyle("SECONDARY")
  );

  const approvedEmbed = message.embeds[0]
    .setColor(SUGGESTIONS.APPROVED_EMBED)
    .setAuthor({ name: "Suggestion Approved" })
    .setFooter({ text: `Approved By ${member.user.tag}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  // add stats if it doesn't exist
  const statsField = approvedEmbed.fields.find((field) => field.name === "Stats");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    approvedEmbed.addField("Stats", getVotesMessage(upVotes, downVotes));
  }

  // update reason
  const reasonField = approvedEmbed.fields.find((field) => field.name === "Reason");
  if (!reasonField) {
    if (reason) approvedEmbed.addField("Reason", "```" + reason + "```");
  } else {
    if (reason) reasonField.value = "```" + reason + "```";
    else approvedEmbed.fields.splice(approvedEmbed.fields.indexOf(reasonField), 1);
  }

  try {
    doc.status = "APPROVED";
    doc.status_updates.push({ user_id: member.id, status: "APPROVED", reason, timestamp: new Date() });

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
      doc.channel_id = approveChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();
    return "Suggestion approved";
  } catch (ex) {
    guild.client.logger.error("approveSuggestion", ex);
    return "Failed to approve suggestion";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function rejectSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to reject suggestions!";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "Suggestion not found";
  if (doc.is_rejected) return "Suggestion already rejected";

  let message;
  try {
    message = await channel.messages.fetch(messageId);
  } catch (err) {
    return "Suggestion message not found";
  }

  let buttonsRow = new MessageActionRow().addComponents(
    new MessageButton().setCustomId("SUGGEST_APPROVE").setLabel("Approve").setStyle("SUCCESS"),
    new MessageButton().setCustomId("SUGGEST_REJECT").setLabel("Reject").setStyle("DANGER").setDisabled(true),
    new MessageButton().setCustomId("SUGGEST_DELETE").setLabel("Delete").setStyle("SECONDARY")
  );

  const rejectedEmbed = message.embeds[0]
    .setColor(SUGGESTIONS.DENIED_EMBED)
    .setAuthor({ name: "Suggestion Rejected" })
    .setFooter({ text: `Rejected By ${member.user.tag}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  // add stats if it doesn't exist
  const statsField = rejectedEmbed.fields.find((field) => field.name === "Stats");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    rejectedEmbed.addField("Stats", getVotesMessage(upVotes, downVotes));
  }

  // update reason
  const reasonField = rejectedEmbed.fields.find((field) => field.name === "Reason");
  if (!reasonField) {
    if (reason) rejectedEmbed.addField("Reason", "```" + reason + "```");
  } else {
    if (reason) reasonField.value = "```" + reason + "```";
    else rejectedEmbed.fields.splice(rejectedEmbed.fields.indexOf(reasonField), 1);
  }

  try {
    doc.status = "REJECTED";
    doc.status_updates.push({ user_id: member.id, status: "REJECTED", reason, timestamp: new Date() });

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
      doc.channel_id = rejectChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();
    return "Suggestion rejected";
  } catch (ex) {
    guild.client.logger.error("rejectSuggestion", ex);
    return "Failed to reject suggestion";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function deleteSuggestion(member, channel, messageId, reason) {
  const { guild } = member;

  // validate permissions
  if (!member.permissions.has("MANAGE_GUILD")) return "You don't have permission to approve suggestions!";

  try {
    await channel.messages.delete(messageId);
    await deleteSuggestionDb(guild.id, messageId, member.id, reason);
    return "Suggestion deleted";
  } catch (ex) {
    guild.client.logger.error("deleteSuggestion", ex);
    return "Failed to delete suggestion! Please delete manually";
  }
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleApproveBtn(interaction) {
  const modal = new Modal().setCustomId("SUGGEST_APPROVE_MODAL").setTitle("Approve Suggestion").addComponents({
    customId: "reason",
    label: "Reason",
    type: "TEXT_INPUT",
    style: "LONG",
    minLength: 4,
    required: false,
  });

  showModal(modal, {
    client: interaction.client,
    interaction,
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleRejectBtn(interaction) {
  const modal = new Modal().setCustomId("SUGGEST_REJECT_MODAL").setTitle("Reject Suggestion").addComponents({
    customId: "reason",
    label: "Reason",
    type: "TEXT_INPUT",
    style: "LONG",
    minLength: 4,
    required: false,
  });

  showModal(modal, {
    client: interaction.client,
    interaction,
  });
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleDeleteBtn(interaction) {
  const modal = new Modal().setCustomId("SUGGEST_DELETE_MODAL").setTitle("Delete Suggestion").addComponents({
    customId: "reason",
    label: "Reason",
    type: "TEXT_INPUT",
    style: "LONG",
    minLength: 4,
    required: false,
  });

  showModal(modal, {
    client: interaction.client,
    interaction,
  });
}

module.exports = {
  handleApproveBtn,
  handleRejectBtn,
  handleDeleteBtn,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion,
};
