const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js')
const { getSettings } = require('@schemas/Guild')

async function showUpdateModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('MOCHI_UPDATE_MODAL')
    .setTitle('Send Mochi Update ♡')

  const titleInput = new TextInputBuilder()
    .setCustomId('UPDATE_TITLE')
    .setLabel('Update Title')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., New Features!')
    .setRequired(true)

  const contentInput = new TextInputBuilder()
    .setCustomId('UPDATE_CONTENT')
    .setLabel('Update Content')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Describe the update...')
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder().addComponents(titleInput)
  const secondActionRow = new ActionRowBuilder().addComponents(contentInput)

  modal.addComponents(firstActionRow, secondActionRow)

  await interaction.showModal(modal)
}

async function handleUpdateModal(interaction, client) {
  const title = interaction.fields.getTextInputValue('UPDATE_TITLE')
  const content = interaction.fields.getTextInputValue('UPDATE_CONTENT')

  const updateEmbed = new EmbedBuilder()
    .setColor('#FFC0CB')
    .setTitle(`✨ ${title} ✨`)
    .setDescription(content)
    .setTimestamp()
    .setFooter({
      text: 'Mochi Update ♡',
      iconURL: client.user.displayAvatarURL(),
    })

  let successCount = 0
  let failCount = 0

  for (const [guildId, guild] of client.guilds.cache) {
    const settings = await getSettings(guild)

    if (settings.server.updates_channel) {
      const channel = guild.channels.cache.get(settings.server.updates_channel)
      if (channel) {
        try {
          const message = await channel.send({ embeds: [updateEmbed] })
          settings.server.last_update_message_id = message.id
          await settings.save()
          successCount++
        } catch (error) {
          console.error(`Failed to send update to guild ${guildId}:`, error)
          failCount++
        }
      }
    }

    if (!settings.server.setup_completed) {
      const owner = await guild.members.fetch(guild.ownerId)
      if (owner) {
        const reminderEmbed = new EmbedBuilder()
          .setColor('#FFC0CB')
          .setTitle('Mochi Setup Reminder ♡')
          .setDescription(
            "Hey there! I noticed you haven't completed my setup yet. To get the most out of me and receive important updates, please run `/settings setup` in your server!"
          )
          .setFooter({
            text: "I can't wait to be fully operational in your server! (◠‿◠✿)",
          })

        await owner.send({ embeds: [reminderEmbed] }).catch(() => {})
      }
    }
  }

  await interaction.editReply({
    content: `Update sent to ${successCount} servers! (Failed: ${failCount})`,
    ephemeral: true,
  })
}

module.exports = {
  showUpdateModal,
  handleUpdateModal,
}
