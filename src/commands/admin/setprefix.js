const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class SetPrefix extends Command {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "sets a new prefix for this server",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        usage: "<new-prefix>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "newprefix",
            description: "the new prefix to set",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const newPrefix = args[0];
    const response = await setNewPrefix(newPrefix, data.settings);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const response = await setNewPrefix(interaction.options.getString("newprefix"), data.settings);
    await interaction.followUp(response);
  }
};

async function setNewPrefix(newPrefix, settings) {
  if (newPrefix.length > 2) return "Prefix length cannot exceed `2` characters";
  settings.prefix = newPrefix;
  await settings.save();

  return `New prefix is set to \`${newPrefix}\``;
}
