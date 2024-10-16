const fs = require('fs')
require('dotenv').config()

const updateReadme = () => {
  try {
    // Read the current README
    let readme = fs.readFileSync('README.md', 'utf8')

    // Get repository information from env
    const username = process.env.GH_USERNAME
    const repo = process.env.GH_REPO
    const supportServer = process.env.SUPPORT_SERVER

    // Update GitHub-related URLs
    readme = readme.replace(/github\.com\/[^/]+\/[^/\s)]+/g, match => {
      // Don't replace URLs in the badge definitions at the bottom
      if (match.includes('shield')) return match
      return `github.com/${username}/${repo}`
    })

    // Update Support Server link
    readme = readme.replace(
      /discord\.gg\/[a-zA-Z0-9]+/g,
      supportServer.replace('https://discord.gg/', '')
    )

    // Update badge URLs
    const badgeReplacements = {
      'version-url': `https://github.com/${username}/${repo}`,
      'pr-url': `https://github.com/${username}/${repo}/pulls`,
      'contributors-url': `https://github.com/${username}/${repo}/graphs/contributors`,
      'forks-url': `https://github.com/${username}/${repo}/network/members`,
      'stars-url': `https://github.com/${username}/${repo}/stargazers`,
      'issues-url': `https://github.com/${username}/${repo}/issues`,
      'license-url': `https://github.com/${username}/${repo}/blob/master/LICENSE`,
    }

    for (const [key, value] of Object.entries(badgeReplacements)) {
      readme = readme.replace(
        new RegExp(`\\[${key}\\]:.*`),
        `[${key}]: ${value}`
      )
    }

    // Write the updated README
    fs.writeFileSync('README.md', readme)
    console.log('README.md has been updated successfully!')
  } catch (error) {
    console.error('Error updating README:', error)
    process.exit(1)
  }
}

updateReadme()
