const { EmbedBuilder } = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { updateProfile, clearProfile } = require('@schemas/User')

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleProfileModal(interaction) {
  try {
    const pronouns = interaction.fields.getTextInputValue('pronouns')
    const bio = interaction.fields.getTextInputValue('bio')
    const region = interaction.fields.getTextInputValue('region')
    const interests = interaction.fields.getTextInputValue('interests')
    const age = interaction.fields.getTextInputValue('age')

    // Create profile object
    const profileData = {
      pronouns: pronouns || null,
      bio: bio || null,
      region: region || null,
      interests: interests ? interests.split(',').map(i => i.trim()) : [],
      age: age || null,
      privacy: {
        showAge: true,
        showRegion: true,
        showBirthdate: false,
      },
    }

    // Update user profile in database
    await updateProfile(interaction.user.id, profileData)

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setTitle('Profile Updated! ✨')
      .setDescription('Your profile has been successfully updated!')
      .addFields({
        name: 'View Your Profile',
        value: 'Use `/profile view` to see your updated profile!',
      })

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  } catch (error) {
    console.error('Error handling profile modal:', error)
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(
        'Oops! Something went wrong while updating your profile. Please try again later.'
      )

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  }
}

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleProfileClear(interaction) {
  const selected = interaction.values[0]

  if (selected === 'cancel') {
    return interaction.update({
      content: 'Profile clear cancelled!',
      embeds: [],
      components: [],
    })
  }

  try {
    await clearProfile(interaction.user.id)

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription('Your profile has been cleared successfully!')

    return interaction.update({
      embeds: [embed],
      components: [],
    })
  } catch (error) {
    console.error('Error clearing profile:', error)
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(
        'Oops! Something went wrong while clearing your profile. Please try again later.'
      )

    return interaction.update({
      embeds: [embed],
      components: [],
    })
  }
}

module.exports = { handleProfileModal, handleProfileClear }
