const { getTop100 } = require("@schemas/profile-schema");
const { Command } = require("@src/structures");
const { Message, MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");

module.exports = class LeaderBoard extends Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      description: "display the XP leaderboard",
      command: {
        enabled: true,
        aliases: ["lb"],
        category: "INFORMATION",
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const settings = await getSettings(message.guild);
    if (!settings.ranking.enabled) return message.channel.send("Ranking is disabled on this server");

    const top100 = await getTop100(message.guildId);
    if (top100.length === 0) return message.channel.send("No users in the leaderboard");

    const lb = top100.splice(0, top100.length > 10 ? 9 : top100.length);

    let collector = "";
    await lb.forEach(async (doc, i) => {
      try {
        const user = await message.client.users.fetch(doc.member_id);
        collector += `**#${(i + 1).toString()}** - ${user.tag}\n`;
      } catch (ex) {
        // Ignore
      }
    });

    const embed = new MessageEmbed()
      .setAuthor("XP Leaderboard")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(collector)
      .setFooter(`Requested by ${message.author.tag}`);

    message.channel.send({ embeds: [embed] });
  }
};
