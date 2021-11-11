const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (user) => {
  const x64 = user.displayAvatarURL({ format: "png", dynamic: true, size: 64 });
  const x128 = user.displayAvatarURL({ format: "png", dynamic: true, size: 128 });
  const x256 = user.displayAvatarURL({ format: "png", dynamic: true, size: 256 });
  const x512 = user.displayAvatarURL({ format: "png", dynamic: true, size: 512 });
  const x1024 = user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 });
  const x2048 = user.displayAvatarURL({ format: "png", dynamic: true, size: 2048 });

  const embed = new MessageEmbed()
    .setTitle(`Avatar of ${user.username}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(x256)
    .setDescription(
      `Links: • [x64](${x64}) ` +
        `• [x128](${x128}) ` +
        `• [x256](${x256}) ` +
        `• [x512](${x512}) ` +
        `• [x1024](${x1024}) ` +
        `• [x2048](${x2048}) `
    );

  return {
    embeds: [embed],
  };
};
