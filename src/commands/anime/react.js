const { Command } = require("@src/structures");
const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const { getJson } = require("@utils/httpUtils");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");

const urlb = "https://cdn.nekos.life/"; //is first part of url

const choices = ["hug", "kiss", "cuddle", "pat", "poke", "slap", "smug", "tickle", "wink"];
const nchoices = [90, 144, 46, 75, 24, 17, 60, 21]; //array with number of gif per catégory

module.exports = class Reaction extends Command {
  constructor(client) {
    super(client, {
      name: "react",
      description: "anime reactions",
      enabled: true,
      category: "ANIME",
      cooldown: 5,
      command: {
        enabled: true,
        minArgsCount: 1,
        usage: "[reaction]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "category",
            description: "reaction type",
            type: "STRING",
            required: true,
            choices: choices.map((ch) => ({ name: ch, value: ch })),
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
    const category = args[0].toLowerCase();
    if (!choices.includes(category)) {
      return message.reply(`Invalid choice: \`${category}\`.\nAvailable reactions: ${choices.join(", ")}`);
    }

    const embed = await genReaction(category, message.author);
    await message.reply({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const embed = await genReaction(choice, interaction.user);
    await interaction.followUp({ embeds: [embed] });
  }
};

const genReaction = async (category, user) => {
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
      find = choices.indexOf(category); //determines the location of the choice in the choices table
      select = nchoices[find]; //select the max number of gifs thanks to find
      let complémant = Math.floor(Math.random() * select ) + 1; //random select number with the max of "select"

      if (complémant < 10) { complémant = "00" + complémant;} //add 00 if the number random is lower to 10
      else if (complémant >= 10 && complémant < 100) { complémant = "0" + complémant; }//add 0 if the number random is higher or egal to 10 and lower 100
      
      imageUrl = urlb + [category] + "/" + [category] + "_" + complémant + ".gif"; //set imageUrl to fisrt part of url + choice of category + / + choice + _ + random number + .gif
    
    }

    return new MessageEmbed().setFooter(`Requested By ${user.tag}`).setImage(imageUrl);
  } catch (ex) {
    return new MessageEmbed()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch meme. Try again!")
      .setFooter(`Requested By ${user.tag}`);
  }
};
