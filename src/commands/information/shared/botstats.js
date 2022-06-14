const { MessageEmbed, MessageActionRow, MessageButton,	version: djsversion, } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@utils/miscUtils");
const os = require("os");
const { stripIndent } = require("common-tags");
const version = require("../../../../package.json").version;
const {
	utc,
} = require("moment");

module.exports = (client) => {
  // STATS
  const guilds = client.guilds.cache.size;
  const channels = client.channels.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

  // CPU
  const platform = process.platform.replace(/win32/g, "Windows");
  const architecture = os.arch();
  const cores = os.cpus().length;
  const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;

  // RAM
  const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;

  const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;
  const owner = client.users.cache.get('User_ID_Here')

  let desc = "";
  desc += `❯ **Total Guilds:** ${guilds}\n`;
  desc += `❯ **Total Users:** ${users}\n`;
  desc += `❯ **Total Channels:** ${channels}\n`;
  desc += `❯ **Websocket Ping:** ${client.ws.ping} ms\n`;
  desc += "\n";

  const embed = new MessageEmbed()
    .setURL(client.web)
    .setTitle("Bot Information")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(desc)
    .addField(
      "General",
      ` ❯ **Client:** ${client.user.tag} (${client.user.id})
        ❯ **Developers:** ${owner} | [**Discord JS Bot**](https://github.com/saiteja-madha/discord-js-bot)
        ❯ **Slash Commands:** ${client.slashCommands.size}
        `,
    )
    .addField(
      "System",
     `  ❯ **Node.js:** ${process.version}
        ❯ **Version:** v${version}
        ❯ **Discord.js:** v${djsversion}
      `,
    )
    .addField(
      "CPU:",
      stripIndent`
        ❯ **OS:** ${platform} [${architecture}]
        ❯ **Cores:** ${cores}
        ❯ **Usage:** ${cpuUsage}
        `,
      true
    )
    .addField(
      "Bot's RAM:",
      stripIndent`
        ❯ **Platform:** ${process.platform}
        ❯ **Used:** ${botUsed}
        ❯ **Available:** ${botAvailable}
        ❯ **Usage:** ${botUsage}
        `,
      true
    )
    .addField(
      "Overall RAM:",
      stripIndent`
      ❯ **Used:** ${overallUsed}
      ❯ **Available:** ${overallAvailable}
      ❯ **Usage:** ${overallUsage}
      `,
      true
    )
    .addField("Uptime", "```" + timeformat(process.uptime()) + "```", false)
    .addField("Creation Date", "```" + utc(client.user.createdTimestamp).format(
      "Do MMMM YYYY HH:mm:ss") + "```");

  // Buttons
  let components = [];
  components.push(new MessageButton().setLabel("Invite Link").setURL(client.getInvite()).setStyle("LINK"));

  if (SUPPORT_SERVER) {
    components.push(new MessageButton().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle("LINK"));
  }

  if (DASHBOARD.enabled) {
    components.push(new MessageButton().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle("LINK"));
  }

  let buttonsRow = new MessageActionRow().addComponents(components);

  return { embeds: [embed], components: [buttonsRow] };
};
