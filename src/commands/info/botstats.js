const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { timeformat } = require("@utils/miscUtils");
const { EMOJIS, EMBED_COLORS, BOT_INVITE, DISCORD_INVITE } = require("@root/config.js");
const os = require("os");
const outdent = require("outdent");

module.exports = class BotStatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botstats",
      description: "shows bot information",
      aliases: ["botstat", "botinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const { client } = message;

    // STATS
    const guilds = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

    // CPU
    const platform = process.platform.replace(/win32/g, "Windows");
    const architecture = os.arch();
    const cores = os.cpus().length;
    const cpuUsage = (process.cpuUsage().user / 1024 / 1024).toFixed(2) + " MB";

    // RAM
    const botUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
    const botAvailable = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const botUsage = ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1) + "%";

    const overallUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const overallAvailable = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const overallUsage = Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%";

    let desc = "";
    desc = desc + EMOJIS.CUBE_BULLET + " Total guilds: " + guilds + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Total users: " + users + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Total channels: " + channels + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Websocket Ping: " + client.ws.ping + " ms\n";
    desc = desc + "\n";

    const embed = new MessageEmbed()
      .setTitle("Bot Information")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(desc)
      .addField(
        "CPU:",
        outdent`
        ${EMOJIS.ARROW} **OS:** ${platform} [${architecture}]
        ${EMOJIS.ARROW} **Cores:** ${cores}
        ${EMOJIS.ARROW} **Usage:** ${cpuUsage}
        `,
        true
      )
      .addField(
        "Bot's RAM:",
        outdent`
        ${EMOJIS.ARROW} **Used:** ${botUsed}
        ${EMOJIS.ARROW} **Available:** ${botAvailable}
        ${EMOJIS.ARROW} **Usage:** ${botUsage}
        `,
        true
      )
      .addField(
        "Overall RAM:",
        outdent`
      ${EMOJIS.ARROW} **Used:** ${overallUsed}
      ${EMOJIS.ARROW} **Available:** ${overallAvailable}
      ${EMOJIS.ARROW} **Usage:** ${overallUsage}
      `,
        true
      )
      .addField("Node Js version", process.versions.node, false)
      .addField("Uptime", "```" + timeformat(process.uptime()) + "```", false)
      .addField("INVITE:", `[Add Me here!](${BOT_INVITE})`, true)
      .addField("SUPPORT:", `[Discord!](${DISCORD_INVITE})`, true);

    ctx.reply({ embeds: [embed] });
  }
};
