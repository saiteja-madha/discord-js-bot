const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { getUser } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      description: "shows your current coin balance",
      cooldown: 5,
      command: {
        enabled: true,
        usage: "[@member|id]",
        aliases: ["bal"],
        category: "ECONOMY",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;

    const economy = await getUser(target.id);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(target.displayName)
      .setThumbnail(target.user.displayAvatarURL())
      .addField("Wallet", `${economy?.coins || 0}${EMOJIS.CURRENCY}`, true)
      .addField("Bank", `${economy?.bank || 0}${EMOJIS.CURRENCY}`, true)
      .addField("Net Worth", `${(economy?.coins || 0) + (economy?.bank || 0)}${EMOJIS.CURRENCY}`, true);

    message.channel.send({ embeds: [embed] });
  }
};
