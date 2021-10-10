const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class GithubCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "github",
      description: "shows github statistics of a user",
      enabled: true,
      cooldown: 10,
      options: [
        {
          name: "username",
          description: "github username",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const target = interaction.options.getString("username");
    const response = await getJson(`https://api.github.com/users/${target}`);
    if (response.status === 404) return interaction.followUp("```No user found with that name```");
    if (!response.success) return interaction.followUp(MESSAGES.API_ERROR);

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
      .setFooter(`Requested by ${interaction.user.tag}`);

    interaction.followUp({ embeds: [embed] });
  }
};

function websiteProvided(text) {
  if (text.startsWith("http://")) return true;
  return text.startsWith("https://");
}
