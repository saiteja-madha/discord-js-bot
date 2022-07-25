const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import('@structures/BaseContext')}
 */
module.exports = {
  name: "avatar",
  description: "displays avatar information about the user",
  type: "USER",
  enabled: true,
  ephemeral: true,

  async run(interaction) {
    const user = await interaction.client.users.fetch(interaction.targetId);
    const response = getAvatar(user);
    await interaction.followUp(response);
  },
};

function getAvatar(user) {
  const x64 = user.displayAvatarURL({ format: "png", dynamic: true, size: 64 });
  const x128 = user.displayAvatarURL({ format: "png", dynamic: true, size: 128 });
  const x256 = user.displayAvatarURL({ format: "png", dynamic: true, size: 256 });
  const x512 = user.displayAvatarURL({ format: "png", dynamic: true, size: 512 });
  const x1024 = user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 });
  const x2048 = user.displayAvatarURL({ format: "png", dynamic: true, size: 2048 });

  const embed = new EmbedBuilder()
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
}
