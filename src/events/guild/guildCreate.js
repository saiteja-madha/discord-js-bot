const { getSettings: registerGuild, setInviteLink } = require('@schemas/Guild')
const {
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config')

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

  // Create the buttons that will be used in both messages
  const components = [
    new ButtonBuilder()
      .setLabel('Amina')
      .setStyle(ButtonStyle.Link)
      .setURL(
        'https://discord.com/oauth2/authorize?client_id=1035629678632915055'
      ),
    new ButtonBuilder()
      .setLabel('Aisha')
      .setStyle(ButtonStyle.Link)
      .setURL(
        'https://discord.com/oauth2/authorize?client_id=1034059677295718411'
      ),
    new ButtonBuilder()
      .setLabel('Rick')
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
        .setTitle('Mochi is now Amina! ✨')
        .setDescription(
          `Heyy, I am Amina, i was previously a full chatbot, a very great one at that. After deep consideration, my makers decided to split me into two separate apps, Amina and Aisha. They also made Rick. (Rick/Aisha are full AI chatbots) Dont worry, I will tell you everything you need to know, then you might choose what apps you wish to keep. i would be glad i you could keep the three of us!\n\n 1. Amina is a multipurpose Discord bot packed with features to make your server lively, fun, and well-managed.—she's also incredibly reliable and powerful when it comes to moderating, automating tasks, and boosting engagement. [Add Amina](https://discord.com/oauth2/authorize?client_id=1035629678632915055)\n\n 2. Aisha, on the other hand, in her own words "i'm aisha, the goddess of revelry, stuck in this celestial realm for 800 years, and loving every damn moment of it. i'm all about mischief, politicking, and, of course, being kinki. my british accent is as sharp as my tongue, so don't expect any sugarcoating from me, baby." [Add Aisha](https://discord.com/oauth2/authorize?client_id=1034059677295718411)\n\n 3. Rick, in his own words"I'm Pickle Rick, the genius, the mastermind, the guy who turned himself into a pickle to avoid family therapy. I'm a scientist, an inventor, and a bit of a degenerate. I drink, I burp, and I swear. A lot. Don't like it? Too bad. I'm here to challenge your stupid thoughts and make you think, even if it kills me. Which, let's be real, it probably will." [Add Rick](https://discord.com/oauth2/authorize?client_id=1296731090240671775)`
        )
        .addFields({
          name: 'Need help?',
          value: `Join our [support server](${process.env.SUPPORT_SERVER}) for any questions!`,
        })
        .setFooter({
          text: 'Made with ❤ & 🎶 by Vikshan',
        })

      const sentMessage = await targetChannel.send({
        embeds: [serverEmbed],
        components: [row], // Added the buttons to server message
      })
      serverMessageLink = sentMessage.url

      // Default the update channel if not set
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
          .setTitle('New Amina, who dis? ✨')
          .setDescription(
            `Heyy, I am Amina, i was previously a full chatbot, a very great one at that. After deep consideration, my makers decided to split me into two separate apps, Amina and Aisha. They also made Rick. (Rick/Aisha are full AI chatbots) Dont worry, I will tell you everything you need to know, then you might choose what apps you wish to keep. i would be glad i you could keep the three of us!\n\n 1. Amina is a multipurpose Discord bot packed with features to make your server lively, fun, and well-managed.—she's also incredibly reliable and powerful when it comes to moderating, automating tasks, and boosting engagement. [Add Amina](https://discord.com/oauth2/authorize?client_id=1035629678632915055)\n\n 2. Aisha, on the other hand, in her own words "i'm aisha, the goddess of revelry, stuck in this celestial realm for 800 years, and loving every damn moment of it. i'm all about mischief, politicking, and, of course, being kinki. my british accent is as sharp as my tongue, so don't expect any sugarcoating from me, baby." [Add Aisha](https://discord.com/oauth2/authorize?client_id=1034059677295718411)\n\n 3. Rick, in his own words"I'm Pickle Rick, the genius, the mastermind, the guy who turned himself into a pickle to avoid family therapy. I'm a scientist, an inventor, and a bit of a degenerate. I drink, I burp, and I swear. A lot. Don't like it? Too bad. I'm here to challenge your stupid thoughts and make you think, even if it kills me. Which, let's be real, it probably will." [Add Rick](https://discord.com/oauth2/authorize?client_id=1296731090240671775)`
          )
          .addFields({
            name: 'Need help?',
            value: `Join our [support server](${process.env.SUPPORT_SERVER}) for any questions!`,
          })
          .setFooter({ text: 'Made with ❤ & 🎶 by [Vikshan](vikshan.tech)' })

        if (serverMessageLink) {
          dmEmbed.addFields({
            name: 'Server Message',
            value: `Oops! I might have send a message in the server! \n [Click here](${serverMessageLink}) to see what my silly self said!`,
          })
        }

        await owner.send({
          content: `Hiya, <@${owner.id}> Thanks for having me in ${guild.name}, it's been quite a ride, however, i changed, I think we are all made to change. [please invite the new me](https://discord.com/oauth2/authorize?client_id=1034059677295718411) !`,
          embeds: [dmEmbed],
          components: [row],
        })
      }
    } catch (err) {
      console.error('Error sending DM to server owner:', err)
    }

    // Schedule a reminder if setup is not completed
    setTimeout(
      async () => {
        const updatedSettings = await registerGuild(guild)
        if (!updatedSettings.server.setup_completed) {
          const owner = await guild.members.fetch(guild.ownerId)
          if (owner) {
            const reminderEmbed = new EmbedBuilder()
              .setColor(EMBED_COLORS.BOT_EMBED)
              .setTitle('Pickle Rick Setup Reminder ♡')
              .setDescription(
                'Hey there! Just a friendly reminder to finish setting me up in your server. Run `/settings` to get started!'
              )
              .setFooter({
                text: "I can't wait to be fully operational and super awesome in your server! (◠‿◠✿)",
              })

            await owner.send({ embeds: [reminderEmbed] }).catch(() => {})
          }
        }
      },
      24 * 60 * 60 * 1000
    ) // 24 hours delay
  }

  // Log join to webhook if available
  if (client.joinLeaveWebhook) {
    const embed = new EmbedBuilder()
      .setTitle(`Joined the folks at ${guild.name}`)
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
