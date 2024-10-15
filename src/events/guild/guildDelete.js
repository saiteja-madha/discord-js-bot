const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require('discord.js')
const { SUPPORT_SERVER, DOCS_URL, DONATE_URL } = require('@root/config.js')
const { getSettings } = require('@schemas/Guild')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return
  client.logger.log(`Guild Left: ${guild.name} Members: ${guild.memberCount}`)

  const settings = await getSettings(guild)
  settings.server.leftAt = new Date()
  await settings.save()

  if (!client.joinLeaveWebhook) return

  let ownerTag = 'Deleted User'
  const ownerId = guild.ownerId || settings.server.owner
  try {
    const owner = await client.users.fetch(ownerId)
    ownerTag = owner.tag
  } catch (err) {
    // Handle the error here, if needed.
  }

  // Mochi's playful, caring message with pastel color palette
  const embed = new EmbedBuilder()
    .setTitle(`Aww, I just left ${guild.name} 💔`)
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addFields(
      {
        name: 'Server Name',
        value: guild.name || 'N/A',
        inline: true,
      },
      {
        name: 'Server ID',
        value: guild.id,
        inline: true,
      },
      {
        name: 'Owner',
        value: `${ownerTag} [\`${ownerId}\`]`,
        inline: true,
      },
      {
        name: 'Members',
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: true,
      }
    )
    .setFooter({
      text: `I'll miss you! 💕 | Guild #${client.guilds.cache.size}`,
    })

  client.joinLeaveWebhook.send({
    username: 'Mochi (Left)',
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  })

  // Constructing the GitHub issue creation URL from .env
  const githubIssueURL = `https://github.com/${process.env.GH_USERNAME}/${process.env.GH_REPO}/issues/new`

  try {
    // Create buttons with dynamic GitHub URL
    const components = [
      new ButtonBuilder()
        .setLabel('Donate')
        .setStyle(ButtonStyle.Link)
        .setURL(DONATE_URL),
      new ButtonBuilder()
        .setLabel('Docs')
        .setStyle(ButtonStyle.Link)
        .setURL(DOCS_URL),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(SUPPORT_SERVER),
      new ButtonBuilder()
        .setLabel('Create an Issue')
        .setStyle(ButtonStyle.Link)
        .setURL(githubIssueURL),
    ]

    const row = new ActionRowBuilder().addComponents(components)

    // Send a friendly and playful goodbye message
    await owner.send({
      content: `Hey <@${ownerId}>! 🌸 I just left your server and already miss you! 😢\nIf you have any ideas on how I can improve, you can let me know by creating an issue on my [GitHub repo](${githubIssueURL})! ✨\nP.S. I'm open-source!`,
      embeds: [embed],
      components: [row],
    })

    console.log('Sent a thank-you DM to the server owner.')
  } catch (err) {
    console.error(`Error sending DM: ${err}`)
  }
}
