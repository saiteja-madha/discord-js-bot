const { Command } = require("@src/structures");
const { Message } = require("discord.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

module.exports = class FlipTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: "fliptext",
      description: "reverses the given message",
      command: {
        enabled: true,
        usage: "<text>",
        category: "FUN",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const input = args.join(" ");

    let builder = "";
    for (let i = 0; i < input.length; i += 1) {
      const letter = input.charAt(i);
      const a = NORMAL.indexOf(letter);
      builder += a !== -1 ? FLIPPED.charAt(a) : letter;
    }

    message.channel.send(builder);
  }
};
