const {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js')
const { getQuestions } = require('@schemas/TruthOrDare')
const { getUser } = require('@schemas/User')
const { handleTodButtonClick } = require('@handlers/tod')
const { EMBED_COLORS } = require('@root/src/config')

// Helper function to create rating choices with Amina's style
const getRatingChoices = () => [
  { name: 'pg - keep it light and fun!', value: 'PG' },
  { name: 'pg-13 - getting interesting...', value: 'PG-13' },
  { name: 'pg-16 - spicy territory ahead', value: 'PG-16' },
  { name: 'r - strictly grown-ups only', value: 'R' },
]

// Helper function to create subcommand with rating option
const createSubcommandWithRating = (name, description) => ({
  name,
  description,
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'rating',
      description: 'how spicy do you want this to get?',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: getRatingChoices(),
    },
  ],
})

module.exports = {
  name: 'tod',
  description: "ready for some truth or dare chaos? let's go!",
  category: 'FUN',
  slashCommand: {
    enabled: true,
    options: [
      createSubcommandWithRating('truth', 'time to spill some secrets!'),
      createSubcommandWithRating(
        'dare',
        "feeling brave? let's test your courage!"
      ),
      createSubcommandWithRating(
        'paranoia',
        "ooh, let's get into your head a bit"
      ),
      createSubcommandWithRating('nhie', 'never have i ever... or have i?'),
      createSubcommandWithRating('wyr', 'tough choices ahead, friend!'),
      createSubcommandWithRating('hye', "let's dig up some stories!"),
      createSubcommandWithRating(
        'wwyd',
        'what would you do in this wild scenario?'
      ),
      createSubcommandWithRating(
        'random',
        "feeling lucky? let's surprise you!"
      ),
    ],
  },

  async interactionRun(interaction) {
    if (interaction.isButton()) {
      return handleTodButtonClick(interaction)
    }

    const subcommand = interaction.options.getSubcommand()
    const requestedRating = interaction.options.getString('rating')
    const user = await getUser(interaction.member.user)

    if (!user.profile?.age) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setTitle('✦ hold up friend!')
            .setDescription(
              'i need to know your age first! use `/profile set` so we can play safely!'
            ),
        ],
        ephemeral: true,
      })
    }

    if (requestedRating === 'R') {
      if (user.profile.age < 18) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setTitle('✦ oops, age check failed!')
              .setDescription(
                'sorry friend, that stuff is for the grown-ups only!'
              ),
          ],
          ephemeral: true,
        })
      }

      if (!interaction.channel.nsfw) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setTitle('✦ wrong place!')
              .setDescription(
                'psst! we need to be in an nsfw channel for that kind of fun!'
              ),
          ],
          ephemeral: true,
        })
      }
    }

    switch (subcommand) {
      case 'truth':
        sendQuestion(interaction, 'truth', user.profile.age, requestedRating)
        break
      case 'dare':
        sendQuestion(interaction, 'dare', user.profile.age, requestedRating)
        break
      case 'paranoia':
        sendQuestion(interaction, 'paranoia', user.profile.age, requestedRating)
        break
      case 'nhie':
        sendQuestion(interaction, 'nhie', user.profile.age, requestedRating)
        break
      case 'wyr':
        sendQuestion(interaction, 'wyr', user.profile.age, requestedRating)
        break
      case 'hye':
        sendQuestion(interaction, 'hye', user.profile.age, requestedRating)
        break
      case 'wwyd':
        sendQuestion(interaction, 'wwyd', user.profile.age, requestedRating)
        break
      case 'random':
        sendRandomQuestion(interaction, user.profile.age, requestedRating)
        break
    }
  },
}

async function sendQuestion(interaction, category, userAge, requestedRating) {
  const questions = await getQuestions(1, category, userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ oh no!')
          .setDescription(
            "i searched everywhere but couldn't find any questions matching what you wanted!"
          ),
      ],
    })
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`✦ ${category.toUpperCase()} TIME!`)
    .setDescription(
      `hey ${interaction.user.username}! here's a fun one:\n\n**${question.question}**\n\nwhat's it gonna be? truth? dare? or something totally random?`
    )
    .setFooter({
      text: `type: ${category} | rating: ${question.rating} | qid: ${question.questionId} | player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('spill the truth!'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('take the dare!'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('surprise me!')
  )

  await interaction.followUp({
    embeds: [embed],
    components: [buttons],
  })
}

async function sendRandomQuestion(interaction, userAge, requestedRating) {
  const questions = await getQuestions(1, 'random', userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ oh no!')
          .setDescription(
            "i searched everywhere but couldn't find any questions matching what you wanted!"
          ),
      ],
    })
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle('✦ RANDOM SURPRISE!')
    .setDescription(
      `ooh, this is gonna be fun! ready?\n\n**${question.question}**\n\nwhat's your next move?`
    )
    .setFooter({
      text: `type: ${question.category} | rating: ${question.rating} | qid: ${question.questionId} | player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('spill the truth!'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('take the dare!'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('surprise me!')
  )

  await interaction.followUp({ embeds: [embed], components: [buttons] })
}
