const { approveSuggestion, rejectSuggestion, deleteSuggestion } = require("@src/handlers/suggestion");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord-modals').Modal} modal
 */
module.exports = async (client, modal) => {
  // Suggestion Approve
  if (modal.customId === "SUGGEST_APPROVE_MODAL") {
    await modal.deferReply({ ephemeral: true });
    const reason = modal.getTextInputValue("reason");
    const response = await approveSuggestion(modal.member, modal.channel, modal.message.id, reason);
    await modal.followUp({ content: response, ephemeral: true });
  }

  // Suggestion Reject
  if (modal.customId === "SUGGEST_REJECT_MODAL") {
    await modal.deferReply({ ephemeral: true });
    const reason = modal.getTextInputValue("reason");
    const response = await rejectSuggestion(modal.member, modal.channel, modal.message.id, reason);
    await modal.followUp({ content: response, ephemeral: true });
  }

  // Suggestion Delete
  if (modal.customId === "SUGGEST_DELETE_MODAL") {
    await modal.deferReply({ ephemeral: true });
    const reason = modal.getTextInputValue("reason");
    const response = await deleteSuggestion(modal.member, modal.channel, modal.message.id, reason);
    await modal.followUp({ content: response, ephemeral: true });
  }
};
