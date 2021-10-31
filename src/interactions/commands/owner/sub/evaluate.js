const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (input) => {
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

  return embed;
};
