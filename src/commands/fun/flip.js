const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

module.exports = class FlipCommand extends Command {
  constructor(client) {
    super(client, {
      name: "flip",
      description: "flips a coin or message",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "coin",
            description: "flips a coin heads or tails",
          },
          {
            trigger: "text <input>",
            description: "reverses the given message",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "coin",
            description: "flip a coin",
            type: "SUB_COMMAND",
          },
          {
            name: "text",
            description: "reverses the given message",
            type: "SUB_COMMAND",
            options: [
              {
                name: "input",
                description: "text to flip",
                type: "STRING",
                required: true,
              },
            ],
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
    const sub = args[0].toLowerCase();

    if (sub === "coin") {
      const items = ["HEAD", "TAIL"];
      const toss = items[Math.floor(Math.random() * items.length)];

      message.channel.send({ embeds: [firstEmbed(message.author)] }).then((coin) => {
        // 2nd embed
        setTimeout(() => {
          coin.edit({ embeds: [secondEmbed()] }).catch(() => {});
          // 3rd embed
          setTimeout(() => {
            coin.edit({ embeds: [resultEmbed(toss)] }).catch(() => {});
          }, 2000);
        }, 2000);
      });
    }

    //
    else if (sub === "text") {
      if (args.length < 2) return message.channel.send("Please enter a text");
      const input = args.join(" ");
      const response = await flipText(input);
      await message.safeReply(response);
    }

    // else
    else await message.safeReply("Incorrect command usage");
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand("type");

    if (sub === "coin") {
      const items = ["HEAD", "TAIL"];
      const toss = items[Math.floor(Math.random() * items.length)];
      await interaction.followUp({ embeds: [firstEmbed(interaction.user)] });

      setTimeout(() => {
        interaction.editReply({ embeds: [secondEmbed()] }).catch(() => {});
        setTimeout(() => {
          interaction.editReply({ embeds: [resultEmbed(toss)] }).catch(() => {});
        }, 2000);
      }, 2000);
    }

    //
    else if (sub === "text") {
      const input = interaction.options.getString("input");
      const response = await flipText(input);
      await interaction.followUp(response);
    }
  }
};

const firstEmbed = (user) =>
  new MessageEmbed().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username}, started a coin toss`);

const secondEmbed = () => new MessageEmbed().setDescription("The coin is in the air");

const resultEmbed = (toss) =>
  new MessageEmbed()
    .setDescription(`>> **${toss} Wins** <<`)
    .setImage(toss === "HEAD" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");

async function flipText(text) {
  let builder = "";
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i);
    const a = NORMAL.indexOf(letter);
    builder += a !== -1 ? FLIPPED.charAt(a) : letter;
  }
  return builder;
}
