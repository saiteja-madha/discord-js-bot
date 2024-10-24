const { EMBED_COLORS } = require('@root/config')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'hack',
  description:
    "Let Amina 'hack' into someone's life with her chaotic energy~! ✨",
  cooldown: 10,
  category: 'FUN',

  botPermissions: ['SendMessages', 'EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'target',
        description: 'Who should I unleash my chaotic hacking powers on? >:D',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser('target')
    if (target.bot)
      return interaction.followUp(
        "Eeek! I can't hack another bot - we might cause a paradox! 🌀"
      )

    const chaoticHackStages = [
      `*frantically mashes keyboard* INITIALIZING HACK ON ${target.toString()}! HERE WE GOOOOO! 🚀`,
      `Ohoho! Sneaking into ${target.toString()}'s super-secret digital fortress... *tippy-toes past firewalls*`,
      `*giggles maniacally* Breaking through security with the power of CHAOS! ✨`,
      `Downloading all their embarrassing selfies... Oh. My. GOSH. 📸`,
      `Found their secret playlist! It's full of... BABY SHARK REMIXES?! 🦈`,
      `EMAIL ACQUIRED! ${target.username.toLowerCase()}@totally-not-sus.uwu\nPassword: iLovePineappleOnPizza123`,
      `*gasps* They have HOW MANY cat videos saved? This is GOLD! 😻`,
      `JACKPOT! Found their secret collection of horrible dad jokes! Saving those for later... 📦`,
      `Breaking into their diary- I mean, "personal documentation system" 📔`,
      `OH OH OH! You won't BELIEVE what I just found! *bouncing excitedly*`,
      `MISSION ACCOMPLISHED! Time to spill the tea! ☕`,
    ]

    const initialEmbed = new EmbedBuilder()
      .setTitle("🎮 Amina's Super Special Hack Attack!")
      .setDescription(chaoticHackStages[0])
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTimestamp(Date.now())

    const message = await interaction.followUp({ embeds: [initialEmbed] })

    // Chaotic updates with random timing!
    for (let i = 1; i < chaoticHackStages.length; i++) {
      await new Promise(resolve =>
        setTimeout(resolve, 2500 + Math.random() * 1000)
      )

      const embed = new EmbedBuilder()
        .setTitle("🎮 Amina's Super Special Hack Attack!")
        .setDescription(chaoticHackStages[i])
        .setColor(EMBED_COLORS.WARNING)
        .setTimestamp(Date.now())

      await message.edit({ embeds: [embed] })
    }

    const resultsEmbed = new EmbedBuilder()
      .setTitle('🌟 OMG, Look What I Found!')
      .setDescription(
        `The super-secret files about ${target.toString()} have been secured! *evil laughter*`
      )
      .addFields([
        {
          name: '🎭 The Ultimate Truth!',
          value:
            "We're no strangers to love~ 🎵\n" +
            'You know the rules and so do I~ 🎵\n' +
            "A full commitment's what I'm thinking of~ 🎵\n" +
            "You wouldn't get this from any other bot! 🎵",
        },
      ])
      .setColor(EMBED_COLORS.SUCCESS)
      .setImage('https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif')
      .setFooter({
        text: "Teeheehee! Get Rick Roll'd! My greatest hack yet! 🎀",
      })

    try {
      await interaction.user.send({
        content: '*slides into your DMs with stolen data*',
        embeds: [resultsEmbed],
      })

      const finalEmbed = new EmbedBuilder()
        .setTitle('✨ Mission Complete! ✨')
        .setDescription(
          'I sent you some juicy secrets in your DMs! *winks conspiratorially* 📨'
        )
        .setColor(EMBED_COLORS.SUCCESS)
        .setTimestamp(Date.now())

      await message.edit({ embeds: [finalEmbed] })
    } catch (error) {
      await message.edit({
        content:
          "Aw man, your DMs are locked tight! Here's the tea right here instead:",
        embeds: [resultsEmbed],
      })
    }
  },
}
