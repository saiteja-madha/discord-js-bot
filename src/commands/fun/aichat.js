const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, AICHAT } = require("@root/config.js");
const OpenAI = require("openai");
require("dotenv").config();

const apiKey = process.env.OPENAI;

const openai = new OpenAI({ apiKey });

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "aichat",
  description: "prompt for ChatGPT",
  category: "FUN",
  cooldown: 5,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "prompt",
        description: "prompt for ChatGPT",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  // This function runs when an interaction with option "prompt" is received
  async interactionRun(interaction) {
    // Create an EmbedBuilder object to format the response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("ChatAI")
      .setDescription("Answering...")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Requested by ${interaction.user.tag}` });
    try {
      // Get the value of option "prompt" from the interaction
      const prompt = interaction.options.getString("prompt");
      // Send an interaction with embed
      await interaction.followUp({ embeds: [embed] });
      // Run the function runCompletion with prompt and get the response from API
      const response = await runCompletion(prompt);
      embed.setDescription(response);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Log the error to console
      // Send an interaction with a message that there was an API error
      embed.setDescription(
        "API Error, try again or check if the API key is correct or the quota is full."
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

async function runCompletion(message) {
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error());
    }, 35000);
  });

  const completionPromise = await openai.createChatCompletion({
    model: AICHAT.MODEL,
    max_tokens: AICHAT.TOKENS,
    presence_penalty: AICHAT.PRESENCE_PENALTY,
    temperature: AICHAT.TEMPERATURE,
    messages: [
      { role: "system", content: AICHAT.IMAGINEMESSAGE },
      { role: "user", content: message },
    ],
  });
  try {
    const completion = await Promise.race([timeoutPromise, completionPromise]);
    return completion.data.choices[0].message.content;
  } catch (error) {
    throw error;
  }
}
