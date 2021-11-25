const { Command } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class XPSystem extends Command {
  constructor(client) {
    super(client, {
      name: "xpsystem",
      description: "enable or disable XP ranking system in the server",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        aliases: ["xpsystem", "xptracking"],
        usage: "<on|off>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "status",
            description: "enabled or disabled",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
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
    const input = args[0].toLowerCase();
    if (!["on", "off"].includes(input)) return message.reply("Invalid status. Value must be `on/off`");
    const response = await setStatus(message.guild, input);
    return message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = await setStatus(interaction.guild, interaction.options.getString("status"));
    await interaction.followUp(response);
  }
};

async function setStatus(guild, input) {
  const status = input.toLowerCase() === "on" ? true : false;

  const settings = await getSettings(guild);
  settings.ranking.enabled = status;
  await settings.save();

  return `Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`;
}
