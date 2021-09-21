const fetch = require("node-fetch");
const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "paste",
      description: "Paste something in sourceb.in",
      cooldown: 5,
      command: {
        enabled: true,
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
    if (!args || args.length < 3) return message.channel.send("You need to add title, description and content");

    const { key } = await fetch("https://sourceb.in/api/bins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: args[0], description: args[1], files: [{ content: args.splice(2).join(" ") }] }),
    }).then((res) => res.json());

    if (!key) return message.channel.send("❌ Something went wrong");

    const embed = new MessageEmbed()
      .setTitle("Paste links")
      .setDescription("🔸 Normal: https://sourceb.in/" + key + "\n🔹 Raw: https://cdn.sourceb.in/bins/" + key + "/0");
    message.channel.send({ embeds: [embed] });
  }
};
