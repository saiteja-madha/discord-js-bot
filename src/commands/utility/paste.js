const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { postToBin } = require("@utils/httpUtils");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "paste",
      description: "Paste something in sourceb.in",
      cooldown: 5,
      command: {
        enabled: true,
        minArgsCount: 2,
        usage: "<title> <content>",
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = await postToBin(args.splice(1).join(" "), args[0]);
    if (!response) return message.channel.send("❌ Something went wrong");

    const embed = new MessageEmbed()
      .setTitle("Paste links")
      .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

    message.channel.send({ embeds: [embed] });
  }
};
