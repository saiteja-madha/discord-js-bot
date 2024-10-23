const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { getUser } = require('@schemas/User')
module.exports = {
  name: 'profile',
  description: 'Set up and manage your personal profile!',
  category: 'UTILITY',
  global: true,
  showsModal: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'view',
        description: "View your profile or someone else's profile",
        type: 1,
        options: [
          {
            name: 'user',
            description: 'The user whose profile you want to view (optional)',
            type: 6,
            required: false,
          },
        ],
      },
      {
        name: 'set',
        description: 'Set up or update your profile',
        type: 1,
      },
      {
        name: 'clear',
        description: 'Clear your entire profile',
        type: 1,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand()
    switch (sub) {
      case 'view':
        return handleView(interaction)
      case 'set':
        return handleSet(interaction) // Added return
      case 'clear':
        return handleClear(interaction)
    }
  },
}

async function handleView(interaction) {
  const target = interaction.options.getUser('user') || interaction.user
  const userDb = await getUser(target)

  if (
    !userDb.profile ||
    !Object.keys(userDb.profile).some(key => userDb.profile[key])
  ) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(
        `${target.id === interaction.user.id ? "You haven't" : "This user hasn't"} set up a profile yet!`
      )
      .setFooter({ text: 'Use /profile set to create your profile!' })

    return interaction.reply({ embeds: [embed], ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({
      name: `${target.username}'s Profile`,
      iconURL: target.displayAvatarURL(),
    })
    .setThumbnail(target.displayAvatarURL())

  const { profile } = userDb
  const fields = []

  if (profile.pronouns)
    fields.push({ name: 'Pronouns', value: profile.pronouns, inline: true })
  if (profile.age && profile.privacy?.showAge)
    fields.push({ name: 'Age', value: profile.age.toString(), inline: true })
  if (profile.region && profile.privacy?.showRegion)
    fields.push({ name: 'Region', value: profile.region, inline: true })
  if (profile.timezone)
    fields.push({ name: 'Timezone', value: profile.timezone, inline: true })
  if (profile.bio)
    fields.push({ name: 'Bio', value: profile.bio, inline: false })
  if (profile.interests?.length > 0)
    fields.push({
      name: 'Interests',
      value: profile.interests.join(', '),
      inline: false,
    })

  if (profile.age && Object.values(profile.age).some(v => v)) {
    const socialLinks = Object.entries(profile.age)
      .filter(([, value]) => value)
      .map(([platform, value]) => `${platform}: ${value}`)
      .join('\n')
    fields.push({ name: 'Age', value: profile.age, inline: false })
  }

  if (profile.customFields?.length > 0) {
    profile.customFields.forEach(field => {
      fields.push({ name: field.label, value: field.value, inline: true })
    })
  }

  if (fields.length > 0) embed.addFields(fields)

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  })
}

async function handleSet(interaction) {
  if (interaction.replied || interaction.deferred) {
    console.log('Interaction was already replied to or deferred')
    return
  }
  const modal = new ModalBuilder()
    .setCustomId('profile_set_modal')
    .setTitle('Set Up Your Profile!')

  const pronounsInput = new TextInputBuilder()
    .setCustomId('pronouns')
    .setLabel('Your Pronouns')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., they/them, she/her, he/him')
    .setRequired(false)
    .setMaxLength(50)

  const bioInput = new TextInputBuilder()
    .setCustomId('bio')
    .setLabel('Tell us about yourself!')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Share a bit about who you are...')
    .setRequired(false)
    .setMaxLength(1000)

  const regionInput = new TextInputBuilder()
    .setCustomId('region')
    .setLabel('Your Region/Country')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Where are you from?')
    .setRequired(false)
    .setMaxLength(100)

  const interestsInput = new TextInputBuilder()
    .setCustomId('interests')
    .setLabel('Your Interests (comma-separated)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('gaming, art, music, etc.')
    .setRequired(false)
    .setMaxLength(200)

  const ageInput = new TextInputBuilder()
    .setCustomId('age')
    .setLabel('Your Age')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("How old are you? (Don't worry, it's optional!)")
    .setRequired(true)
    .setMaxLength(2)

  const rows = [
    new ActionRowBuilder().addComponents(ageInput),
    new ActionRowBuilder().addComponents(pronounsInput),
    new ActionRowBuilder().addComponents(bioInput),
    new ActionRowBuilder().addComponents(regionInput),
    new ActionRowBuilder().addComponents(interestsInput),
  ]

  modal.addComponents(rows)
  try {
    await interaction.showModal(modal)
  } catch (error) {
    console.error('Error showing modal:', error)
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error showing the profile setup modal.',
        ephemeral: true,
      })
    }
  }
}

async function handleClear(interaction) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription('Are you sure you want to clear your entire profile?')

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('profile_clear_confirm')
      .setPlaceholder('Choose an option')
      .addOptions([
        {
          label: 'Yes, clear my profile',
          value: 'confirm',
          emoji: '✅',
        },
        {
          label: 'No, keep my profile',
          value: 'cancel',
          emoji: '❌',
        },
      ])
  )

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  })
}
