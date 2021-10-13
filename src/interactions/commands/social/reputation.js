const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getUser, increaseReputation } = require("@schemas/user-schema");
const { diffHours, getRemainingTime } = require("@utils/miscUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Reputation extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "rep",
      description: "reputation commands",
      enabled: true,
      category: "SOCIAL",
      options: [
        {
          name: "count",
          description: "check reputation for a user",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to check reputation for",
              type: "USER",
              required: false,
            },
          ],
        },
        {
          name: "give",
          description: "give reputation to a user",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to check reputation for",
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

    // status
    if (sub === "count") {
      const target = interaction.options.getUser("user") || interaction.user;
      const userData = await getUser(target.id);

      if (!userData) return interaction.followUp(`${target.tag} has no reputation yet`);

      const embed = new MessageEmbed()
        .setAuthor(`Reputation for ${target.username}`)
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(target.displayAvatarURL())
        .addField("Given", userData.reputation?.given.toString(), true)
        .addField("Received", userData.reputation?.received.toString(), true);

      return interaction.followUp({ embeds: [embed] });
    }

    // give
    else if (sub === "give") {
      const target = interaction.options.getUser("user");

      if (target.bot) return interaction.followUp("You cannot give reputation to bots");
      if (target.id === interaction.user.id) return interaction.followUp("You cannot give reputation to yourself");

      const userData = await getUser(interaction.user.id);
      if (userData && userData.reputation.timestamp) {
        const lastRep = new Date(userData.reputation.timestamp);
        const diff = diffHours(new Date(), lastRep);
        if (diff < 24) {
          const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
          return interaction.followUp(`You can again run this command in \`${getRemainingTime(nextUsage)}\``);
        }
      }

      await increaseReputation(interaction.user.id, target.id);
      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(`${target.toString()} +1 Rep!`)
        .setFooter(`By ${interaction.user.tag}`)
        .setTimestamp(Date.now());

      return interaction.followUp({ embeds: [embed] });
    }
  }
};
