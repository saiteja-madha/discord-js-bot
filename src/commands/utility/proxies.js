const { Command } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
const { Message, MessageAttachment, CommandInteraction } = require("discord.js");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

module.exports = class ProxiesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "proxies",
      description: "fetch proxies. Available types: http, socks4, socks5",
      cooldown: 5,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
      command: {
        enabled: true,
        usage: "[type]",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "type",
            description: "type of proxy",
            type: "STRING",
            required: true,
            choices: PROXY_TYPES.map((p) => ({ name: p, value: p })),
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
    let type = "all";

    if (args[0]) {
      if (PROXY_TYPES.includes(args[0].toLowerCase())) type = args[0].toLowerCase();
      else return message.reply("Incorrect proxy type. Available types: `http`, `socks4`, `socks5`");
    }

    const msg = await message.channel.send("Fetching proxies... Please wait");
    const response = await getProxies(type);
    if (msg.deletable) await msg.delete();
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const type = interaction.options.getString("type");
    await interaction.followUp("Fetching proxies... Please wait");
    const response = await getProxies(type);
    await interaction.editReply(response);
  }
};

async function getProxies(type) {
  const response = await getBuffer(
    `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
  );

  if (!response.success || !response.buffer) return "Failed to fetch proxies";
  if (response.buffer.length === 0) return "Could not fetch data. Try again later";

  const attachment = new MessageAttachment(response.buffer, `${type.toLowerCase()}_proxies.txt`);
  return { content: `${type.toUpperCase()} Proxies fetched`, files: [attachment] };
}
