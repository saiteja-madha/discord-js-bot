const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageButton, MessageEmbed, MessageActionRow } = require("discord.js");
const { getRandomInt } = require("@utils/miscUtils");
const { getJson } = require("@utils/httpUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class MemeCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "meme",
      description: "get a random meme",
      enabled: true,
      cooldown: 20,
      category: "FUN",
      options: [
        {
          name: "category",
          description: "meme category",
          type: "STRING",
          required: false,
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
      new MessageButton().setCustomId("regenMemeBtn").setStyle("SECONDARY").setEmoji("🔁")
    );
    const embed = await getRandomEmbed(choice);

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
      if (response.customId !== "regenMemeBtn") return;
      const embed = await getRandomEmbed(choice);
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

const getRandomEmbed = async (choice) => {
  const subReddits = ["meme", "Memes_Of_The_Dank", "memes", "dankmemes"];
  let rand = choice ? choice : subReddits[getRandomInt(subReddits.length)];

  const response = await getJson(`https://www.reddit.com/r/${rand}/random/.json`);
  if (!response.success) {
    return new MessageEmbed().setColor(EMBED_COLORS.ERROR_EMBED).setDescription("Failed to fetch meme. Try again!");
  }

  const json = response.data;
  let permalink = json[0].data.children[0].data.permalink;
  let memeUrl = `https://reddit.com${permalink}`;
  let memeImage = json[0].data.children[0].data.url;
  let memeTitle = json[0].data.children[0].data.title;
  let memeUpvotes = json[0].data.children[0].data.ups;
  let memeNumComments = json[0].data.children[0].data.num_comments;

  return new MessageEmbed()
    .setAuthor(memeTitle, null, memeUrl)
    .setImage(memeImage)
    .setColor("RANDOM")
    .setFooter(`👍 ${memeUpvotes} | 💬 ${memeNumComments}`);
};
