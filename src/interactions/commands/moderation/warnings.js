const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed } = require("discord.js");
const { getWarnings, clearWarnings } = require("@schemas/modlog-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config");

module.exports = class Warnings extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "warnings",
      description: "warning commands",
      enabled: true,
      category: "MODERATION",
      userPermissions: ["KICK_MEMBERS"],
      options: [
        {
          name: "view",
          description: "view a members warnings",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the member whose warnings you want to see",
              type: "USER",
              required: true,
            },
          ],
        },
        {
          name: "clear",
          description: "clear warnings for a user",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the members whose warnings you want to clear",
              type: "USER",
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user");

    // view
    if (sub === "view") {
      const warnings = await getWarnings(interaction.guildId, target.id);
      if (!warnings?.length) return interaction.followUp(`No warnings for ${target.tag}`);
      let collector = "";
      warnings.forEach(
        (war, i) => (collector += `${EMOJIS.ARROW} **#${i + 1}:** ${war.reason || "No reason"} [By ${war.admin.tag}]`)
      );
      const embed = new MessageEmbed()
        .setAuthor(`Warnings for ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(collector);

      return interaction.followUp({ embeds: [embed] });
    }

    // clear
    else if (sub === "clear") {
      await clearWarnings(interaction.guildId, target.id);
      return interaction.followUp(`Cleared all warnings for ${target.tag}`);
    }
  }
};
