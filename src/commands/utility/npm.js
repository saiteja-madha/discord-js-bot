const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "npm",
  description: "Shows the information of a npm package.",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["npmpackage"],
    usage: "npm <package>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "package",
        description: "The name of the package",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getnpmpackage(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("package");
    const response = await getnpmpackage(username, interaction.user);
    await interaction.followUp(response);
  },
};

async function getnpmpackage(target, mauthor) {
  const response = await getJson(`https://registry.npmjs.org/${target}`);

  if (response.status === 404) return "```css\n[!] package not found```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const { name, description, author, license, repository, homepage, keywords, dependencies, devDependencies, time } =
    json;

    const version = json.versions[json["dist-tags"].latest];
		
    let deps = version.dependencies ? Object.keys(version.dependencies) : null;
  
    if(deps && deps.length > 10) {
      const len = deps.length - 10;
      deps = deps.slice(0, 10);
      deps.push(`...${len} more.`);
    }

  const embed = new EmbedBuilder()

    .setAuthor({
      name: `${name} | NPM`,
      url: `https://www.npmjs.com/package/${target}`,
      avatarUrl: "https://www.npmjs.com/static/images/touch-icons/favicon-32x32.png",
    })
    .setDescription(description ? description : "No description provided")
    .addFields(
      {
        name: "Links",
        value: stripIndent`
        [NPM](https://www.npmjs.com/package/${name})
        [GitHub](${repository.url})`,
        inline: true,
      },
      {
        name: "Dist-tags",
        value: json["dist-tags"].latest,
        inline: true,
      },
      {
        name: "Dependencies",
        value: `${deps && deps.length ? deps.join(", ") : "None"}`,
        inline: true,
      },
      {
        name: "Modified:",
        value: new Date(json.time.modified).toLocaleString(),
        inline: true,
      },
      {
        name: "Created:",
        value: new Date(json.time.created).toLocaleString(),
        inline: true,
      },
      {
        name: "Author",
        value: author ? author.name : "Unknown",
        inline: true,
      },
      {
        name: "License",
        value: license ? license : "No license provided",
        inline: true,
      }
    )

    .setThumbnail(
      "https://media.discordapp.net/attachments/987792443833462804/1052332405643550790/npm_1.png"
    )
    .setColor("Red")
    .setTimestamp()
    .setFooter({ text: `Requested by ${mauthor.tag}`});

  return { embeds: [embed] };
}
