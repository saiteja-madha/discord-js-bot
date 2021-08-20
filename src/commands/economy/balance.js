const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { getMember } = require("@utils/botUtils");

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      usage: "[@member|id]",
      description: "shows your current coin balance",
      aliases: ["bal"],
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = (await getMember(message, args[0])) || message.member;

    const economy = await getUser(target.id);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(target.displayName, target.user.displayAvatarURL())
      .setDescription(`**Coin balance:** ${economy?.coins || 0}${EMOJIS.CURRENCY}`);

    ctx.reply({ embeds: [embed] });
  }
};
