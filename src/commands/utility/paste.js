const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { postToBin } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "paste",
  description: "Paste something in sourceb.in",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "title",
        description: "title for your content",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "content",
        description: "content to be posted to bin",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const response = await paste(content, title);
    await interaction.followUp(response);
  },
};

async function paste(content, title) {
  const response = await postToBin(content, title);
  if (!response) return "❌ Something went wrong";

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Paste links" })
    .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

  return { embeds: [embed] };
}
