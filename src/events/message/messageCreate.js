const { automodHandler, statsHandler } = require('@src/handlers')
const { EMBED_COLORS } = require('@root/config')
const { getSettings } = require('@schemas/Guild')
const { getUser, removeAfk } = require('@schemas/User')
const { EmbedBuilder } = require('discord.js')
const fetch = require('node-fetch')

/**
 * Fetches pronouns for a user from PronounsDB API v2
 * @param {string} userId Discord user ID
 * @returns {Promise<string>} Returns pronouns in subject/object format
 */
async function fetchPronouns(userId) {
  try {
    const response = await fetch(
      `https://pronoundb.org/api/v2/lookup?platform=discord&ids=${userId}`
    )
    if (!response.ok) return 'they/them'

    const data = await response.json()
    const userPronouns = data[userId]?.sets?.en?.[0]

    // Map the v2 API single pronouns to subject/object pairs
    const pronounsMap = {
      he: 'he/him',
      she: 'she/her',
      they: 'they/them',
      it: 'it/its',
      any: 'they/them', // Default to neutral for "any"
      ask: 'they/them', // Default to neutral for "ask"
      avoid: 'they/them', // Default to neutral for "avoid"
    }

    return pronounsMap[userPronouns] || 'they/them'
  } catch (error) {
    console.error('Error fetching pronouns:', error)
    return 'they/them' // Fallback to gender-neutral pronouns
  }
}

/**
 * Gets the appropriate verb conjugation based on pronouns
 * @param {string} subject The subject pronoun
 * @returns {string} Returns 're for "they", 's for others
 */
function getVerbConjugation(subject) {
  return subject === 'they' ? "'re" : "'s"
}

/**
 * Generates a pronoun-aware AFK message
 * @param {Object} params Parameters for generating message
 * @returns {string} Formatted AFK message
 */
function generateAfkMessage(params) {
  const { pronouns, minutes = 0 } = params
  const [subject, object] = pronouns.split('/')

  // Capitalize first letter of subject pronoun
  const Subject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const verb = getVerbConjugation(subject)

  const timeBasedIntros = {
    short: [
      `*whispers* ${Subject} just left! The trail is still warm!`,
      `*tiptoes in* Psst! ${Subject} stepped away moments ago!`,
    ],
    medium: [
      `*dramatic gasp* ${Subject}${verb} been missing for a bit!`,
      `*spins around* Oh! ${Subject}${verb} been gone for some time!`,
    ],
    long: [
      `*spins around* ${Subject}${verb} been gone for like... forever!`,
      `*bounces worriedly* ${Subject}${verb} been away for quite a while!`,
    ],
    veryLong: [
      `*falls over* ${Subject}${verb} been gone for AGES!`,
      `*dramatically faints* We've been waiting for ${object} for so long!`,
    ],
  }

  let category
  if (minutes < 5) category = 'short'
  else if (minutes < 30) category = 'medium'
  else if (minutes < 60) category = 'long'
  else category = 'veryLong'

  const intros = timeBasedIntros[category]
  return intros[Math.floor(Math.random() * intros.length)]
}

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return
  const settings = await getSettings(message.guild)

  // Check if message author is AFK and remove their AFK status
  const authorData = await getUser(message.author)
  if (authorData.afk?.enabled) {
    const authorPronouns = await fetchPronouns(message.author.id)
    const [subject] = authorPronouns.split('/')
    const Subject = subject.charAt(0).toUpperCase() + subject.slice(1)
    const verb = getVerbConjugation(subject)

    await removeAfk(message.author.id)
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(
        `*Bounces excitedly* Welcome back ${message.author.toString()}! 🌟\n` +
          `${Subject}${verb} faster than a shooting star! ✨`
      )
    const response = await message.channel.send({ embeds: [embed] })
    setTimeout(() => response.delete().catch(() => {}), 5000)
  }

  // Check for mentioned users who are AFK
  if (message.mentions.users.size > 0) {
    const mentions = [...message.mentions.users.values()]
    const afkMentions = []

    for (const mentionedUser of mentions) {
      if (mentionedUser.id === message.author.id) continue

      const userData = await getUser(mentionedUser)
      if (userData.afk?.enabled) {
        const userPronouns = await fetchPronouns(mentionedUser.id)
        const minutes = userData.afk.since
          ? Math.round((Date.now() - userData.afk.since.getTime()) / 1000 / 60)
          : 0

        const statusIntro = generateAfkMessage({
          pronouns: userPronouns,
          minutes,
        })

        let timePassed = ''
        if (userData.afk.since) {
          timePassed = `\n⏰ Been gone for: ${minutes} minutes *gasp*`
        }

        let endTime = ''
        if (userData.afk.endTime && userData.afk.endTime > new Date()) {
          const minutesLeft = Math.round(
            (userData.afk.endTime - new Date()) / 1000 / 60
          )
          const [subject] = userPronouns.split('/')
          const verb = getVerbConjugation(subject)
          endTime = `\n⌛ ${subject} should be back in: ${minutesLeft} minutes (unless ${subject}${verb} lost in a parallel dimension~)`
        }

        afkMentions.push({
          user: mentionedUser.toString(),
          intro: statusIntro,
          reason:
            userData.afk.reason || '*shrugs mysteriously* No reason given!',
          timePassed,
          endTime,
        })
      }
    }

    if (afkMentions.length > 0) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setTitle('🌟 AFK Alert! 🌟')
        .setDescription(
          afkMentions
            .map(
              mention =>
                `${mention.intro}\n${mention.user} is away: ${mention.reason}${mention.timePassed}${mention.endTime}`
            )
            .join('\n\n')
        )

      const response = await message.channel.send({ embeds: [embed] })
      setTimeout(() => response.delete().catch(() => {}), 10000)
    }
  }

  // Amina mentions handling
  if (message.content.includes(`${client.user.id}`)) {
    const responses = [
      "*bounces in* Hi hi! ✨ I only respond to /commands now - they're way cooler! Try /help to see all my tricks!",
      '*slides in dramatically* Prefix commands? Those are sooo last season! Use /commands instead! ✨',
      "*appears in a puff of glitter* Psst! Want to see something cool? Try using /help! That's how you talk to me now! 🌟",
      '*drops from the ceiling* HELLO! 👋 Just use / to see all the amazing things I can do!',
    ]
    message.channel.send(
      responses[Math.floor(Math.random() * responses.length)]
    )
  }

  // Stats handling
  if (settings.stats.enabled) {
    await statsHandler.trackMessageStats(message, false, settings)
  }

  // Automod handling
  await automodHandler.performAutomod(message, settings)
}
