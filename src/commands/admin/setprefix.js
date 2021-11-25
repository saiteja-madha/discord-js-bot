const { Command } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
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
   */
  async messageRun(message, args) {
    const newPrefix = args[0];
    const response = await setNewPrefix(message.guild, newPrefix);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = await setNewPrefix(interaction.guild, interaction.options.getString("newprefix"));
    await interaction.followUp(response);
  }
};

async function setNewPrefix(guild, newPrefix) {
  if (newPrefix.length > 2) return "Prefix length cannot exceed `2` characters";
  const settings = await getSettings(guild);
  settings.prefix = newPrefix;
  await settings.save();

  return `New prefix is set to \`${newPrefix}\``;
}
