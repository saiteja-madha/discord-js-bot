const {
  addReactionRole,
  getReactionRoles,
  removeReactionRole,
} = require('@schemas/ReactionRoles')
const {
  parseEmoji,
  ApplicationCommandOptionType,
  ChannelType,
} = require('discord.js')
const { parsePermissions } = require('@helpers/Utils')

const channelPerms = [
  'EmbedLinks',
  'ReadMessageHistory',
  'AddReactions',
  'UseExternalEmojis',
  'ManageMessages',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'reactionrole',
  description: 'Manage reaction roles for the specified message!',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  global: true,
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'action',
        description: 'Choose an action: add or remove the reaction role!',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
        ],
      },
      {
        name: 'channel',
        description: 'Channel where the message exists 📬',
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: 'message_id',
        description: 'Message ID to manage reaction roles 📝',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'emoji',
        description: 'Emoji to use for adding reaction role 😊',
        type: ApplicationCommandOptionType.String,
        required: false, // Only required for adding
      },
      {
        name: 'role',
        description: 'Role to be given for the selected emoji 🎭',
        type: ApplicationCommandOptionType.Role,
        required: false, // Only required for adding
      },
    ],
  },

  async interactionRun(interaction) {
    const action = interaction.options.getString('action')
    const targetChannel = interaction.options.getChannel('channel')
    const messageId = interaction.options.getString('message_id')

    if (action === 'add') {
      const reaction = interaction.options.getString('emoji')
      const role = interaction.options.getRole('role')

      const response = await addRR(
        interaction.guild,
        targetChannel,
        messageId,
        reaction,
        role
      )
      await interaction.followUp(response)
    } else if (action === 'remove') {
      const response = await removeRR(
        interaction.guild,
        targetChannel,
        messageId
      )
      await interaction.followUp(response)
    }
  },
}

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Oh no! I need the following permissions in ${channel.toString()} to set up the reaction role:\n${parsePermissions(channelPerms)} 💦`
  }

  let targetMessage
  try {
    targetMessage = await channel.messages.fetch({ message: messageId })
  } catch (ex) {
    return 'Oopsie! Could not fetch the message. Did you provide a valid message ID? 🤔'
  }

  if (role.managed) {
    return 'Oh dear! I cannot assign bot roles. 🤖💔'
  }

  if (guild.roles.everyone.id === role.id) {
    return "Oops! You cannot assign the everyone role. That wouldn't be fair! 🙅‍♀️"
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return 'Yikes! I can’t add/remove members to that role. Is that role higher than mine? 🤷‍♀️'
  }

  const custom = parseEmoji(reaction)
  if (custom.id && !guild.emojis.cache.has(custom.id))
    return 'Oh no! This emoji does not belong to this server. 😢'

  const emoji = custom.id ? custom.id : custom.name

  try {
    await targetMessage.react(emoji)
  } catch (ex) {
    return `Oops! Failed to react. Is this a valid emoji: ${reaction} ? 😟`
  }

  let reply = ''
  const previousRoles = await getReactionRoles(
    guild.id,
    channel.id,
    targetMessage.id
  )
  if (previousRoles.length > 0) {
    const found = previousRoles.find(rr => rr.emote === emoji)
    if (found)
      reply =
        'A role is already configured for this emoji. Overwriting data! 🎈\n'
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id)
  return (reply += 'Done! 🎉 Configuration saved successfully! 🌈')
}

async function removeRR(guild, channel, messageId) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Oh no! I need the following permissions in ${channel.toString()} to remove the reaction role:\n${parsePermissions(channelPerms)} 💦`
  }

  let targetMessage
  try {
    targetMessage = await channel.messages.fetch({ message: messageId })
  } catch (ex) {
    return 'Oopsie! Could not fetch the message. Did you provide a valid message ID? 🤔'
  }

  try {
    await removeReactionRole(guild.id, channel.id, targetMessage.id)
    await targetMessage.reactions?.removeAll()
  } catch (ex) {
    return 'Oops! An unexpected error occurred. Try again later. 😟'
  }

  return 'Done! 🎉 Configuration updated successfully! 🌈'
}
