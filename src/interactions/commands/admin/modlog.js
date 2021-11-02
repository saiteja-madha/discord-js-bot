const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { canSendEmbeds } = require("@utils/guildUtils");
const { getSettings } = require("@schemas/guild-schema");

module.exports = class ModLog extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "modlog",
      description: "enable or disable moderation logs",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      options: [
        {
          name: "channel",
          description: "channels to send mod logs",
          required: false,
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    let targetChannel = interaction.options.getChannel("channel");

    if (targetChannel) {
      if (!canSendEmbeds(targetChannel))
        return interaction.followUp(
          "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel"
        );
    }

    const settings = await getSettings(interaction.guild);
    settings.modlog_channel = targetChannel?.id;
    await settings.save();
    await interaction.followUp(`Configuration saved! Modlog channel ${targetChannel ? "updated" : "removed"}`);
  }
};
