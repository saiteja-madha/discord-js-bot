const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class FlagTranslation extends Command {
  constructor(client) {
    super(client, {
      name: "flagtranslation",
      description: "configure flag translation in the server",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        aliases: ["flagtr"],
        minArgsCount: 1,
        usage: "<on|off>",
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
    const status = args[0].toLowerCase();
    if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");

    const response = await setFlagTranslation(status, data.settings);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const response = await setFlagTranslation(interaction.options.getString("status"), data.settings);
    await interaction.followUp(response);
  }
};

async function setFlagTranslation(input, settings) {
  const status = input.toLowerCase() === "on" ? true : false;

  settings.flag_translation.enabled = status;
  await settings.save();

  return `Configuration saved! Flag translation is now ${status ? "enabled" : "disabled"}`;
}
