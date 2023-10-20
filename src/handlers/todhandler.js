const { ButtonInteraction, MessageButton, ButtonStyle } = require('discord.js');

/**
 * @param {ButtonInteraction} interaction
 */
async function handleTruthButton(interaction, questionId) {
  await interaction.deferUpdate();
  // Handle the Truth button click
  // You can use the questionId to fetch the specific question from the database
  // Respond with an embed containing the truth question
}

/**
 * @param {ButtonInteraction} interaction
 */
async function handleDareButton(interaction, questionId) {
  await interaction.deferUpdate();
  // Handle the Dare button click
  // You can use the questionId to fetch the specific question from the database
  // Respond with an embed containing the dare question
}

/**
 * @param {ButtonInteraction} interaction
 */
async function handleRandomButton(interaction, questionId) {
  await interaction.deferUpdate();
  // Handle the Random button click
  // You can use the questionId to fetch a random question from the database
  // Respond with an embed containing the random question
}

/**
 * @param {import('discord.js').MessageComponentInteraction} interaction
 */
function handleButtonInteraction(interaction) {
  const [action, questionId] = interaction.customId.split('_');

  switch (action) {
    case 'truth':
      handleTruthButton(interaction, questionId);
      break;
    case 'dare':
      handleDareButton(interaction, questionId);
      break;
    case 'random':
      handleRandomButton(interaction, questionId);
      break;
    default:
      break;
  }
}

module.exports = {
  handleButtonInteraction,
};
