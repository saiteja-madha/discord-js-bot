const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')
const { getUser, setAfk } = require('@schemas/User')
const { EMBED_COLORS } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'afk',
  description: 'Set your AFK status',
  category: 'UTILITY',
  botPermissions: ['SendMessages', 'EmbedLinks'],
  global: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'reason',
        description: 'The reason for going AFK',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'duration',
        description: 'Duration in minutes (leave empty for indefinite)',
        type: ApplicationCommandOptionType.Integer,
        required: false,
        min_value: 1,
        max_value: 43200, // 30 days in minutes
      },
    ],
  },

  async interactionRun(interaction) {
    const reason = interaction.options.getString('reason')
    const duration = interaction.options.getInteger('duration')

    const user = await getUser(interaction.member.user)

    if (user.afk?.enabled) {
      return interaction.followUp(
        'You are already AFK! Just send a message to remove AFK status.'
      )
    }

    await setAfk(interaction.member.id, reason, duration)

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(
        `You are now AFK${reason ? `: ${reason}` : ''}${duration ? `\nDuration: ${duration} minutes` : ''}\n\nNote: Your AFK status will be removed when you send a message.`
      )

    await interaction.editReply({ embeds: [embed] })

    // If duration is set, schedule AFK removal
    if (duration) {
      setTimeout(async () => {
        const updatedUser = await getUser(interaction.member.user)
        if (updatedUser.afk?.enabled) {
          await removeAfk(interaction.member.id)
          try {
            await interaction.channel.send(
              `${interaction.member.toString()}, your AFK status has been removed after ${duration} minutes.`
            )
          } catch (ex) {
            // Channel might be inaccessible
          }
        }
      }, duration * 60000)
    }
  },
}

