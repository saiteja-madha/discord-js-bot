const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class GithubCommand extends Command {
  constructor(client) {
    super(client, {
      name: "github",
      description: "shows github statistics of a user",
      cooldown: 10,
      command: {
        enabled: true,
        aliases: ["git"],
        usage: "<username>",
        minArgsCount: 1,
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { author } = message;

    const response = await getResponse(`https://api.github.com/users/${args}`);
    if (response.status === 400) return message.reply("```No user found with that name```");
    if (!response.success) return message.reply(MESSAGES.API_ERROR);

    const json = response.data;
    const {
      login: username,
      name = " Not Provided",
      id: githubId,
      avatar_url: avatarUrl,
      html_url: userPageLink,
      followers,
      following,
      bio = "Not Provided",
      location,
      blog,
    } = json;

    let website = websiteProvided(blog) ? `[Click me](${blog})` : "Not Provided";
    if (website == null) website = "Not Provided";

    const embed = new MessageEmbed()
      .setAuthor(`GitHub User: ${username}`, avatarUrl, userPageLink)
      .addField(
        "User Info",
        outdent`**Real Name**: *${name}*
        **Location**: *${location}*
        **GitHub ID**: *${githubId}*
        **Website**: *${website}*\n`,
        true
      )
      .addField("Social Stats", `**Followers**: *${followers}*\n**Following**: *${following}*`, true)
      .setDescription(`**Bio**:\n${bio}`)
      .setImage(avatarUrl)
      .setColor(0x6e5494)
      .setFooter(`Requested by ${author.tag}`);

    message.channel.send({ embeds: [embed] });
  }
};

function websiteProvided(text) {
  if (text.startsWith("http://")) return true;
  return text.startsWith("https://");
}
