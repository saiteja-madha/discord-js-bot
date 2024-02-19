const { getSettings: registerGuild } = require('@schemas/Guild')
const {
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js') // Import necessary Discord.js v14 components
const { SUPPORT_SERVER, BOTS_URL, DONATE_URL } = require('@root/config.js')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return
  if (!guild.members.cache.has(guild.ownerId)) {
    await guild.fetchOwner({ cache: true }).catch(() => {})
  }
  client.logger.log(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`)
  await registerGuild(guild)

  if (!client.joinLeaveWebhook) return

  const embed = new EmbedBuilder()
    .setTitle(`Joined the folks at ${guild.name}`)
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.SUCCESS)
    .addFields(
      {
        name: 'Server Name',
        value: guild.name,
        inline: false,
      },
      {
        name: 'Server ID',
        value: guild.id,
        inline: false,
      },
      {
        name: 'Owner',
        value: `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`,
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
    username: 'Join',
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  })

  try {
    // Send a thank you DM to the guild owner
    const owner = await guild.members.fetch(guild.ownerId)
    if (owner) {
      let components = [
        new ButtonBuilder()
          .setLabel('Our Bots')
          .setStyle(ButtonStyle.Link)
          .setURL(BOTS_URL),
        new ButtonBuilder()
          .setLabel('Donate')
          .setStyle(ButtonStyle.Link)
          .setURL(DONATE_URL),
        new ButtonBuilder()
          .setLabel('Support Server')
          .setStyle(ButtonStyle.Link)
          .setURL(SUPPORT_SERVER),
      ]

      let row = new ActionRowBuilder().addComponents(components)

      owner
        .send({
          content: `Hey there, <@${owner.id}>! 🌸 Just wanted to say you're super cute, and I hope you're great! I just joined your server XD, if you ever need anything, feel free to reach out.\n\nAnd oh my silly mind, almost forgot, I have a sister! That's right, her name is **Amina** and I think you should meet her! She is a sweet AI and can talk in DMs and servers!\nLet's spread positivity and cute vibes together! And oh watchout for Pickle Rick\n\n I love you silly 😊💖`,
          embeds: [embed], // You can add an embed here
          components: [row],
        })
        .then(() => {
          console.log('Sent thank you DM to the server owner.')
        })
        .catch(error => {
          console.error(`Error sending thank you DM: ${error}`)
        })
    }
  } catch (err) {
    console.error(err)
  }
}
