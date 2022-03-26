const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");
const { stripIndent } = require("common-tags");

module.exports = class GithubCommand extends Command {
  constructor(client) {
    super(client, {
      name: "github",
      description: "shows github statistics of a user",
      cooldown: 10,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        aliases: ["git"],
        usage: "<username>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "username",
            description: "github username",
            type: "STRING",
            required: true,
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
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  }
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```No user found with that name```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[Click me](${blog})` : "Not Provided";
  if (website == null) website = "Not Provided";

  const embed = new MessageEmbed()
    .setAuthor({
      name: `GitHub User: ${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addField(
      "User Info",
      stripIndent`**Real Name**: *${name || "Not Provided"}*
        **Location**: *${location}*
        **GitHub ID**: *${githubId}*
        **Website**: *${website}*\n`,
      true
    )
    .addField("Social Stats", `**Followers**: *${followers}*\n**Following**: *${following}*`, true)
    .setDescription(`**Bio**:\n${bio || "Not Provided"}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}
