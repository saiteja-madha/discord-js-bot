const { MessageEmbed } = require("discord.js");

module.exports = (input) => {
  const embed = new MessageEmbed();

  try {
    let output = eval(input);
    if (typeof output !== "string") output = require("util").inspect(output, { depth: 0 });

    embed
      .addField("📥 Input", `\`\`\`js\n${input.length > 1024 ? "Too large to display." : input}\`\`\``)
      .addField("📤 Output", `\`\`\`js\n${output.length > 1024 ? "Too large to display." : output}\`\`\``)
      .setColor("RANDOM");
  } catch (err) {
    embed
      .addField("📥 Input", `\`\`\`js\n${input.length > 1024 ? "Too large to display." : input}\`\`\``)
      .addField("📤 Output", `\`\`\`js\n${err.length > 1024 ? "Too large to display." : err}\`\`\``)
      .setColor("ORANGE");
  }

  return embed;
};
