const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EMBED_COLORS, MUSIC } = require("@root/config");
const MODEL_NAME = "gemini-pro";


/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "gemini",
  description: "talk with gemini",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "Text",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "text",
        description: "the text for gemini",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await play(message, query);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("text");
    const response = await play(interaction, query);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function play({ member, guild, channel }, query) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result  = await model.generateContent(query);

    const reply = result.response.text();
    const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(query)
    .setDescription(reply)
    .setFooter({ text: `Request By: ${member.user.username}` });
    

  return { embeds: [embed] };



}
