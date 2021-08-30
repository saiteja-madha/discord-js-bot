const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "displays avatar information about the user",
      command: {
        enabled: true,
        usage: "[@member|id]",
        category: "INFORMATION",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const { user } = target;

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
        `Links: ${EMOJIS.CIRCLE_BULLET} [x64](${x64}) ` +
          `${EMOJIS.CIRCLE_BULLET} [x128](${x128}) ` +
          `${EMOJIS.CIRCLE_BULLET} [x256](${x256}) ` +
          `${EMOJIS.CIRCLE_BULLET} [x512](${x512}) ` +
          `${EMOJIS.CIRCLE_BULLET} [x1024](${x1024}) ` +
          `${EMOJIS.CIRCLE_BULLET} [x2048](${x2048}) `
      );

    message.channel.send({ embeds: [embed] });
  }
};
