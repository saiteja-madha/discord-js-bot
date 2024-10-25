const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')
const { EMBED_COLORS } = require('@src/config.js')
const { getUser } = require('@schemas/User')

module.exports = {
  name: 'profile',
  description: 'express yourself and share your story with the world!',
  category: 'UTILITY',
  showsModal: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'view',
        description: "peek at your profile or discover someone else's story",
        type: 1,
        options: [
          {
            name: 'user',
            description: 'whose story do you want to explore?',
            type: 6,
            required: false,
          },
        ],
      },
      {
        name: 'set',
        description: 'time to paint your digital portrait!',
        type: 1,
        options: [
          {
            name: 'category',
            description: 'what part of your story are we crafting?',
            type: 3,
            required: true,
            choices: [
              {
                name: 'basic',
                value: 'basic',
              },
              {
                name: 'misc',
                value: 'misc',
              },
            ],
          },
        ],
      },
      {
        name: 'privacy',
        description: 'customize what parts of your story you want to share',
        type: 1,
        options: [
          {
            name: 'setting',
            description: 'choose what to show or hide',
            type: 3,
            required: true,
            choices: [
              { name: 'age', value: 'showAge' },
              { name: 'region', value: 'showRegion' },
              { name: 'birthdate', value: 'showBirthdate' },
              { name: 'pronouns', value: 'showPronouns' },
            ],
          },
          {
            name: 'visible',
            description: 'should this be visible to others?',
            type: 5,
            required: true,
          },
        ],
      },
      {
        name: 'clear',
        description: 'start fresh with a blank canvas',
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
        return handleSet(interaction)
      case 'privacy':
        return handlePrivacy(interaction)
      case 'clear':
        return handleClear(interaction)
    }
  },
}

async function createBasicModal() {
  const modal = new ModalBuilder()
    .setCustomId('profile_set_basic_modal')
    .setTitle("let's start with the basics!")

  const birthdateInput = new TextInputBuilder()
    .setCustomId('birthdate')
    .setLabel("when's your special day?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('DD/MM/YYYY or MM/YYYY')
    .setRequired(true)
    .setMaxLength(10)

  const pronounsInput = new TextInputBuilder()
    .setCustomId('pronouns')
    .setLabel('how should we refer to you?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('they/them, she/her, he/him, or anything else!')
    .setRequired(false)
    .setMaxLength(50)

  const regionInput = new TextInputBuilder()
    .setCustomId('region')
    .setLabel('where do you call home?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('your corner of the world')
    .setRequired(false)
    .setMaxLength(100)

  const languagesInput = new TextInputBuilder()
    .setCustomId('languages')
    .setLabel('what languages do you speak?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('english, español, 日本語...')
    .setRequired(false)
    .setMaxLength(100)

  const timezoneInput = new TextInputBuilder()
    .setCustomId('timezone')
    .setLabel("what's your timezone?")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('UTC+1, EST, GMT...')
    .setRequired(false)
    .setMaxLength(30)

  return modal.addComponents(
    new ActionRowBuilder().addComponents(birthdateInput),
    new ActionRowBuilder().addComponents(pronounsInput),
    new ActionRowBuilder().addComponents(regionInput),
    new ActionRowBuilder().addComponents(languagesInput),
    new ActionRowBuilder().addComponents(timezoneInput)
  )
}

async function createMiscModal() {
  const modal = new ModalBuilder()
    .setCustomId('profile_set_misc_modal')
    .setTitle('tell us your story!')

  const bioInput = new TextInputBuilder()
    .setCustomId('bio')
    .setLabel('paint us a picture of who you are!')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('your story, your way...')
    .setRequired(false)
    .setMaxLength(1000)

  const interestsInput = new TextInputBuilder()
    .setCustomId('interests')
    .setLabel('what makes your heart skip a beat?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('gaming, art, music...')
    .setRequired(false)
    .setMaxLength(200)

  const socialsInput = new TextInputBuilder()
    .setCustomId('socials')
    .setLabel('where else can we find you?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('twitter: @handle, instagram: @user...')
    .setRequired(false)
    .setMaxLength(200)

  const favoritesInput = new TextInputBuilder()
    .setCustomId('favorites')
    .setLabel('what are your absolute favorites?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('color: blue, food: pizza...')
    .setRequired(false)
    .setMaxLength(200)

  const goalsInput = new TextInputBuilder()
    .setCustomId('goals')
    .setLabel('what dreams are you chasing?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('learning guitar, visiting japan...')
    .setRequired(false)
    .setMaxLength(200)

  return modal.addComponents(
    new ActionRowBuilder().addComponents(bioInput),
    new ActionRowBuilder().addComponents(interestsInput),
    new ActionRowBuilder().addComponents(socialsInput),
    new ActionRowBuilder().addComponents(favoritesInput),
    new ActionRowBuilder().addComponents(goalsInput)
  )
}

async function handleSet(interaction) {
  const category = interaction.options.getString('category') || 'basic'
  const modal =
    category === 'basic' ? await createBasicModal() : await createMiscModal()

  try {
    await interaction.showModal(modal)
  } catch (error) {
    console.error('Error showing modal:', error)
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          'oops! something went wrong with the profile setup. try again?',
        ephemeral: true,
      })
    }
  }
}

async function handlePrivacy(interaction) {
  const setting = interaction.options.getString('setting')
  const visible = interaction.options.getBoolean('visible')

  const user = await getUser(interaction.user)
  if (!user.profile) user.profile = {}
  if (!user.profile.privacy) user.profile.privacy = {}

  user.profile.privacy[setting] = visible
  await user.save()

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `updated your privacy settings! ${setting.replace('show', '')} is now ${visible ? 'visible' : 'hidden'}`
    )

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  })
}

// Helper Functions
const formatValue = value => {
  if (!value) return 'Not set'
  if (Array.isArray(value)) return value.join(', ') || 'None'
  if (value instanceof Map)
    return Array.from(value.values()).join(', ') || 'None'
  return String(value)
}

const SOCIAL_PLATFORMS = {
  youtube: username => `https://youtube.com/@${username}`,
  twitter: username => `https://x.com/${username}`,
  x: username => `https://x.com/${username}`,
  github: username => `https://github.com/${username}`,
  instagram: username => `https://instagram.com/${username}`,
  twitch: username => `https://twitch.tv/${username}`,
  linkedin: username => `https://linkedin.com/in/${username}`,
  default: (username, platform) => `https://${platform}.com/${username}`,
}

const formatSocialLinks = socials => {
  if (!socials || socials.size === 0) return ''

  return (
    Array.from(socials.entries())
      .map(([platform, username]) => {
        const cleanPlatform = platform.toLowerCase().trim()
        const linkGenerator =
          SOCIAL_PLATFORMS[cleanPlatform] || SOCIAL_PLATFORMS.default
        const link = linkGenerator(username, cleanPlatform)
        return `${platform}: [${username}](${link})`
      })
      .join(' • ') || 'None'
  )
}

const formatFavorites = favorites => {
  if (!favorites || favorites.size === 0) return ''

  return (
    Array.from(favorites.entries())
      .map(([category, item]) => `${category}: ${item}`)
      .join('\n') || 'None'
  )
}

const hasContent = profile => {
  if (!profile) return false

  const fields = [
    'pronouns',
    'age',
    'region',
    'timezone',
    'bio',
    'languages',
    'interests',
    'goals',
  ]

  return (
    fields.some(field => {
      const value = profile[field]
      return Array.isArray(value) ? value.length > 0 : Boolean(value)
    }) ||
    profile.socials?.size > 0 ||
    profile.favorites?.size > 0
  )
}

async function handleView(interaction) {
  try {
    const target = interaction.options.getUser('user') || interaction.user
    const userDb = await getUser(target)
    const isOwnProfile = target.id === interaction.user.id
    const { profile } = userDb

    // Check if profile exists and has content
    if (!hasContent(profile)) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription(
          `${isOwnProfile ? "You haven't" : "This user hasn't"} set up a profile yet!`
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

    // Track visible content for privacy checks
    let hasVisibleContent = false

    // Basic Information Fields
    const basicFields = [
      {
        name: 'pronouns',
        label: 'Pronouns',
        privacyKey: 'showPronouns',
        inline: true,
      },
      {
        name: 'age',
        label: 'Age',
        privacyKey: 'showAge',
        inline: true,
      },
      {
        name: 'region',
        label: 'Region',
        privacyKey: 'showRegion',
        inline: true,
      },
      {
        name: 'timezone',
        label: 'Timezone',
        inline: true,
      },
    ]

    // Add basic fields
    basicFields.forEach(field => {
      const value = profile[field.name]
      if (!value) return

      const isVisible =
        !field.privacyKey || isOwnProfile || profile.privacy?.[field.privacyKey]
      if (!isVisible) return

      hasVisibleContent = true
      embed.addFields({
        name: `${field.label}${isOwnProfile && field.privacyKey && !profile.privacy?.[field.privacyKey] ? ' 🔒' : ''}`,
        value: formatValue(value),
        inline: field.inline,
      })
    })

    // Languages (with null check and empty array handling)
    if (Array.isArray(profile.languages) && profile.languages.length > 0) {
      hasVisibleContent = true
      embed.addFields({
        name: 'Languages',
        value: formatValue(profile.languages),
        inline: true,
      })
    }

    // Add spacer if we have basic fields
    if (hasVisibleContent) {
      embed.addFields({ name: '\u200B', value: '\u200B', inline: false })
    }

    // Bio
    if (profile.bio) {
      hasVisibleContent = true
      embed.addFields({
        name: 'Bio',
        value: profile.bio,
        inline: false,
      })
    }

    // Interests
    if (Array.isArray(profile.interests) && profile.interests.length > 0) {
      hasVisibleContent = true
      embed.addFields({
        name: 'Interests',
        value: formatValue(profile.interests),
        inline: false,
      })
    }

    // Goals
    if (Array.isArray(profile.goals) && profile.goals.length > 0) {
      hasVisibleContent = true
      embed.addFields({
        name: 'Goals',
        value: formatValue(profile.goals),
        inline: false,
      })
    }

    // Social Links
    if (profile.socials?.size > 0) {
      const socialLinks = formatSocialLinks(profile.socials)
      if (socialLinks) {
        hasVisibleContent = true
        embed.addFields({
          name: 'Social Links',
          value: socialLinks,
          inline: false,
        })
      }
    }

    // Favorites
    if (profile.favorites?.size > 0) {
      const favoritesList = formatFavorites(profile.favorites)
      if (favoritesList) {
        hasVisibleContent = true
        embed.addFields({
          name: 'Favorites',
          value: favoritesList,
          inline: false,
        })
      }
    }

    // Check if there's any visible content for other users
    if (!isOwnProfile && !hasVisibleContent) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription(`${target.username}'s profile is private.`)

      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    // Add Last Updated timestamp
    if (profile.lastUpdated) {
      embed.setFooter({
        text: `Last Updated: ${profile.lastUpdated.toLocaleDateString()} ${profile.lastUpdated.toLocaleTimeString()} UTC`,
      })
    }

    // Generate privacy summary for own profile
    if (isOwnProfile) {
      const privateFields = basicFields
        .filter(
          ({ name, privacyKey }) =>
            privacyKey && !profile.privacy?.[privacyKey] && profile[name]
        )
        .map(({ label }) => label)

      if (privateFields.length > 0) {
        embed.setDescription(
          `**Note:** Fields marked with 🔒 are private and only visible to you.\nPrivate fields: ${privateFields.join(', ')}`
        )
      }
    }

    // Send the profile embed
    return interaction.reply({
      embeds: [embed],
      ephemeral: isOwnProfile,
    })
  } catch (error) {
    console.error('Error in handleView:', error)
    return interaction.reply({
      content:
        'There was an error while viewing the profile. Please try again later.',
      ephemeral: true,
    })
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
