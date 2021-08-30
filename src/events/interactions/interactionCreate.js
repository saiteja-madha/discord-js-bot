const { Interaction } = require("discord.js");
const { BotClient } = require("@src/structures");

/**
 * @param {BotClient} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    if (!client.slashCommands.has(interaction.commandName)) {
      return interaction.reply({ content: "An error has occurred" }).catch(() => {});
    }

    // get the slash command
    const command = client.slashCommands.get(interaction.commandName);

    // defer the reply
    await interaction.deferReply({ ephemeral: command.slashCommand.ephemeral }).catch(() => {});

    //TODO: Cooldown check

    // Run the event
    await command.interactionRun(interaction, interaction.options);
  }
};
