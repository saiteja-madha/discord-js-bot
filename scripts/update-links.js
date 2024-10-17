const fs = require('fs')
const path = require('path')
require('dotenv').config()

const updateLinks = (content, username, repo, supportServer) => {
  // Update GitHub-related URLs
  content = content.replace(/github\.com\/[^/]+\/[^/\s)]+/g, match => {
    // Don't replace URLs in the badge definitions at the bottom
    if (match.includes('shield')) return match
    return `github.com/${username}/${repo}`
  })

  // Update Support Server link
  content = content.replace(
    /https:\/\/discord\.gg\/[a-zA-Z0-9]+/g,
    supportServer
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
    content = content.replace(
      new RegExp(`\\[${key}\\]:.*`),
      `[${key}]: ${value}`
    )
  }

  return content
}

const updateFile = (filePath, username, repo, supportServer) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    content = updateLinks(content, username, repo, supportServer)
    fs.writeFileSync(filePath, content)
    console.log(`${filePath} has been updated successfully!`)
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error)
  }
}

const updateFiles = () => {
  try {
    const username = process.env.GH_USERNAME
    const repo = process.env.GH_REPO
    const supportServer = process.env.SUPPORT_SERVER

    // Update README.md
    updateFile('README.md', username, repo, supportServer)

    // Update files in ./docs folder
    const docsDir = './docs'
    fs.readdirSync(docsDir).forEach(file => {
      if (file.endsWith('.md')) {
        updateFile(path.join(docsDir, file), username, repo, supportServer)
      }
    })
  } catch (error) {
    console.error('Error updating files:', error)
    process.exit(1)
  }
}

updateFiles()
