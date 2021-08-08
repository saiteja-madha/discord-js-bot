const { Command, CommandContext } = require("@root/command");
const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.json");

module.exports = class FlipCoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "flipcoin",
      description: "flips a coin heads or tails",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const items = ["HEAD", "TAIL"];
    const toss = items[Math.floor(Math.random() * items.length)];

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setDescription(message.author.username + ", started a coin toss");

    message.channel
      .send({
        embeds: [embed],
      })
      .then((coin) => {
        setTimeout(() => {
          const newEmbed = new MessageEmbed().setDescription("The coin is in the air");
          coin.edit({ embeds: [newEmbed] }).catch((err) => {});
        }, 2000);
        setTimeout(() => {
          const newEmbed = new MessageEmbed()
            .setDescription(">> **" + toss + " Wins** <<")
            .setImage(toss === "HEAD" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");
          coin.edit({ embeds: [newEmbed] }).catch((err) => {});
        }, 2000);
      });
  }
};
