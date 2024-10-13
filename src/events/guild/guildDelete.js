const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require('discord.js')
const {
  SUPPORT_SERVER,
  DOCS_URL,
  DONATE_URL,
  GITHUB_URL,
} = require('@root/config.js')
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

  const embed = new EmbedBuilder()
    .setTitle(`Left the folks at ${guild.name}`)
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addFields(
      {
        name: 'Server Name',
        value: guild.name || 'NA',
        inline: false,
      },
      {
        name: 'Server ID',
        value: guild.id,
        inline: false,
      },
      {
        name: 'Owner',
        value: `${ownerTag} [\`${ownerId}\`]`,
        inline: false,
      },
      {
        name: 'Members',
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      }
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` })

  client.joinLeaveWebhook.send({
    username: 'Leave',
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  })

  try {
    // Send a thank you DM to the guild owner
    let components = [
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
        .setLabel('Github')
        .setStyle(ButtonStyle.Link)
        .setURL(GITHUB_URL),
    ]

    let row = new ActionRowBuilder().addComponents(components)

    // Send the DM to the guild owner
    owner
      .send({
        content: `Goodbye, <@${ownerId}>! 😢 I've left your server.\n I sure won't miss you! **JK, I will miss you silly, you are amazing!**\n On your way out, please lmk how I can improve by creating an issue on my Github repo.\n\n> PS I am Open Source!`,
        embeds: [embed], // You can add an embed here
        components: [row],
      })
      .then(() => {
        console.log('Sent thank you DM to the server owner.')
      })
      .catch(error => {
        console.error(`Error sending DM: ${error}`)
      })
  } catch (err) {
    console.error(err)
  }
}
