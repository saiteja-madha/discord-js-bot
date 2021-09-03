const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const Ascii = require("ascii-table");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

module.exports = class AutoModStatus extends Command {
  constructor(client) {
    super(client, {
      name: "automodstatus",
      description: "check automod configuration for this guild",
      command: {
        enabled: true,
        category: "AUTOMOD",
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const settings = (await getSettings(message.guild)).automod;

    const table = new Ascii("").setHeading("Feature", "Status");
    const logChannel = settings?.log_channel
      ? message.guild.channels.cache.get(settings.log_channel).toString()
      : "Not Configured";

    table
      .addRow("Max Lines", settings?.max_lines || "NA")
      .addRow("Max Mentions", settings?.max_mentions || "NA")
      .addRow("Max Role Mentions", settings?.max_role_mentions || "NA")
      .addRow("AntiLinks", settings?.anti_links ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiInvites", settings?.anti_invites ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiGhostPing", settings?.anti_ghostping ? EMOJIS.TICK : EMOJIS.X_MARK);

    const embed = new MessageEmbed()
      .setAuthor("Automod Status")
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setDescription(`**Log Channel:** ${logChannel}\n\n\`\`\`${table.toString()}\`\`\``);

    message.channel.send({ embeds: [embed] });
  }
};
