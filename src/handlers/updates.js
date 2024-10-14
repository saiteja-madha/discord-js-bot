const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js')
const { getSettings } = require('@schemas/Guild')

async function showUpdateModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('MOCHI_UPDATE_MODAL')
    .setTitle('Send Update to All Servers')

  const messageInput = new TextInputBuilder()
    .setCustomId('MESSAGE')
    .setLabel('Message (optional)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)

  const embedTitleInput = new TextInputBuilder()
    .setCustomId('EMBED_TITLE')
    .setLabel('Embed Title')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const embedDescriptionInput = new TextInputBuilder()
    .setCustomId('EMBED_DESCRIPTION')
    .setLabel('Embed Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)

  const embedColorInput = new TextInputBuilder()
    .setCustomId('EMBED_COLOR')
    .setLabel('Embed Color (hex code)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)

  const rows = [
    messageInput,
    embedTitleInput,
    embedDescriptionInput,
    embedColorInput,
  ].map(input => new ActionRowBuilder().addComponents(input))

  modal.addComponents(...rows)

  try {
    await interaction.showModal(modal)
  } catch (error) {
    console.error('Error showing update modal:', error)
    await interaction.reply({
      content: 'There was an error showing the update modal. Please try again.',
      ephemeral: true,
    })
  }
}

async function handleUpdateModal(interaction) {
  const message = interaction.fields.getTextInputValue('MESSAGE')
  const embedTitle = interaction.fields.getTextInputValue('EMBED_TITLE')
  const embedDescription =
    interaction.fields.getTextInputValue('EMBED_DESCRIPTION')
  const embedColor =
    interaction.fields.getTextInputValue('EMBED_COLOR') || '#FFC0CB'

  const embed = new EmbedBuilder()
    .setTitle(embedTitle)
    .setDescription(embedDescription)
    .setColor(embedColor)
    .setTimestamp()

  let successCount = 0
  let failCount = 0

  await interaction.deferReply({ ephemeral: true })

  for (const [guildId, guild] of interaction.client.guilds.cache) {
    const settings = await getSettings(guild)
    const channelId = settings.server.updates_channel
    if (!channelId) continue

    const channel = await interaction.client.channels
      .fetch(channelId)
      .catch(() => null)
    if (!channel) continue

    try {
      await channel.send({ content: message, embeds: [embed] })
      successCount++
    } catch (error) {
      console.error(`Failed to send update to guild ${guildId}:`, error)
      failCount++
    }
  }

  await interaction.editReply(
    `Update sent to ${successCount} servers. Failed for ${failCount} servers.`
  )
}

module.exports = { showUpdateModal, handleUpdateModal }
