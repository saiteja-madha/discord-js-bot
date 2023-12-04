const { EmbedBuilder } = require('discord.js')
const { Octokit } = require('@octokit/rest')

// Check if the GITHUB_TOKEN is defined
const useAuthentication = process.env.GITHUB_TOKEN !== undefined

// Use GITHUB_TOKEN for authentication if defined
const octokit = new Octokit({
  auth: useAuthentication ? process.env.GITHUB_TOKEN : undefined,
})

module.exports = {
  name: 'updates',
  description: "get Mochi's latest updates",
  category: 'INFORMATION',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
  },
  async interactionRun(interaction) {
    try {
      const response = await octokit.repos.getContent({
        owner: 'vixshan',
        repo: 'mochi',
        path: 'CHANGELOG.md',
      })

      const changelogContent = Buffer.from(
        response.data.content,
        'base64'
      ).toString('utf-8')
      const latestVersion = getLatestVersion(changelogContent)

      if (!latestVersion) {
        return interaction.followUp('No updates found.')
      }

      const embed = new EmbedBuilder()
        .setTitle(`Mochi Update - ${latestVersion}`)
        .setDescription('Changelog')
        .addFields(parseChangelog(changelogContent, latestVersion))
        .setColor('#F06292') // Cute pink color
        .setImage(
          'https://cdn.discordapp.com/attachments/1114182026334044160/1136620054973251634/Adagaki.gif'
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.avatarURL(),
        })

      await interaction.followUp({ embeds: [embed] })
    } catch (error) {
      console.error('Error fetching updates:', error)
      return interaction.followUp(
        'Error fetching the updates. Please try again later.'
      )
    }
  },
}

function getLatestVersion(changelog) {
  const versionRegex = /^#\s*(Mochi v\d+\.\d+\.\d+)/m
  const match = versionRegex.exec(changelog)
  return match ? match[1] : null
}

function parseChangelog(changelog, version) {
  const sectionRegex =
    /^(##\s*(New|Fixes & Improvements|Developer Notes))([\s\S]*?)(?=(?:^##|\z))/gm
  let fields = []

  changelog.replace(sectionRegex, (_, sectionTitle, sectionContent) => {
    fields.push({
      name: sectionTitle,
      value: sectionContent.trim(),
    })
  })

  return fields
}
