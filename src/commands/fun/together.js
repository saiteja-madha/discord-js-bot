const { ApplicationCommandOptionType } = require('discord.js')

const discordTogether = [
  'askaway',
  'awkword',
  'betrayal',
  'bobble',
  'checkers',
  'chess',
  'chessdev',
  'doodlecrew',
  'fishing',
  'land',
  'lettertile',
  'meme',
  'ocho',
  'poker',
  'puttparty',
  'puttpartyqa',
  'sketchheads',
  'sketchyartist',
  'spellcast',
  'wordsnack',
  'youtube',
  'youtubedev',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'together',
  description: 'Start a Discord Together activity',
  category: 'FUN',
  botPermissions: ['EmbedLinks'],

  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'type',
        description: 'Select a Discord Together activity',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map(game => ({ name: game, value: game })),
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('type')
    const response = await getTogetherInvite(interaction.member, choice)
    await interaction.followUp(response)
  },
}

async function getTogetherInvite(member, choice) {
  choice = choice.toLowerCase()

  const vc = member.voice.channel?.id
  if (!vc) return 'You must be in a voice channel to use this command.'

  if (!discordTogether.includes(choice)) {
    return `Invalid game.\nValid games: ${discordTogether.join(', ')}`
  }

  const invite = await member.client.discordTogether.createTogetherCode(
    vc,
    choice
  )
  return `Click [here](https://discord.com/invite/${invite.code}) to join the ${choice} activity!`
}
