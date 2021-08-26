const { Command, CommandContext } = require("@src/structures");
const { resolveMember } = require("@utils/guildUtils");
const { getUser, increaseReputation } = require("@schemas/user-schema");
const { MessageEmbed } = require("discord.js");
const { diff_hours, getRemainingTime } = require("@utils/miscUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Reputation extends Command {
  constructor(client) {
    super(client, {
      name: "rep",
      description: "give reputation to a user",
      usage: "<@member|id>",
      minArgsCount: 1,
      aliases: ["reputation"],
      category: "SOCIAL",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { author } = message;
    const target = await resolveMember(message, args[0]);

    if (!target) return message.reply(`No user found matching ${args[0]}`);
    if (target.user.bot) return ctx.reply(`You cannot give reputation to bots`);
    if (target.id === author.id) return ctx.reply(`You cannot give reputation to yourself`);

    try {
      const user = await getUser(author.id);
      if (user && user.reputation.timestamp) {
        const lastRep = new Date(user.reputation.timestamp);
        const diff = diff_hours(new Date(), lastRep);
        if (diff < 24) {
          const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
          return ctx.reply("You can again run this command in `" + getRemainingTime(nextUsage) + "`");
        }
      }
      await increaseReputation(author.id, target.id);
      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(target.toString() + " +1 Rep!")
        .setFooter(`By ${ctx.message.author.tag}`)
        .setTimestamp(Date.now());

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      ctx.reply(`Failed to give reputation to \`${target.user.tag}\``);
    }
  }
};
