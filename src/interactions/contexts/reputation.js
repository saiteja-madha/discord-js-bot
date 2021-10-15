const { ContextMenuInteraction, MessageEmbed } = require("discord.js");
const { BaseContext } = require("@src/structures");
const { getUser, increaseReputation } = require("@schemas/user-schema");
const { diffHours, getRemainingTime } = require("@utils/miscUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Reputation extends BaseContext {
  constructor(client) {
    super(client, {
      name: "reputation",
      description: "give reputation to a user",
      enabled: true,
      ephemeral: true,
      type: "USER",
    });
  }

  /**
   * @param {ContextMenuInteraction} interaction
   */
  async run(interaction) {
    const target = await interaction.client.users.fetch(interaction.targetId);

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
};
