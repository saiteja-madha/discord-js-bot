const {
  EmbedBuilder,
  WebhookClient,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js')
const { EMBED_COLORS, FEEDBACK } = require('@root/config.js')
const { getSettings, setInviteLink } = require('@schemas/Guild')
const { getQuestionById } = require('@schemas/TruthOrDare')

async function handleReportModal(interaction) {
  const type = interaction.customId.split('_')[2]
  const title = interaction.fields.getTextInputValue('title')
  const description = interaction.fields.getTextInputValue('description')
  let additionalInfo = ''

  if (type === 'server') {
    const serverId = interaction.fields.getTextInputValue('serverId')
    try {
      const guildSettings = await getSettings({ id: serverId })
      if (guildSettings) {
        additionalInfo = `Server Name: ${guildSettings.server.name}\nServer Owner: ${guildSettings.server.owner}\nServer ID: ${serverId}`

        // Check for existing invite link or create a new one
        inviteLink = guildSettings.server.invite_link
        if (!inviteLink) {
          const guild = await interaction.client.guilds.fetch(serverId)
          if (guild) {
            try {
              const targetChannel = guild.channels.cache.find(
                channel =>
                  channel.type === ChannelType.GuildText &&
                  channel
                    .permissionsFor(guild.members.me)
                    .has(PermissionFlagsBits.CreateInstantInvite)
              )

              if (targetChannel) {
                const invite = await targetChannel.createInvite({
                  maxAge: 0, // 0 = infinite expiration
                  maxUses: 0, // 0 = infinite uses
                })
                inviteLink = invite.url
                await setInviteLink(guild.id, inviteLink)
              }
            } catch (error) {
              console.error('Error creating invite:', error)
            }
            
          }
        }
      }
    } catch (error) {
      console.error('Error fetching guild settings:', error)
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle('Oopsie! Server Not Found 🕵️‍♀️')
        .setDescription(
          "Mochi couldn't find this server. Here's what might be happening:"
        )
        .addFields(
          {
            name: 'Double-check the Server ID',
            value:
              "Make sure you've entered the correct server ID. Here's how to find it:",
          },
          {
            name: '1. Enable Developer Mode',
            value:
              'Go to User Settings > Appearance > Advanced and turn on Developer Mode.',
          },
          {
            name: '2. Get the Server ID',
            value:
              'Right-click on the server icon and select "Copy ID" at the bottom of the menu.',
          },
          {
            name: 'Mochi Not in Server',
            value:
              "If the ID is correct, it's possible that Mochi isn't a member of that server. Unfortunately, Mochi can only report on servers she's a part of.",
          },
          {
            name: 'Need Help?',
            value:
              "If you're sure the ID is correct and Mochi should be in the server, please try again later or contact support.",
          }
        )
        .setFooter({ text: 'Mochi is always here to help! 💖' })

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      })
      return
    }
  } else if (type === 'user') {
    const userId = interaction.fields.getTextInputValue('userId')
    const user = await interaction.client.users.fetch(userId).catch(() => null)
    if (user) {
      additionalInfo = `Reported User: ${user.tag} (${userId})`
    } else {
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle('Uh-oh! User Not Found 👻')
        .setDescription(
          "Mochi couldn't find this user. Here's what might be happening:"
        )
        .addFields(
          {
            name: 'Double-check the User ID',
            value:
              "Make sure you've entered the correct user ID. Here's how to find it:",
          },
          {
            name: '1. Enable Developer Mode',
            value:
              'Go to User Settings > Appearance > Advanced and turn on Developer Mode.',
          },
          {
            name: '2. Get the User ID',
            value:
              'Right-click on the user\'s name and select "Copy ID" at the bottom of the menu.',
          },
          {
            name: 'User Not Visible',
            value:
              "If the ID is correct, it's possible that the user is not in any servers that Mochi is in, or their privacy settings prevent Mochi from seeing them.",
          },
          {
            name: 'Need Help?',
            value:
              "If you're sure the ID is correct and Mochi should be able to see the user, please try again later or contact support.",
          }
        )
        .setFooter({ text: 'Mochi is always here to help! 💖' })

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      })
      return
    }
  } else if (type === 'tod') {
    const questionId = interaction.fields.getTextInputValue('questionId')
    try {
      const question = await getQuestionById(questionId)
      if (question) {
        additionalInfo = `Question ID: ${questionId}\nCategory: ${question.category}\nQuestion: ${question.question}`
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle('Hmm, Question Not Found 🙈')
        .setDescription(
          "Mochi couldn't find a question with that ID. Here's what you can do:"
        )
        .addFields(
          {
            name: 'Double-check the Question ID',
            value:
              "Make sure you've entered the correct Question ID. You can find this in the footer of the question, after **QID:**.",
          },
          {
            name: 'Example',
            value:
              'If the footer says "**QID: T123**", then "T123" is the Question ID you should enter.',
          },
          {
            name: 'Question Removed?',
            value:
              "If you're sure the ID is correct, it's possible that the question has been removed from the database.",
          },
          {
            name: 'Need Help?',
            value:
              "If you're sure the ID is correct and the question should exist, please try again later or contact support.",
          }
        )
        .setFooter({
          text: 'Mochi appreciates your help in making our ToD games awesome! 💖',
        })

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      })
      return
    }
  } else if (type === 'bug') {
    additionalInfo = interaction.fields.getTextInputValue('reproSteps') || ''
  } else if (type === 'feedback') {
    additionalInfo =
      interaction.fields.getTextInputValue('additionalInfo') || ''
  }

  const success = await sendWebhook(
    interaction.client,
    type,
    title,
    description,
    additionalInfo,
    interaction.user,
    inviteLink
  )

  if (success) {
    const confirmationEmbed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setTitle(
        type === 'feedback'
          ? 'Feedback Received! 💖'
          : type === 'bug'
            ? 'Bug Report Logged! 🐞'
            : 'Report Submitted! 📣'
      )
      .setDescription(
        type === 'feedback'
          ? "Yay! Mochi received your feedback! You're the best for helping make our community super awesome~ 💖✨"
          : type === 'bug'
            ? "Bzzt! Mochi's bug detectors are tingling! Thanks for helping squash those pesky bugs! 🕷️💪"
            : "Yay! Mochi received your report! You're the best for helping make our community super awesome~ 💖✨"
      )
      .addFields(
        { name: 'Title', value: title },
        { name: 'Description', value: description }
      )
      .setFooter({ text: 'Thank you for your contribution!' })
      .setTimestamp()

    if (additionalInfo) {
      confirmationEmbed.addFields({
        name:
          type === 'bug'
            ? 'Reproduction Steps'
            : type === 'feedback'
              ? 'Additional Thoughts'
              : 'Additional Information',
        value: additionalInfo
          .split('\n')
          .filter(line => !line.startsWith('Server Invite:'))
          .join('\n'),
      })
    }

    await interaction.reply({
      embeds: [confirmationEmbed],
      ephemeral: true,
    })
  } else {
    // ... (error handling remains the same)
  }
}

async function sendWebhook(
  client,
  type,
  title,
  description,
  additionalInfo,
  user,
  inviteLink
) {
  const webhookClient = new WebhookClient({ url: FEEDBACK.URL })

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(
      `New ${type === 'feedback' ? 'Feedback' : `${type.charAt(0).toUpperCase() + type.slice(1)} Report`} 📣`
    )
    .setDescription(`**Title:** ${title}\n\n**Description:** ${description}`)
    .setTimestamp()

  embed.setFooter({
    text:
      type === 'bug' || type === 'feedback'
        ? `Submitted by: ${user.tag} (${user.id})`
        : `Reported by: ${user.tag} (${user.id})`,
  })

  if (additionalInfo) {
    embed.addFields({
      name:
        type === 'bug'
          ? 'Reproduction Steps 🐞'
          : type === 'feedback'
            ? 'Additional Thoughts 💭'
            : 'Extra Deets 🔍',
      value: additionalInfo,
    })
  }

  if (inviteLink) {
    embed.addFields({
      name: 'Server Invite',
      value: inviteLink,
    })
  }

  try {
    await webhookClient.send({
      username: "Mochi's Report System",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [embed],
    })
    return true
  } catch (error) {
    console.error('Oopsie! Error sending webhook:', error)
    return false
  }
}

module.exports = { handleReportModal }
