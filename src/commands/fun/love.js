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
        description: "The first user",
        type: ApplicationCommandOptionType.User,
        required: true,
      },

      {
        name: "user2",
        description: "The second user",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const user1 = args[0];
    const user2 = args[1];
    const response = await getUserLove(user1, user2, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");
    const response = await getUserLove(user1, user2, interaction.user);
    await interaction.followUp(response);
  },
};

async function getUserLove(user1, user2, mauthor) {
  // Calculate random love percentage
  const result = Math.ceil(Math.random() * 100);

  // Determine love status based on percentage
  let loveStatus;
  if (result <= 20) {
    loveStatus = ":broken_heart: Not a good match :broken_heart:";
  } else if (result <= 50) {
    loveStatus = ":yellow_heart: Could be better :yellow_heart:";
  } else if (result <= 80) {
    loveStatus = ":heartpulse: Pretty good match :heartpulse:";
  } else {
    loveStatus = ":heart_eyes: Perfect match :heart_eyes:";
  }

  // Determine love image based on percentage
  const loveImage =
    result >= 51
      ? "https://media1.giphy.com/media/TmngSmlDjzJfO/giphy.gif?cid=ecf05e47brm0fzk1kan0ni753jmvvik6h27sp13fkn8a9kih&rid=giphy.gif&ct=g"
      : "https://media4.giphy.com/media/SIPIe590rx6iA/giphy.gif?cid=ecf05e476u1ciogyg7rjw1aaoh29s912axi5r7b5r46fczx6&rid=giphy.gif&ct=g";

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle("Love Meter")
    .setDescription("See how much you match with someone! :heart:")
    .addFields({
      name: "Result",
      value: `**${user1}** and **${user2}** match **${result}%**!`,
      inline: false,
    })
    .addFields({
      name: "Love Status",
      value: loveStatus,
      inline: false,
    })
    .setColor("LuminousVividPink")
    .setFooter({
      text: `Requested by ${mauthor.tag}`,
    })
    .setImage(loveImage)
    .setTimestamp()
    .setThumbnail("https://www.wownow.net.in/assets/images/love.gif")
    .setFooter({ text: `Requested by ${mauthor.tag}` });

  return { embeds: [embed] };
}
