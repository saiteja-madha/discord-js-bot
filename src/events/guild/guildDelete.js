const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require('discord.js')
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
  }

  // Create the embed for webhook
  const webhookEmbed = new EmbedBuilder()
    .setTitle(`*sniff* Just left ${guild.name} 💔`)
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addFields(
      {
        name: '📝 Server Name',
        value: guild.name || 'N/A',
        inline: true,
      },
      {
        name: '🔍 Server ID',
        value: guild.id,
        inline: true,
      },
      {
        name: '👑 Owner',
        value: `${ownerTag} [\`${ownerId}\`]`,
        inline: true,
      },
      {
        name: '👥 Members',
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: true,
      }
    )
    .setFooter({
      text: `Server #${client.guilds.cache.size} | *draws a sad doodle*`,
    })

  // Send webhook message
  if (client.joinLeaveWebhook) {
    try {
      await client.joinLeaveWebhook.send({
        username: 'Amina (Left)',
        avatarURL: client.user.displayAvatarURL(),
        embeds: [webhookEmbed],
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
    const components = [
      new ButtonBuilder()
        .setLabel('Invite Me Back? 🥺')
        .setStyle(ButtonStyle.Link)
        .setURL(`${client.getInvite()}`),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(process.env.SUPPORT_SERVER),
      new ButtonBuilder()
        .setLabel('Leave Feedback')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://github.com/${process.env.GH_USERNAME}/${process.env.GH_REPO}/issues/new/choose`
        ),
    ]

    const row = new ActionRowBuilder().addComponents(components)

    // Create a new embed for the DM
    const dmEmbed = new EmbedBuilder()
      .setTitle('💔 *quietly doodles sad faces*')
      .setDescription(
        `Hey <@${ownerId}>, it's Amina... *fidgets nervously*\n\n` +
          `I just wanted to say goodbye and thank you for having me in your server. Even though things didn't work out, I had a lot of fun! 🎨\n\n` +
          `If I did something wrong, or if there's any way I could've been better, I'd really love to know. Your feedback helps me grow! And maybe... *looks hopeful* maybe we can be friends again someday?\n\n` +
          `*starts drawing a friendship bracelet, just in case*\n\n` +
          `Stay creative and awesome! ✨`
      )
      .setColor(client.config.EMBED_COLORS.ERROR)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields({
        name: '✨ Want to try again?',
        value: 'I promise to do my very best to make your server amazing!',
        inline: false,
      })
      .setFooter({ text: '*tucks away art supplies with a small smile*' })

    try {
      await wait(1000)
      console.log(`Attempting to send DM to owner: ${ownerId}`)

      await owner.send({
        embeds: [dmEmbed],
        components: [row],
      })

      console.log('Successfully sent goodbye DM to the server owner.')
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
