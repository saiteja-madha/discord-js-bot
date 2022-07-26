const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "eval",
  description: "evaluates something",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<script>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
    options: [
      {
        name: "expression",
        description: "content to evaluate",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const input = args.join(" ");

    if (!input) return message.safeReply("Please provide code to eval");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output, message.client);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const input = interaction.options.getString("expression");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output, interaction.client);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await interaction.followUp(response);
  },
};

const buildSuccessResponse = (output, client) => {
  // Token protection
  output = require("util").inspect(output, { depth: 0 }).replaceAll(client.token, DUMMY_TOKEN);

  const embed = new EmbedBuilder()
    .setAuthor({ name: "📤 Output" })
    .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
    .setColor("Random")
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};

const buildErrorResponse = (err) => {
  const embed = new EmbedBuilder();
  embed
    .setAuthor({ name: "📤 Error" })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
