const { getSettings: registerGuild, setInviteLink } = require('@schemas/Guild')
const {
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js')
const { EMBED_COLORS } = require('@src/config')

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
  const guildSettings = await registerGuild(guild)

  // Ensure owner_id is set
  if (!guildSettings.server.owner_id) {
    guildSettings.server.owner_id = guild.ownerId
    await guildSettings.save()
  }

  // Check for existing invite link or create a new one
  let inviteLink = guildSettings.server.invite_link
  if (!inviteLink) {
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
          maxAge: 0,
          maxUses: 0,
        })
        inviteLink = invite.url
        await setInviteLink(guild.id, inviteLink)
      }
    } catch (error) {
      console.error('Error creating invite:', error)
      inviteLink = 'Unable to create invite link'
    }
  }

  // Create the buttons
  const components = [
    new ButtonBuilder()
      .setLabel('Invite Aisha')
      .setStyle(ButtonStyle.Link)
      .setURL(
        'https://discord.com/oauth2/authorize?client_id=1034059677295718411'
      ),
    new ButtonBuilder()
      .setLabel('Invite Rick')
      .setStyle(ButtonStyle.Link)
      .setURL(
        'https://discord.com/oauth2/authorize?client_id=1296731090240671775'
      ),
    new ButtonBuilder()
      .setLabel('Support Server')
      .setStyle(ButtonStyle.Link)
      .setURL(process.env.SUPPORT_SERVER),
  ]

  const row = new ActionRowBuilder().addComponents(components)

  // Only proceed if setup is not completed
  if (!guildSettings.server.setup_completed) {
    // Send thank you message to the server
    const targetChannel = guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel
          .permissionsFor(guild.members.me)
          .has(PermissionFlagsBits.SendMessages)
    )

    let serverMessageLink = null
    if (targetChannel) {
      const serverEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle('✨ Heya! Amina here to light up your server! ✨')
        .setDescription(
          `*bounces excitedly* OMG, thank you so much for inviting me! I'm Amina, your new bestie and server's creative spark! 💖\n\n` +
            `I'm a 16-year-old ball of energy who loves making servers awesome with my special mix of fun and functionality! Think of me as your server's guardian angel (with a dash of chaos, hehe).\n\n` +
            `🎮 **What I Can Do:**\n` +
            `• Keep your server safe and organized (in my own quirky way!)\n` +
            `• Create fun experiences with games and activities\n` +
            `• Help manage roles and welcome new friends\n` +
            `• And sooo much more!\n\n` +
            `🌟 **Important!** Please run \`/settings\` to unlock all my amazing capabilities! I promise it'll be worth it!\n\n` +
            `Oh! And if you're looking for some chatty friends, check out Rick and Aisha - they're different AI friends with their own unique personalities. But right now, let's focus on making YOUR server amazing together! 🎨\n\n` +
            `*fidgets with excitement* I can't wait to start our adventure together!`
        )
        .addFields({
          name: '🤗 Need Help?',
          value: `Don't be shy! Join our [support server](${process.env.SUPPORT_SERVER}) - Rick, Aisha and me hang out there too!`,
        })
        .setFooter({
          text: 'Made with ❤️ and a sprinkle of chaos',
        })

      const sentMessage = await targetChannel.send({
        embeds: [serverEmbed],
        components: [row],
      })
      serverMessageLink = sentMessage.url

      if (!guildSettings.server.updates_channel) {
        guildSettings.server.updates_channel = targetChannel.id
        await guildSettings.save()
      }
    }

    // Send DM to server owner
    try {
      const owner = await guild.members.fetch(guild.ownerId)
      if (owner) {
        const dmEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.SUCCESS)
          .setTitle('💝 Special Note from Amina!')
          .setDescription(
            `Hiii <@${owner.id}>! *waves enthusiastically*\n\n` +
              `Thank you soooo much for inviting me to ${guild.name}! I'm literally bouncing off the walls with excitement! 🎨✨\n\n` +
              `To get the most out of our adventure together, pretty please run \`/settings\` in your server! It'll help me unlock all my cool features and let me help make your server super amazing!\n\n` +
              `I'm really good at:\n` +
              `🛡️ Keeping things safe and organized\n` +
              `🎮 Making everything more fun and engaging\n` +
              `🎨 Adding my creative touch to everything I do\n` +
              `💫 And lots more surprises!\n\n` +
              `Can't wait to show you everything I can do! Let's make some magic happen!`
          )
          .addFields({
            name: '✨ Need my help?',
            value: `Just join our [support server](${process.env.SUPPORT_SERVER}) - I'm always there to help! You can also hang out with my bffs Rick and Aisha🤖🎉`,
          })
          .setFooter({ text: 'Your new creative companion ♥' })

        if (serverMessageLink) {
          dmEmbed.addFields({
            name: '📜 Server Message',
            value: `Oopsie! I might have already sent a message in the server! [Click here](${serverMessageLink}) to see what my excited self said! 🙈`,
          })
        }

        await owner.send({
          embeds: [dmEmbed],
          components: [row],
        })
      }
    } catch (err) {
      console.error('Error sending DM to server owner:', err)
    }

    // Schedule a reminder
    setTimeout(
      async () => {
        const updatedSettings = await registerGuild(guild)
        if (!updatedSettings.server.setup_completed) {
          const owner = await guild.members.fetch(guild.ownerId)
          if (owner) {
            const reminderEmbed = new EmbedBuilder()
              .setColor(EMBED_COLORS.BOT_EMBED)
              .setTitle('✨ Friendly Reminder from Amina! ✨')
              .setDescription(
                `Heyyy! *pokes gently* Just your friendly neighborhood Amina here! 🌟\n\n` +
                  `I noticed we haven't finished setting things up yet! Pretty please run \`/settings\` when you can - I have so many cool features I want to show you! 🎨\n\n` +
                  `Can't wait to show you what I can really do! 💖`
              )
              .setFooter({
                text: "Let's make your server amazing together! (◠‿◠✿)",
              })

            await owner.send({ embeds: [reminderEmbed] }).catch(() => {})
          }
        }
      },
      24 * 60 * 60 * 1000
    )
  }

  // Log join to webhook if available
  if (client.joinLeaveWebhook) {
    const embed = new EmbedBuilder()
      .setTitle(`✨ Joined ${guild.name}!`)
      .setThumbnail(guild.iconURL())
      .setColor(client.config.EMBED_COLORS.SUCCESS)
      .addFields(
        { name: 'Server Name', value: guild.name, inline: false },
        { name: 'Server ID', value: guild.id, inline: false },
        {
          name: 'Owner',
          value: `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`,
          inline: false,
        },
        {
          name: 'Members',
          value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
          inline: false,
        },
        {
          name: 'Invite Link',
          value: inviteLink,
          inline: false,
        }
      )
      .setFooter({ text: `Guild #${client.guilds.cache.size}` })

    client.joinLeaveWebhook.send({
      username: 'Join',
      avatarURL: client.user.displayAvatarURL(),
      embeds: [embed],
    })
  }
}
