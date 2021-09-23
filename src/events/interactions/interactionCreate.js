const { Interaction } = require("discord.js");
const { BotClient } = require("@src/structures");
const { timeformat } = require("@utils/miscUtils");

/**
 * @param {BotClient} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  // Slash Command
  if (interaction.isCommand()) {
    if (!client.slashCommands.has(interaction.commandName)) {
      return interaction.reply("An error has occurred").catch(() => {});
    }

    // get the slash command
    const command = client.slashCommands.get(interaction.commandName);

    // Permission check
    if (!interaction.member.permissions.has(command.slashCommand.userPermissions || [])) {
      interaction.reply({
        content: `You do not have enough permissions to use this command`,
        ephemeral: true,
      });
    }

    // cooldown check
    if (command.cooldown > 0) {
      const remaining = command.getRemainingCooldown(interaction.member.id);
      if (remaining > 0)
        return interaction
          .reply({
            content: `You are on cooldown. You can use the command after ${timeformat(remaining)}`,
            ephemeral: true,
          })
          .catch(() => {});
    }

    // defer the reply
    await interaction.deferReply({ ephemeral: command.slashCommand.ephemeral }).catch(() => {});

    // Run the event
    try {
      await command.interactionRun(interaction, interaction.options);
      command.applyCooldown(interaction.user.id);
    } catch {
      interaction.deferReply("Oops! An error occurred while running the command");
    }
  }

  // Context Menu
  else if (interaction.isContextMenu()) {
    if (!client.contextMenus.has(interaction.commandName)) {
      return interaction.reply("An error has occurred").catch(() => {});
    }

    // get the context menu
    const command = client.contextMenus.get(interaction.commandName);

    // Permission check
    if (!interaction.member.permissions.has(command.contextMenu.userPermissions || [])) {
      return interaction.reply({
        content: `You do not have enough permissions to use this command`,
        ephemeral: true,
      });
    }

    // cooldown check
    if (command.cooldown > 0) {
      const remaining = command.getRemainingCooldown(interaction.user.id);
      if (remaining > 0)
        return interaction
          .reply({
            content: `You are on cooldown. You can use the command after ${timeformat(remaining)}`,
            ephemeral: true,
          })
          .catch(() => {});
    }

    // defer the reply
    await interaction.deferReply({ ephemeral: command.contextMenu.ephemeral }).catch(() => {});

    // Run the event
    try {
      await command.contextRun(interaction, interaction.options);
      command.applyCooldown(interaction.user.id);
    } catch {
      interaction.deferReply("Oops! An error occurred while running the command");
    }
  }
};
