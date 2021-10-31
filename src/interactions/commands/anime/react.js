const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { getJson } = require("@utils/httpUtils");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

const choices = ["hug", "kiss", "cuddle", "pat", "poke", "slap", "smug", "tickle", "wink"];

module.exports = class Reaction extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "react",
      description: "anime reactions",
      enabled: true,
      category: "ANIME",
      cooldown: 20,
      options: [
        {
          name: "category",
          description: "nsfw category",
          type: "STRING",
          required: true,
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
      new MessageButton().setCustomId("regenRnBtn").setStyle("SECONDARY").setEmoji("🔁")
    );

    const embed = await genReaction(interaction.user, choice);
    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === interaction.user.id,
      time: this.cooldown * 1000,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenRnBtn") return;
      const embed = await genReaction(interaction.user, choice);
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

const genReaction = async (author, category) => {
  try {
    let imageUrl;

    // some-random api
    if (category === "wink") {
      const response = await getJson("https://some-random-api.ml/animu/wink");
      if (!response.success) throw new Error("API error");
      imageUrl = response.data.link;
    }

    // neko api
    else {
      imageUrl = (await neko.sfw[category]()).url;
    }

    return new MessageEmbed().setImage(imageUrl).setColor("RANDOM").setFooter(`Requested By ${author.tag}`);
  } catch (ex) {
    return new MessageEmbed()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch meme. Try again!")
      .setFooter(`Requested By ${author.tag}`);
  }
};
