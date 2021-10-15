const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { SlashCommand, BotClient } = require("@src/structures");
const { EMBED_COLORS, EMOJIS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { outdent } = require("outdent");
const os = require("os");
const { timeformat } = require("@utils/miscUtils");

module.exports = class Info extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bot",
      description: "get various bot information",
      enabled: true,
      ephemeral: false,
      category: "INFORMATION",
      options: [
        {
          name: "invite",
          description: "get bot's invite",
          type: "SUB_COMMAND",
        },
        {
          name: "stats",
          description: "get bot's statistics",
          type: "SUB_COMMAND",
        },
        {
          name: "uptime",
          description: "get bot's uptime",
          type: "SUB_COMMAND",
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    switch (sub) {
      case "invite":
        response = botInvite(interaction.client);
        break;

      case "stats":
        response = botStats(interaction.client);
        break;

      case "uptime":
        response = `My Uptime: \`${timeformat(process.uptime())}\``;
        break;

      default:
        return interaction.followUp("Incorrect subcommand");
    }

    await interaction.followUp(response);
  }
};

/**
 * @param {BotClient} client
 */
const botStats = (client) => {
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

  let desc = "";
  desc = `${desc + EMOJIS.CUBE_BULLET} Total guilds: ${guilds}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Total users: ${users}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Total channels: ${channels}\n`;
  desc = `${desc + EMOJIS.CUBE_BULLET} Websocket Ping: ${client.ws.ping} ms\n`;
  desc += "\n";

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
    .addField("INVITE:", `[Add Me here!](${client.getInvite()})`, true)
    .addField("SUPPORT:", `[Discord!](${SUPPORT_SERVER})`, true);

  return { embeds: [embed] };
};

/**
 * @param {BotClient} client
 */
const botInvite = (client) => {
  const embed = new MessageEmbed()
    .setAuthor("Invite")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("Hey there! Thanks for considering to invite me\nUse the button below to navigate where you want");

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
