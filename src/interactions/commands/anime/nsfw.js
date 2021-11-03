const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

// Add any 25 choices from here https://github.com/Nekos-life/nekos-dot-life/blob/master/endpoints.json

const choices = [
  "anal",
  "boobs",
  "bJ",
  "blowjob",
  "classic",
  "cumsluts",
  "cumArts",
  "ero",
  "feet",
  "femdom",
  "futanari",
  "girlSolo",
  "gasm",
  "hentai",
  "lesbian",
  "trap",
  "neko",
  "pussy",
  "pussyWankGif",
  "pussyArt",
  "spank",
  "yuri",
];

module.exports = class NSFW extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "nsfw",
      description: "show some random nsfw",
      enabled: true,
      category: "ANIME",
      cooldown: 20,
      validations: [
        {
          callback: (interaction) => interaction.channel?.nsfw,
          message: "This command can only be used in nsfw channel",
        },
      ],
      options: [
        {
          name: "category",
          description: "nsfw category",
          type: "STRING",
          required: false,
          choices: choices.map((ch) => ({ name: ch, value: ch })),
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const choice = interaction.options.getString("category");
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId("regenNsfwBtn").setStyle("SECONDARY").setEmoji("🔁")
    );

    const embed = await genNSFW(interaction.user, choice);
    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === interaction.user.id,
      time: this.cooldown * 1000,
      max: 3,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenNsfwBtn") return;
      const embed = await genNSFW(interaction.user, choice);
      await interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
      });

      await response.deferUpdate();
    });

    collector.on("end", () => {
      buttonRow.components.forEach((button) => button.setDisabled(true));
      return interaction.editReply({
        components: [buttonRow],
      });
    });
  }
};

const genNSFW = async (author, category) => {
  if (!category) category = "randomHentaiGif";
  try {
    const response = await neko.nsfw[category]();
    return new MessageEmbed().setImage(response.url).setColor("RANDOM").setFooter(`Requested By ${author.tag}`);
  } catch (ex) {
    return new MessageEmbed()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch meme. Try again!")
      .setFooter(`Requested By ${author.tag}`);
  }
};
