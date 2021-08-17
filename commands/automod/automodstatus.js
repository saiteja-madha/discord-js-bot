const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { getSettings } = require("@schemas/settings-schema");
const ascii = require("ascii-table");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

module.exports = class AutoModStatus extends Command {
  constructor(client) {
    super(client, {
      name: "automodstatus",
      description: "check automod configuration for this guild",
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { guild } = ctx;
    const settings = (await getSettings(guild.id)).automod;

    let table = new ascii("Automod Status");
    table.setHeading("Feature", "Status");

    const logChannel = settings.log_channel ? guild.channels.cache.get(settings.log_channel).name : "Not Configured";

    table
      .addRow("Max Lines", settings.max_lines || "NA")
      .addRow("Max Mentions", settings.max_mentions || "NA")
      .addRow("Max Role Mentions", settings.max_role_mentions || "NA")
      .addRow("AntiLinks", settings.anti_links ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiInvites", settings.anti_invites ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiGhostPing", settings.anti_ghostping ? EMOJIS.TICK : EMOJIS.X_MARK);

    const embed = new MessageEmbed()
      .setAuthor("Automod Status")
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setDescription("**Log Channel:** " + logChannel + "```" + table.toString() + "```");

    ctx.reply({ embeds: [embed] });
  }
};
