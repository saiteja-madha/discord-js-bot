const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config");

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
            name: "input",
            description: "content to eval",
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

    if (!input) return message.reply("Please provide code to eval");
    if (input.toLowerCase().includes("token")) return message.reply("Don't try to hack me!");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const input = interaction.options.getString("expression");
    if (input.toLowerCase().includes("token")) return interaction.followUp("Don't try to hack me!");

    let response;
    try {
      const output = eval(input);
      response = buildSuccessResponse(output);
    } catch (ex) {
      response = buildErrorResponse(ex);
    }
    await interaction.followUp(response);
  }
};

const buildSuccessResponse = (output) => {
  const embed = new MessageEmbed();
  if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 });

  embed
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
