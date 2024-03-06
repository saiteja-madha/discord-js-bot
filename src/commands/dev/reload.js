const { EmbedBuilder } = require('discord.js')
const { BotClient } = require('@src/structures')
/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: 'reload',
  description: "Reloads a command that's been modified",
  category: 'DEV',
  botPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: '[reload]',
  },
  slashCommand: {
    enabled: false,
  },
  async messageRun(message, args) {
    const client = new BotClient()

    try {
      switch (args[0]?.toLowerCase()) {
        case 'commands':
          {
            client.loadCommands('src/commands')
          }
          break
        case 'events':
          {
            client.loadEvents('src/events')
          }
          break
        case 'contexts':
          {
            client.loadContexts('src/contexts')
          }
          break
        case 'all':
          {
            client.loadCommands('src/commands')
            client.loadContexts('src/contexts')
            client.loadEvents('src/events')
          }
          break
        default:
          const embed = new EmbedBuilder()
          embed.setTitle('error')
          embed.setDescription(`command not selected`)
          embed.setColor('Red')
          message.reply({ embeds: [embed] })
          return
      }
    } catch (e) {
      console.log(e)
    }
    const embed = new EmbedBuilder()
    embed.setTitle('Reloaded')
    embed.setDescription(`Reloaded ${args[0]}`)
    embed.setColor('Green')
    message.reply({ embeds: [embed] })
  },
}
