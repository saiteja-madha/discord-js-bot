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
    const response = await evaluate(input);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const input = interaction.options.getString("expression");
    const response = await evaluate(input);
    await interaction.followUp(response);
  }
};

async function evaluate(input) {
  const embed = new MessageEmbed();

  try {
    let output = eval(input);
    if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 });

    embed
      .setAuthor("📤 Output")
      .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
      .setColor("RANDOM")
      .setTimestamp(Date.now());
  } catch (err) {
    embed
      .setAuthor("📤 Error")
      .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
      .setColor(EMBED_COLORS.ERROR)
      .setTimestamp(Date.now());
  }

  return { embeds: [embed] };
}
