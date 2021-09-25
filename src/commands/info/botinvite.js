const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { BOT_INVITE, SUPPORT_SERVER, DASH_URL, EMBED_COLORS } = require("@root/config.js");

module.exports = class BotInviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invite",
      description: "get the bot's invite",
      command: {
        enabled: true,
        category: "INFORMATION",
        aliases: ["dashboard", "support", "dash", "inv"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    let desc = "";
    desc += `Support Server: [Join here](${SUPPORT_SERVER})\n`;
    desc += `Invite Link: [Add me here](${BOT_INVITE})\n`;
    desc += `Dashboard Link: [View My Dashboard Here!](${DASH_URL})`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Wew! I made it threw the ~waves~")
      .setDescription(desc);

    try {
      await message.author.send({ embeds: [embed] });
      message.reply("Check your DM for my information! :envelope_with_arrow:");
    } catch (ex) {
      console.log(ex);
      message.reply("I cannot send you my information! Is your DM open?");
    }
  }
};
