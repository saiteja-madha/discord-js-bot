const { Command, CommandContext } = require("@root/structures");
const { increaseReputation } = require("@schemas/profile-schema");
const { MessageEmbed } = require("discord.js");

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
    const target = await getMember(message, args[0]);

    if (!target) return message.reply(`No user found matching ${args[0]}`);
    if (target.user.bot) return ctx.reply(`You cannot give reputation to bots`);
    if (target.id === author.id) return ctx.reply(`You cannot give reputation to yourself`);

    try {
      await increaseReputation(message.channel.guild.id, author.id, target.id);
      const embed = new MessageEmbed()
        .setAuthor(author.username, author.displayAvatarURL())
        .setDescription(target.toString() + " +1 Rep!");

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      ctx.reply(`Failed to give reputation to \`${target.user.tag}\``);
    }
  }
};
