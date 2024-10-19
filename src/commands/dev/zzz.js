const {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const { EMBED_COLORS } = require('@root/config')
const { setDevCommands, setGlobalCommands } = require('@schemas/Dev')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'zzz',
  description: 'Toggle dev and global commands',
  category: 'DEV',
  botPermissions: ['EmbedLinks'],
  testGuildOnly: true,
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'type',
        description: 'Type of commands to toggle',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: 'Dev Commands',
            value: 'dev',
          },
          {
            name: 'Global Commands',
            value: 'global',
          },
        ],
      },
      {
        name: 'enabled',
        description: 'Enable or disable commands',
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const { client } = interaction

    const type = interaction.options.getString('type')
    const enabled = interaction.options.getBoolean('enabled')

    // Update database state based on type
    if (type === 'dev') {
      await setDevCommands(enabled)
    } else {
      await setGlobalCommands(enabled)
    }

    // Register/Unregister commands in test guild
    const testGuild = client.guilds.cache.get(process.env.TEST_GUILD_ID)
    if (testGuild) {
      try {
        const commandsToSet = client.slashCommands
          .filter(cmd => {
            if (type === 'dev') {
              return cmd.testGuildOnly || (cmd.devOnly && enabled)
            } else {
              // For global commands, only include non-dev, non-test commands when enabled
              return !cmd.testGuildOnly && !cmd.devOnly && enabled
            }
          })
          .map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            type: ApplicationCommandType.ChatInput,
            options: cmd.slashCommand.options,
          }))

        if (type === 'dev') {
          await testGuild.commands.set(commandsToSet)
        } else {
          // For global commands, update application commands
          await client.application.commands.set(enabled ? commandsToSet : [])
        }

        client.logger.success(
          `Updated ${type} commands. ${enabled ? 'Enabled' : 'Disabled'} ${type} commands.`
        )
      } catch (error) {
        client.logger.error(
          `Failed to update ${type} commands: ${error.message}`
        )
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setDescription(
                `Failed to update ${type} commands. Check bot logs for details.`
              ),
          ],
        })
      }
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(
        `✅ ${type === 'dev' ? 'Dev' : 'Global'} commands are now ${
          enabled ? 'enabled' : 'disabled'
        }!\n` + `Current state: \`${enabled ? 'ENABLED' : 'DISABLED'}\``
      )

    return interaction.followUp({ embeds: [embed] })
  },
}
