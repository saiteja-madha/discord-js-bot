const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require('discord.js')
const { timeformat } = require('@helpers/Utils')
const {
  EMBED_COLORS,
  SUPPORT_SERVER,
  DASHBOARD,
  DONATE_URL,
  DOCS_URL,
  GITHUB_SPONSORS_URL,
  PATREON_URL,
} = require('@root/config.js')
const botstats = require('./sub/botstats')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'bot',
  description: 'bot related commands',
  category: 'INFO',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'invite',
        description: "get bot's invite",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'stats',
        description: "get bot's statistics",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'uptime',
        description: "get bot's uptime",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'donate',
        description: 'donate to the bot',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'docs',
        description: "get bot's documentation",
        type: ApplicationCommandOptionType.Subcommand,
      },

      {
        name: 'ping',
        description: "get bot's ping",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'changelog',
        description: "Get the bot's mini-changelog for the latest 3 releases",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand()
    if (!sub) return interaction.followUp('Not a valid subcommand')

    // Invite
    if (sub === 'invite') {
      const response = botInvite(interaction.client)
      try {
        await interaction.user.send(response)
        return interaction.followUp(
          'Check your DM for my information! :envelope_with_arrow:'
        )
      } catch (ex) {
        return interaction.followUp(
          'I cannot send you my information! Is your DM open?'
        )
      }
    }

    // Donate
    else if (sub === 'donate') {
      const embed = new EmbedBuilder()
        .setAuthor({ name: 'Donate' })
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          'Hey there! Thanks for considering to donate to me\nUse the button below to navigate where you want'
        )

      // Buttons
      let components = []
      components.push(
        new ButtonBuilder()
          .setLabel('Ko-fi')
          .setURL(DONATE_URL)
          .setStyle(ButtonStyle.Link)
      )

      components.push(
        new ButtonBuilder()
          .setLabel('Github Sponsors')
          .setURL(GITHUB_SPONSORS_URL)
          .setStyle(ButtonStyle.Link)
      )

      components.push(
        new ButtonBuilder()
          .setLabel('Patreon')
          .setURL(PATREON_URL)
          .setStyle(ButtonStyle.Link)
      )

      let buttonsRow = new ActionRowBuilder().addComponents(components)
      return interaction.followUp({ embeds: [embed], components: [buttonsRow] })
    }

    // Stats
    else if (sub === 'stats') {
      const response = botstats(interaction.client)
      return interaction.followUp(response)
    }

    // Uptime
    else if (sub === 'uptime') {
      await interaction.followUp(
        `My Uptime: \`${timeformat(process.uptime())}\``
      )
    }

    // Docs
    else if (sub === 'docs') {
      const embed = new EmbedBuilder()
        .setAuthor({ name: 'Documentation' })
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          'Hey there! Ah you want to know more about me? Or you are just lost? \nWell, Use the button below to see my documentation\n\nIf you are lost, you can also use the `help` command to see all my commands'
        )
        .setFooter({ text: 'Free Cookies!' })

      // Buttons
      let components = []
      components.push(
        new ButtonBuilder()
          .setLabel('Documentation')
          .setURL(DOCS_URL)
          .setStyle(ButtonStyle.Link)
      )

      let buttonsRow = new ActionRowBuilder().addComponents(components)
      return interaction.followUp({ embeds: [embed], components: [buttonsRow] })
    }

    // Ping
    else if (sub === 'ping') {
      const msg = await interaction.followUp('Pinging...')
      await msg.edit(
        `🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``
      )
    }

    // Changelog
    else if (sub === 'changelog') {
      try {
        const githubToken = process.env.GH_TOKEN
        const octokitModule = await import('@octokit/rest')
        const Octokit = octokitModule.Octokit
        const octokitOptions = githubToken ? { auth: githubToken } : {}

        const octokit = new Octokit(octokitOptions)
        const response = await octokit.repos.getContent({
          owner: process.env.GH_USERNAME,
          repo: process.env.GH_REPO,
          path: process.env.MINILOG_PATH,
        })

        const changelogContent = Buffer.from(
          response.data.content,
          'base64'
        ).toString('utf-8')

        // Reduce heading sizes in the changelog content
        const adjustedChangelogContent = changelogContent.replace(
          /#{1,6}/g,
          match => {
            // Adjust the heading size based on your preference, e.g., reduce by 1 level
            return '#' + match
          }
        )

        const embed = new EmbedBuilder()
          .setAuthor({ name: 'Behold, my Changelog!' })
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setDescription(
            `${adjustedChangelogContent}\n\n[View full changelog](${process.env.CHANGELOG_URL})`
          )

        return interaction.followUp({ embeds: [embed] })
      } catch (error) {
        console.error('Error fetching changelog:', error)
        return interaction.followUp(
          `Error fetching the changelog. Please try again later or view full changelog [here](${process.env.CHANGELOG_URL}).`
        )
      }
    }
  },
}

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Invite' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(
      'Hey there! Thanks for considering to invite me\nUse the button below to navigate where you want'
    )

  // Buttons
  let components = []
  components.push(
    new ButtonBuilder()
      .setLabel('Invite Link')
      .setURL(client.getInvite())
      .setStyle(ButtonStyle.Link)
  )

  if (SUPPORT_SERVER) {
    components.push(
      new ButtonBuilder()
        .setLabel('Support Server')
        .setURL(SUPPORT_SERVER)
        .setStyle(ButtonStyle.Link)
    )
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder()
        .setLabel('Dashboard Link')
        .setURL(DASHBOARD.baseURL)
        .setStyle(ButtonStyle.Link)
    )
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components)
  return { embeds: [embed], components: [buttonsRow] }
}
