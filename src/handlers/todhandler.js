/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTodButtonClick(interaction) {
  await interaction.deferUpdate();

  const customId = interaction.customId;

  // Handle the button clicks based on their custom IDs
  if (customId === "truthBtn") {
    sendQuestion(interaction, "truth");
  } else if (customId === "dareBtn") {
    sendQuestion(interaction, "dare");
  } else if (customId === "randomBtn") {
    sendRandomQuestion(interaction);
  }
}

module.exports = {
  handleTodButtonClick,
};
