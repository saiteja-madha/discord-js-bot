const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "love",
  description: "Get the love percentage of two users.",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: [],
    usage: "love <user1> <user2>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user1",
        description: "The name of the package",
        type: ApplicationCommandOptionType.User,
        required: true,
      },

      {
        name: "user2",
        description: "The name of the package",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    user1 = args[0];
    user2 = args[1];
    const response = await getuserlove(user1, user2, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    user1 = interaction.options.getUser("user1");
    user2 = interaction.options.getUser("user2");
    const response = await getuserlove(user1, user2, interaction.user);
    await interaction.followUp(response);
  },
};

async function getuserlove(user1, user2, mauthor) {
  var result = Math.ceil(Math.random() * 100);

  const embed = new EmbedBuilder()
    .setTitle(`Love Meter`)
    .setDescription(`See how much you match with someone! :heart:`)
    .addFields(
      { name: "Result", value: `**${user1}** and **${user2}** match **${result}%**!`, inline: false }
    )
    .setColor("LuminousVividPink")
    .setFooter({
      text: `Requested by ${mauthor.tag}`,
    }) // si el match es 51 o mas, muestra un gif de amor, si es menor, muestra un gif de odio
    .setImage(result >= 51 ? "https://media1.giphy.com/media/TmngSmlDjzJfO/giphy.gif?cid=ecf05e47brm0fzk1kan0ni753jmvvik6h27sp13fkn8a9kih&rid=giphy.gif&ct=g" : "https://media4.giphy.com/media/SIPIe590rx6iA/giphy.gif?cid=ecf05e476u1ciogyg7rjw1aaoh29s912axi5r7b5r46fczx6&rid=giphy.gif&ct=g")
    .setTimestamp()
    .setThumbnail("https://www.wownow.net.in/assets/images/love.gif")
    .setFooter({ text: `Requested by ${mauthor.tag}` });

  return { embeds: [embed] };
}
