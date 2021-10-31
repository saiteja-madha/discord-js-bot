const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/guild-schema");
const { getTop100 } = require("@schemas/profile-schema");

module.exports = class LeaderBoard extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      description: "display the XP leaderboard",
      enabled: true,
      category: "INFORMATION",
      options: [
        {
          name: "type",
          description: "leaderboard type",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "xp",
              value: "xp",
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
    const type = interaction.options.getString("type");
    if (type !== "xp") return;

    const { guild, user } = interaction;
    const settings = await getSettings(guild);
    if (!settings.ranking.enabled) return interaction.followUp("Ranking is disabled on this server");

    const top100 = await getTop100(guild.id);
    if (top100.length === 0) return interaction.followUp("No users in the leaderboard");

    const lb = top100.splice(0, top100.length > 10 ? 9 : top100.length);

    let collector = "";
    await lb.forEach(async (doc, i) => {
      try {
        const user = await guild.client.users.fetch(doc.member_id);
        collector += `**#${(i + 1).toString()}** - ${user.tag}\n`;
      } catch (ex) {
        // Ignore
      }
    });

    const embed = new MessageEmbed()
      .setAuthor("XP Leaderboard")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(collector)
      .setFooter(`Requested by ${user.tag}`);

    await interaction.followUp({ embeds: [embed] });
  }
};
