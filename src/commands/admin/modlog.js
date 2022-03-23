const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { canSendEmbeds } = require("@utils/guildUtils");

module.exports = class ModLog extends Command {
  constructor(client) {
    super(client, {
      name: "modlog",
      description: "enable or disable moderation logs",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        usage: "<#channel|off>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "channel",
            description: "channels to send mod logs",
            required: false,
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
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
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("Incorrect command usage");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    return interaction.followUp(response);
  }
};

async function setChannel(targetChannel, settings) {
  if (targetChannel) {
    if (!canSendEmbeds(targetChannel))
      return "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `Configuration saved! Modlog channel ${targetChannel ? "updated" : "removed"}`;
}
