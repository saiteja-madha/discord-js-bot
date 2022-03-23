const { Command } = require("@src/structures");
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
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["on", "off"].includes(input)) return message.safeReply("Invalid status. Value must be `on/off`");
    const response = await setStatus(input, data.settings);
    return message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const response = await setStatus(interaction.options.getString("status"), data.settings);
    await interaction.followUp(response);
  }
};

async function setStatus(input, settings) {
  const status = input.toLowerCase() === "on" ? true : false;

  settings.ranking.enabled = status;
  await settings.save();

  return `Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`;
}
