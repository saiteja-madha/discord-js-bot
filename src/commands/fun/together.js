const { EMBED_COLORS } = require('@root/src/config')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

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
  description: "let's start an adventure together in a voice channel!",
  category: 'FUN',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'type',
        description: 'pick your flavor of fun - what shall we play?',
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

  if (!member.voice.channel?.id) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ oops, slight problem!')
          .setDescription(
            "hey friend! looks like you need to hop into a voice channel first - i can't start the fun without knowing where to set it up!"
          ),
      ],
    }
  }

  if (!discordTogether.includes(choice)) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle("✦ hmm, that's not quite right")
          .setDescription(
            `oh! that game isn\'t in my collection yet. here\'s what we can play:\n\n${discordTogether.join(', ')}`
          ),
      ],
    }
  }

  const invite = await member.client.discordTogether.createTogetherCode(
    member.voice.channel.id,
    choice
  )

  return {
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle(`✦ time for ${choice}!`)
        .setDescription(
          `quick, quick! [click here](${invite.code}) to jump into the fun! i've got everything set up and ready to go!`
        ),
    ],
  }
}
