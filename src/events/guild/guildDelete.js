const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require('discord.js')
const { SUPPORT_SERVER, DOCS_URL, DONATE_URL } = require('@root/config.js')
const { getSettings } = require('@schemas/Guild')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async (client, guild) => {
  if (!guild.available) return
  console.log(
    `Guild Left: ${guild.name} (${guild.id}) Members: ${guild.memberCount}`
  )

  const settings = await getSettings(guild)
  settings.server.leftAt = new Date()
  await settings.save()

  let ownerTag = 'Deleted User'
  const ownerId = guild.ownerId || settings.server.owner
  let owner

  try {
    owner = await client.users.fetch(ownerId)
    ownerTag = owner.tag
    console.log(`Fetched owner: ${ownerTag}`)
  } catch (err) {
    console.error(`Failed to fetch owner: ${err.message}`)
    // Continue execution even if owner fetch fails
  }

  // Create the embed for both webhook and DM
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
      text: `Guild #${client.guilds.cache.size}`,
    })

  // Send webhook message
  if (client.joinLeaveWebhook) {
    try {
      await client.joinLeaveWebhook.send({
        username: 'Mochi (Left)',
        avatarURL: client.user.displayAvatarURL(),
        embeds: [embed],
      })
      console.log('Successfully sent webhook message for guild leave event.')
    } catch (err) {
      console.error(`Failed to send webhook message: ${err.message}`)
    }
  } else {
    console.log('Join/Leave webhook is not configured.')
  }

  // Attempt to send DM to owner
  if (owner) {
    const githubIssueURL = `https://github.com/${process.env.GH_USERNAME}/${process.env.GH_REPO}/issues/new`

    try {
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

      // Wait before sending DM to avoid rate limiting
      await wait(1000)

      console.log(`Attempting to send DM to owner: ${ownerId}`)

      await owner.send({
        content: `Hey <@${ownerId}>! 🌸 I just left your server and already miss you! 😢\nIf you have any ideas on how I can improve, you can let me know by creating an issue on my [GitHub repo](${githubIssueURL})! ✨\nP.S. I'm open-source!`,
        embeds: [embed],
        components: [row],
      })

      console.log('Successfully sent a thank-you DM to the server owner.')
    } catch (err) {
      console.error(`Error sending DM: ${err.message}`)
      if (err.code === 50007) {
        console.error(
          'Cannot send messages to this user. They may have DMs disabled or blocked the bot.'
        )
      }
    }
  } else {
    console.log(
      'Unable to send DM to owner as owner information is not available.'
    )
  }
}
