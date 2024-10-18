const { ApplicationCommandOptionType } = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const { EMBED_COLORS } = require('@root/config')
const { Model } = require('@schemas/Dev')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'zzz',
  description: 'Toggle dev commands on/off',
  category: 'DEV',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'enabled',
        description: 'Enable or disable test guild commands',
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const { client } = interaction

    const enabled = interaction.options.getBoolean('enabled')

    // Update database state
    const document = await Model.findOne()
    if (!document) await Model.create({ DEV_COMMANDS: { ENABLED: enabled } })
    else {
      document.DEV_COMMANDS.ENABLED = enabled
      await document.save()
    }

    // Register/Unregister commands in test guild
    const testGuild = client.guilds.cache.get(process.env.TEST_GUILD_ID)
    if (testGuild) {
      try {
        if (enabled) {
          // Register test guild commands
          const testGuildCommands = client.slashCommands
            .filter(cmd => cmd.testGuildOnly)
            .map(cmd => ({
              name: cmd.name,
              description: cmd.description,
              type: ApplicationCommandOptionType.ChatInput,
              options: cmd.slashCommand.options,
            }))

          await testGuild.commands.set([
            ...testGuild.commands.cache
              .filter(
                cmd =>
                  !client.slashCommands.find(
                    c => c.testGuildOnly && c.name === cmd.name
                  )
              )
              .map(cmd => ({
                name: cmd.name,
                description: cmd.description,
                options: cmd.options,
                type: cmd.type,
              })),
            ...testGuildCommands,
          ])
        } else {
          // Remove test guild commands
          const commandsToKeep = testGuild.commands.cache
            .filter(
              cmd =>
                !client.slashCommands.find(
                  c => c.testGuildOnly && c.name === cmd.name
                )
            )
            .map(cmd => ({
              name: cmd.name,
              description: cmd.description,
              options: cmd.options,
              type: cmd.type,
            }))

          await testGuild.commands.set(commandsToKeep)
        }
      } catch (error) {
        client.logger.error(
          `Failed to update test guild commands: ${error.message}`
        )
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLORS.ERROR)
              .setDescription(
                'Failed to update test guild commands. Check bot logs for details.'
              ),
          ],
        })
      }
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(
        `✅ Test guild commands are now ${enabled ? 'enabled' : 'disabled'}!\n` +
          `Current state: \`${enabled ? 'ENABLED' : 'DISABLED'}\``
      )

    return interaction.followUp({ embeds: [embed] })
  },
}

