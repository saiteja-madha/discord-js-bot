const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "flip",
  description: "flips a coin or message",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "coin",
        description: "flip a coin",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "text",
        description: "reverses the given message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "input",
            description: "text to flip",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  // This function runs when a user interacts with the slash command
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
    } else if (sub === "text") {
      const input = interaction.options.getString("input");
      const response = await flipText(input);
      await interaction.followUp(response);
    }
  },
};

const firstEmbed = (user) =>
  new EmbedBuilder().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username}, started a coin toss`);

const secondEmbed = () => new EmbedBuilder().setDescription("The coin is in the air");

const resultEmbed = (toss) =>
  new EmbedBuilder()
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
