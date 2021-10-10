const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { postToBin } = require("@utils/httpUtils");

module.exports = class PasteCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "paste",
      description: "Paste something in sourceb.in",
      enabled: true,
      cooldown: 10,
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");

    const response = await postToBin(content, title);
    if (!response) return interaction.followUp("❌ Something went wrong");

    const embed = new MessageEmbed()
      .setAuthor("Paste links")
      .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

    interaction.followUp({ embeds: [embed] });
  }
};
