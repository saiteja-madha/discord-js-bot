const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js')
const {
  getUser,
  addFlag,
  removeFlag,
  removeAllFlags,
} = require('@schemas/User')

const MAX_FLAGS = 5

const DANGER_RATINGS = {
  1: { label: 'Low Risk ⚠️', color: 0xffff00 },
  2: { label: 'Moderate Risk ⚠️⚠️', color: 0xff9900 },
  3: { label: 'High Risk ⚠️⚠️⚠️', color: 0xff6600 },
  4: { label: 'Very High Risk ⚠️⚠️⚠️⚠️', color: 0xff3300 },
  5: { label: 'Extremely Dangerous ⚠️⚠️⚠️⚠️⚠️', color: 0xff0000 },
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'redflag',
  description: 'Manage red flags on users',
  cooldown: 5,
  category: 'UTILITY',

  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'add',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Add a red flag to a user',
        options: [
          {
            name: 'user',
            description: 'User to add a red flag to',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'reason',
            description: 'Reason for adding a red flag',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Remove your red flag from a user',
        options: [
          {
            name: 'user',
            description: 'User to remove your red flag from',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'check',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Check red flags on a user',
        options: [
          {
            name: 'user',
            description: 'User to check red flags on',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: 'clear',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'Clear all red flags from a user (Admin only)',
        options: [
          {
            name: 'user',
            description: 'User to clear all red flags from',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason')

    // Only prevent self-flagging/unflagging/clearing, allow self-check
    if (user.id === interaction.user.id && subcommand !== 'check') {
      return interaction.followUp(
        "Whoopsie! You can't add or remove red flags on yourself, silly! That'd be like trying to tickle yourself - fun idea, but it just doesn't work! 😜"
      )
    }

    const response = await handleRedFlag(interaction, subcommand, user, reason)
    await interaction.followUp(response)
  },
}

async function handleRedFlag(interaction, action, user, reason) {
  let userDb = await getUser(user)

  // If user doesn't exist in database, create them
  if (!userDb) {
    userDb = await Model.create({
      _id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      flags: [],
    })
  }

  const isAdmin = interaction.member.permissions.has(
    PermissionFlagsBits.ModerateMembers
  )

  switch (action) {
    case 'add':
      if (!reason)
        return "Oopsie! You forgot to give a reason! Don't leave me hanging, spill the tea! ☕️"

      // Check if user already has a flag from this flagger
      if (userDb.flags?.some(flag => flag.flaggedBy === interaction.user.id)) {
        return "Whoa there, flag enthusiast! You've already planted your flag on this user's profile. One's enough, don't you think? 🚩😅"
      }

      // Check if max flags reached
      if (userDb.flags?.length >= MAX_FLAGS) {
        return `Holy moly! This user's got more red flags than a parade! They've hit the max of ${MAX_FLAGS}. Time to slow down, flag master! 🎭`
      }

      await addFlag(
        user.id,
        reason,
        interaction.user.id,
        interaction.guild.id,
        interaction.guild.name
      )
      return `⚠️ Red flag added to ${user.tag}! Reason: ${reason}\nWow, that's some spicy info! I'll keep it safe in my quirky collection of odd facts. 🌶️🗃️`

    case 'remove':
      if (!userDb.flags?.length)
        return "Psst... this user's as clean as a whistle! Not a red flag in sight. Are you sure you didn't dream about adding one? 🌠"

      // Check if user has a flag from this person
      if (!userDb.flags.some(flag => flag.flaggedBy === interaction.user.id)) {
        return "Uh-oh! Looks like you're trying to remove a flag you never planted. Nice try, sneaky! 😏"
      }

      await removeFlag(user.id, interaction.user.id)
      return `✅ Your red flag was removed from ${user.tag}! Poof! It's gone like magic... or like my last brilliant idea. Was it brilliant? I forgot. 🎩✨`

    case 'clear':
      if (!isAdmin)
        return "Nice try, but that's an admin-only move! You're not fooling this quirky bot! 🕵️‍♀️"
      if (!userDb.flags?.length)
        return "Aww, there are no flags to clear! This user's reputation is already squeaky clean. Like, 'eat-off-the-floor' clean! 🍽️"

      await removeAllFlags(user.id)
      return `✅ All red flags have been cleared from ${user.tag}! It's like spring cleaning, but for reputations. Everything's fresh and sparkly now! ✨🧼`

    case 'check':
      if (!userDb.flags?.length)
        return "Good news! This user is flag-free. They're as innocent as a unicorn in a field of rainbows! 🦄🌈"

      const flagFields = await Promise.all(
        userDb.flags.map(async (flag, index) => {
          const flagger = await interaction.client.users.fetch(flag.flaggedBy)
          return [
            {
              name: `Red Flag #${index + 1}`,
              value: `**By:** ${flagger.tag}\n**Server:** ${flag.serverName}\n**When:** <t:${Math.floor(flag.flaggedAt.getTime() / 1000)}:R>\n**Reason:** ${flag.reason}`,
              inline: false,
            },
          ]
        })
      )

      const rating = DANGER_RATINGS[userDb.flags.length]

      let description = `Uh-oh! Looks like we've got some tea to spill! 🍵 This user has ${userDb.flags.length} red flag${userDb.flags.length > 1 ? 's' : ''}!\n**Current Status:** ${rating.label}`

      // Add note if user is checking their own flags
      if (user.id === interaction.user.id) {
        description +=
          "\n\n**Note:** These are the red flags on your account. Don't worry, we all have our quirks! If you think any of these are unfair, go chat with the server admins. They don't bite... usually. 😉"
      }

      return {
        embeds: [
          {
            title: '🚩 Red Flag Fiesta! 🎉',
            description: description,
            fields: flagFields.flat(),
            color: rating.color,
            footer: {
              text: 'Remember: Users can remove their own flags, and admins can go flag-clearing crazy!',
            },
          },
        ],
      }

    default:
      return "Whoopsie-daisy! Something went wonky. Did you try to invent a new command? I love creativity, but let's stick to the script for now! 😅"
  }
}
