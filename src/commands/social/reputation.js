const { Command } = require("@src/structures");
const { resolveMember } = require("@utils/guildUtils");
const { getUser, increaseReputation } = require("@schemas/user-schema");
const { MessageEmbed } = require("discord.js");
const { diffHours, getRemainingTime } = require("@utils/miscUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Reputation extends Command {
  constructor(client) {
    super(client, {
      name: "rep",
      description: "give reputation to a user",
      command: {
        enabled: true,
        aliases: ["reputation"],
        usage: "<@member|id>",
        minArgsCount: 1,
        category: "SOCIAL",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { author } = message;
    const target = await resolveMember(message, args[0]);

    if (!target) return message.reply(`No user found matching ${args[0]}`);
    if (target.user.bot) return message.reply("You cannot give reputation to bots");
    if (target.id === author.id) return message.reply("You cannot give reputation to yourself");

    const user = await getUser(author.id);
    if (user && user.reputation.timestamp) {
      const lastRep = new Date(user.reputation.timestamp);
      const diff = diffHours(new Date(), lastRep);
      if (diff < 24) {
        const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
        return message.reply(`You can again run this command in \`${getRemainingTime(nextUsage)}\``);
      }
    }
    await increaseReputation(author.id, target.id);
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`${target.toString()} +1 Rep!`)
      .setFooter(`By ${message.author.tag}`)
      .setTimestamp(Date.now());

    message.channel.send({ embeds: [embed] });
  }
};
