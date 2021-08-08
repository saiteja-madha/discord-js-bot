const { Command, CommandContext } = require("@root/command");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

module.exports = class FlipTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: "fliptext",
      description: "reverses the given message",
      usage: "<text>",
      category: "FUN",
      minArgsCount: 1,
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;
    const input = args.join(" ");

    let builder = "";
    for (let i = 0; i < input.length; i++) {
      let letter = input.charAt(i);
      let a = NORMAL.indexOf(letter);
      builder += a != -1 ? FLIPPED.charAt(a) : letter;
    }

    ctx.reply(builder);
  }
};
