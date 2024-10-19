const { ApplicationCommandOptionType } = require('discord.js')
const { getUser, updatePremium } = require('@schemas/User')
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'premium',
  description: 'Manage premium status for users',
  cooldown: 5,
  category: 'DEV',
  devOnly: true,
  global: true,
  slashCommand: {
    enabled: false,
    ephemeral: true,
    options: [
      {
        name: 'add',
        description: 'Add premium status to a user',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'The user to give premium status',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'duration',
            description: 'Duration of premium status in days',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        description: 'Remove premium status from a user',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'The user to remove premium status from',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const targetUser = interaction.options.getUser('user')

    let userDb = await getUser(targetUser)

    if (!userDb) {
      userDb = await addUser(targetUser)
    }

    if (subcommand === 'add') {
      const duration = interaction.options.getInteger('duration')

      if (duration <= 0) {
        return interaction.followUp(
          "Oopsie-daisy! 🌼 You can't add negative or zero days. That's like trying to eat a sandwich backwards - fun idea, but it just doesn't work! Try a positive number, you silly goose! 🦢"
        )
      }

      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + duration)

      await updatePremium(targetUser.id, true, expirationDate)

      return interaction.followUp(
        `✨🎉 Woohoo! ${targetUser.tag} just got a golden ticket to the premium party! 🎫✨ They're now part of our super-secret, ultra-cool, totally-not-made-up VIP club until <t:${Math.floor(expirationDate.getTime() / 1000)}:F>. That's ${duration} days of pure awesomeness! Maybe they'll finally learn the secret handshake! 🤫🤝`
      )
    } else if (subcommand === 'remove') {
      if (!userDb.premium.enabled) {
        return interaction.followUp(
          `Uh-oh! Looks like ${targetUser.tag} never got invited to the premium party in the first place! 🎭 They're about as premium as a cardboard crown right now. Can't remove what's not there, you know? It's like trying to erase an invisible ink drawing! 🖍️`
        )
      }

      await updatePremium(targetUser.id, false, null)

      return interaction.followUp(
        `Aw, snap! 📸 ${targetUser.tag}'s premium status just went 'poof'! 💨 They've been gently escorted from the VIP lounge back to the regular party. But hey, the regular party is pretty cool too! We've got snacks and everything! 🍿🥤`
      )
    }
  },
}
