const { EmbedBuilder, WebhookClient } = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { getSettings } = require('@schemas/Guild')
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
      } else {
        await interaction.reply({
          content:
            "Oopsie! Mochi couldn't find this server. Can you double-check the ID? It's like a secret code for servers! 🕵️‍♀️",
          ephemeral: true,
        })
        return
      }
    } catch (error) {
      console.error('Error fetching guild settings:', error)
      await interaction.reply({
        content:
          'Uh-oh! Something went wrong while Mochi was looking for that server. Can you try again later? Mochi believes in you! 🌟',
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
      additionalInfo =
        "Uh-oh! Mochi couldn't find this user. Did they vanish? 👻"
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
      await interaction.reply({
        content: `Hmm, Mochi couldn't find a question with ID ${questionId}. Did it play hide and seek? 🙈 Can you double-check the ID?`,
        ephemeral: true,
      })
      return
    }
  }

  const success = await sendWebhook(
    interaction.client, // Pass the client here
    type,
    title,
    description,
    additionalInfo,
    interaction.user
  )

  if (success) {
    await interaction.reply({
      content:
        "Yay! Mochi received your report! You're the best for helping make our community super awesome~ 💖✨",
      ephemeral: true,
    })
  } else {
    await interaction.reply({
      content:
        "Oh no! Something went wrong and Mochi couldn't send your report. Can you try again later? Mochi believes in you! 🌟",
      ephemeral: true,
    })
  }
}

async function sendWebhook(
  client,
  type,
  title,
  description,
  additionalInfo,
  user
) {
  const webhookClient = new WebhookClient({ url: process.env.REPORT_LOGS })

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(
      `New ${type === 'feedback' ? 'Feedback' : `${type.charAt(0).toUpperCase() + type.slice(1)} Report`} 📣`
    )
    .setDescription(`**Title:** ${title}\n\n**Description:** ${description}`)
    .addFields({
      name: 'Extra Deets 🔍',
      value: additionalInfo || 'Nothing extra to share!',
    })
    .setFooter({ text: `Reported by: ${user.tag} (${user.id})` })
    .setTimestamp()

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
