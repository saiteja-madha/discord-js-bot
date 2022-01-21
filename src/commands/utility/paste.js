const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { postToBin } = require("@utils/httpUtils");

module.exports = class PasteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "paste",
      description: "Paste something in sourceb.in",
      cooldown: 5,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        minArgsCount: 2,
        usage: "<title> <content>",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "title",
            description: "title for your content",
            required: true,
            type: "STRING",
          },
          {
            name: "content",
            description: "content to be posted to bin",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const title = args.shift();
    const content = args.join(" ");
    const response = await paste(content, title);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const response = await paste(content, title);
    await interaction.followUp(response);
  }
};

async function paste(content, title) {
  const response = await postToBin(content, title);
  if (!response) return "❌ Something went wrong";

  const embed = new MessageEmbed()
    .setAuthor({ name: "Paste links" })
    .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

  return { embeds: [embed] };
}
