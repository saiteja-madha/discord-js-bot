const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class GithubCommand extends Command {
  constructor(client) {
    super(client, {
      name: "github",
      description: "shows github statistics of a user",
      usage: "<username>",
      minArgsCount: 1,
      aliases: ["git"],
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { author } = message;

    const response = await getResponse(`https://api.github.com/users/${args}`);
    if (response.status === 400) return ctx.reply("```No user found with that name```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const json = response.data;
    let {
      login: username,
      name,
      id: githubId,
      avatar_url,
      html_url: userPageLink,
      followers,
      following,
      bio,
      location,
      blog,
    } = json;

    let website = websiteProvided(blog) ? `[Click me](${blog})` : "Not Provided";
    if (name == null) name = "Not Provided";
    if (bio == null) bio = "Not Provided";
    if (website == null) website = "Not Provided";

    let embed = new MessageEmbed()
      .setAuthor("GitHub User: " + username, avatar_url, userPageLink)
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
      .setImage(avatar_url)
      .setColor(0x6e5494)
      .setFooter(`Requested by ${author.tag}`);

    ctx.reply({ embeds: [embed] });
  }
};

function websiteProvided(text) {
  if (text.startsWith("http://")) return true;
  else return text.startsWith("https://");
}
