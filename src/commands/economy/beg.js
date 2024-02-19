const { EmbedBuilder } = require('discord.js')
const { getUser } = require('@schemas/User')
const { EMBED_COLORS, ECONOMY } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'beg',
  description: 'beg from someone',
  category: 'ECONOMY',
  cooldown: 3600,
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = await beg(interaction.user)
    await interaction.followUp(response)
  },
}

async function beg(user) {
  let users = [
    'Vikshan',
    'Mochi',
    'Mimo',
    'Maria',
    'Elpida',
    'Marianna',
    'Arianna',
    'Mara',
    'Ari',
    'Hope',
    'Tony Stark',
    'Homelander',
    'Thanos',
    'Billy Butcher',
    'Captain America',
    'Thor',
    'Hulk',
    'NTTS',
    'Captain Marvel',
    'MKBHD',
    'Marques Brownlee',
    'mrwhosetheboss',
    'Unbox Therapy',
    'Linus Tech Tips',
    'Dave Lee',
    'Jerry Rig Everything',
    'Elon Musk',
    'Nicki Minaj',
    'Megan Thee Stallion',
    'Cardi B',
    'Beyonce',
    'Ariana Grande',
    'Taylor Swift',
    'Wet Ass Pussy',
    'Naruto',
    'Mr. Beast',
    'Ur Mom',
    'A Broke Person',
    'Ur dad',
    'Donald Trump',
    'A Random Asian Mom',
    'Ur Step Sis',
    'Ur Step Dad',
    'Sakura (AKA Trash Can)',
    'Pussy The Cat',
    'Kakashi Sensei',
    'The Rock',
    'Loki',
    'Konshu',
    'I am Vengeance aka Batman',
    'Some Hoe in the room',
    'Will Smith',
    'Someone from the HUB',
    "A sugar daddy who probably ain't after you",
    "A sugar mommy who probably ain't after you",
  ]

  let amount = Math.floor(
    Math.random() * `${ECONOMY.MAX_BEG_AMOUNT}` + `${ECONOMY.MIN_BEG_AMOUNT}`
  )
  const userDb = await getUser(user)
  userDb.coins += amount
  await userDb.save()

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**${users[Math.floor(Math.random() * users.length)]}** donated you **${amount}** ${ECONOMY.CURRENCY}\n` +
        `**Updated Balance:** **${userDb.coins}** ${ECONOMY.CURRENCY}`
    )

  return { embeds: [embed] }
}
