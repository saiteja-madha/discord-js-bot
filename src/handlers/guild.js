const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
} = require('discord.js')
const { getSettings } = require('@schemas/Guild')
const { EMBED_COLORS } = require('@src/config')

/**
 * @param {import('discord.js').TextChannel} channel
 */
async function sendOnboardingMenu(channel) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle('Mina Setup ♡(>ᴗ•)')
    .setDescription(
      "Let's make your server super awesome! Click the button below to set up important stuff~"
    )

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('AMINA_SETUP')
      .setLabel('Setup Mina')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🌸'),
    new ButtonBuilder()
      .setCustomId('AMINA_REMIND')
      .setLabel('Laterz!')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⏰')
  )

  const sentMessage = await channel.send({ embeds: [embed], components: [row] })

  // Store the setup message ID
  const guildSettings = await getSettings(channel.guild)
  guildSettings.server.setup_message_id = sentMessage.id
  await guildSettings.save()
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleSetupButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('AMINA_SETUP_MODAL')
    .setTitle('Mina Setup ♡')

  const updatesChannelInput = new TextInputBuilder()
    .setCustomId('UPDATES_CHANNEL')
    .setLabel('Updates Channel Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., amina-updates')
    .setRequired(true)

  const staffRoleInput = new TextInputBuilder()
    .setCustomId('STAFF_ROLES')
    .setLabel('Staff Role Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., Mina Staff')
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder().addComponents(
    updatesChannelInput
  )
  const secondActionRow = new ActionRowBuilder().addComponents(staffRoleInput)

  modal.addComponents(firstActionRow, secondActionRow)

  await interaction.showModal(modal)
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleSetupModal(interaction) {
  const updatesChannelName =
    interaction.fields.getTextInputValue('UPDATES_CHANNEL')
  const staffRoleName = interaction.fields.getTextInputValue('STAFF_ROLES')

  const guild = interaction.guild
  const settings = await getSettings(guild)

  // Find channel and role by name
  const updatesChannel = guild.channels.cache.find(
    channel =>
      channel.name.toLowerCase() === updatesChannelName.toLowerCase() &&
      channel.type === ChannelType.GuildText
  )
  const staffRole = guild.roles.cache.find(
    role => role.name.toLowerCase() === staffRoleName.toLowerCase()
  )

  if (!updatesChannel || !staffRole) {
    return interaction.reply({
      content:
        "Oopsie! I couldn't find that channel or role. (◞‸◟；) Can you double-check the names?",
      ephemeral: true,
    })
  }

  // Check bot permissions in the updates channel
  const botMember = guild.members.me
  if (
    !botMember
      .permissionsIn(updatesChannel)
      .has(['ViewChannel', 'SendMessages'])
  ) {
    return interaction.reply({
      content:
        "Uh-oh! I don't have permission to send messages in that channel. (╥﹏╥) Can you give me the right permissions?",
      ephemeral: true,
    })
  }

  // Update settings
  settings.server.updates_channel = updatesChannel.id
  settings.server.staff_roles = staffRole.id
  settings.server.setup_completed = true
  await settings.save()

  // Send success message
  const successEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle('Yay! Setup Complete! ヾ(≧▽≦*)o')
    .setDescription(
      'We did it! Your server is now super awesome and ready to go~'
    )
    .addFields(
      { name: 'Updates Channel', value: `${updatesChannel}`, inline: true },
      { name: 'Staff Role', value: `${staffRole}`, inline: true }
    )
    .setFooter({ text: "Thanks for setting me up! Let's have fun together~ ♡" })

  await interaction.reply({ embeds: [successEmbed], ephemeral: true })

  // Send a test message to the updates channel
  const testEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setTitle('Mina Updates Channel ♡')
    .setDescription(
      "Hi everyone! This channel is now set up for Mina's updates. Stay tuned for awesome announcements! (≧◡≦)"
    )

  await updatesChannel.send({ embeds: [testEmbed] })

  // Remove the setup message if it exists
  if (settings.setup_message_id) {
    const setupChannel = guild.channels.cache.find(channel =>
      channel.messages.cache.has(settings.setup_message_id)
    )
    if (setupChannel) {
      await setupChannel.messages
        .delete(settings.setup_message_id)
        .catch(() => {})
    }
    settings.setup_message_id = null
    await settings.save()
  }
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleRemindButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('AMINA_REMIND_MODAL')
    .setTitle('Set a Reminder ⏰')

  const reminderTimeInput = new TextInputBuilder()
    .setCustomId('REMINDER_TIME')
    .setLabel('Remind me in (minutes)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., 30')
    .setRequired(true)

  const actionRow = new ActionRowBuilder().addComponents(reminderTimeInput)
  modal.addComponents(actionRow)

  await interaction.showModal(modal)
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleRemindModal(interaction) {
  const reminderTime = interaction.fields.getTextInputValue('REMINDER_TIME')
  const minutes = parseInt(reminderTime)

  if (isNaN(minutes) || minutes <= 0) {
    return interaction.reply({
      content:
        "Oopsie! That's not a valid number of minutes. (◞‸◟；) Can you try again?",
      ephemeral: true,
    })
  }

  const guild = interaction.guild
  const settings = await getSettings(guild)

  // Schedule the reminder
  setTimeout(
    async () => {
      const owner = await guild.members.fetch(guild.ownerId)
      if (owner) {
        const reminderEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle('Mina Setup Reminder ♡')
          .setDescription(
            'Hey there! Just a friendly reminder to finish setting me up in your server. Run `/settings` to get started!'
          )
          .setFooter({
            text: "I can't wait to be fully operational and super awesome in your server! (◠‿◠✿)",
          })

        await owner.send({ embeds: [reminderEmbed] }).catch(() => {})
      }
    },
    minutes * 60 * 1000
  )

  await interaction.reply({
    content: `Okie dokie! I'll remind you to finish the setup in ${minutes} minutes~ (≧◡≦)`,
    ephemeral: true,
  })
}

module.exports = {
  sendOnboardingMenu,
  handleSetupButton,
  handleSetupModal,
  handleRemindButton,
  handleRemindModal,
}
