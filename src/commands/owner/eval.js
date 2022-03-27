const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config");

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET";

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "evaluates something",
      category: "OWNER",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "<script>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "expression",
            description: "content to evaluate",
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
  }

  /**
   * @param {CommandInteraction} interaction
   */
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
  }
};

const buildSuccessResponse = (output, client) => {
  // Token protection
  output = require("util").inspect(output, { depth: 0 }).replaceAll(client.token, DUMMY_TOKEN);

  const embed = new MessageEmbed()
    .setAuthor({ name: "📤 Output" })
    .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
    .setColor("RANDOM")
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};

const buildErrorResponse = (err) => {
  const embed = new MessageEmbed();
  embed
    .setAuthor({ name: "📤 Error" })
    .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
