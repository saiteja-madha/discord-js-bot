const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

module.exports = class Flip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "flip",
      description: "flip a coin or a message",
      enabled: true,
      category: "FUN",
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand("type");

    // coin
    if (sub === "coin") {
      const items = ["HEAD", "TAIL"];
      const toss = items[Math.floor(Math.random() * items.length)];

      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
        .setDescription(`${interaction.user.username}, started a coin toss`);

      await interaction.followUp({ embeds: [embed] });

      setTimeout(() => {
        const newEmbed = new MessageEmbed().setDescription("The coin is in the air");
        interaction.editReply({ embeds: [newEmbed] }).catch(() => {});
      }, 2000);

      setTimeout(() => {
        const newEmbed = new MessageEmbed()
          .setDescription(`>> **${toss} Wins** <<`)
          .setImage(toss === "HEAD" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");
        interaction.editReply({ embeds: [newEmbed] }).catch(() => {});
      }, 2000);
    }

    // text
    else if (sub === "text") {
      const input = interaction.options.getString("input");

      let builder = "";
      for (let i = 0; i < input.length; i += 1) {
        const letter = input.charAt(i);
        const a = NORMAL.indexOf(letter);
        builder += a !== -1 ? FLIPPED.charAt(a) : letter;
      }

      return interaction.followUp(builder);
    }
  }
};
