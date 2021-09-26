const { MessageEmbed, Message } = require("discord.js");
const { Command } = require("@src/structures");
const db = require("@schemas/counter-schema");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { getMemberStats } = require("@utils/guildUtils");

module.exports = class CounterSetup extends Command {
  constructor(client) {
    super(client, {
      name: "counter",
      description: "setup counter channel in the guild. Counter types: `all/members/bots`",
      command: {
        enabled: true,
        usage: "<type> <channel-name>",
        minArgsCount: 1,
        category: "ADMIN",
        botPermissions: ["ADMINISTRATOR"],
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { guild } = message;
    const type = args[0].toLowerCase();

    if (type === "status") return sendStatus(message);

    if (!type || !["all", "members", "bots"].includes(type))
      return message.reply("Incorrect arguments are passed! Counter types: `all/members/bots`");

    if (args.length < 2) return message.reply("Incorrect Usage!");

    args.shift();
    let channelName = args.join(" ");

    const stats = await getMemberStats(guild);
    if (type === "all") channelName += ` : ${stats[0]}`;
    else if (type === "members") channelName += ` : ${stats[2]}`;
    else if (type === "bots") channelName += ` : ${stats[1]}`;

    const vc = await guild.channels.create(channelName, {
      type: "GUILD_VOICE",
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ["CONNECT"],
        },
        {
          id: guild.me.roles.highest.id,
          allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_ROLES"],
        },
      ],
    });

    if (type === "all") await db.setTotalCountChannel(guild.id, vc.id, args.join(" "));
    if (type === "members") await db.setMemberCountChannel(guild.id, vc.id, args.join(" "));
    if (type === "bots") await db.setBotCountChannel(guild.id, vc.id, args.join(" "));

    await db.updateBotCount(guild.id, stats[1], false);

    message.channel.send("Configuration saved! Counter channel created");
  }
};

/**
 * @param {Message} message
 */
async function sendStatus(message) {
  const { guild } = message;
  const config = await db.getConfig(guild.id);

  if (!config) return message.reply("No counter channel has been configured on this guild");

  let v1;
  let v2;
  let v3;
  if (config.tc_channel) v1 = guild.channels.cache.get(config.tc_channel);
  if (config.mc_channel) v2 = guild.channels.cache.get(config.mc_channel);
  if (config.bc_channel) v3 = guild.channels.cache.get(config.bc_channel);

  const desc = `
  TotalCount Channel: ${v1 ? EMOJIS.TICK : EMOJIS.X_MARK}
  MemberCount Channel: ${v2 ? EMOJIS.TICK : EMOJIS.X_MARK}
  BotCount Channel: ${v3 ? EMOJIS.TICK : EMOJIS.X_MARK}
  `;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor("Counter Configuration")
    .setDescription(desc);

  message.reply({ embeds: [embed] });
}
