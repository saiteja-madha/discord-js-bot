const { Command } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
const { Message, MessageAttachment } = require("discord.js");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

module.exports = class ProxiesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "proxies",
      description: "fetch proxies. Available types: HTTP, SOCKS4, SOCKS5",
      cooldown: 5,
      command: {
        enabled: true,
        usage: "[type]",
        minArgsCount: 1,
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
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
    const response = await getBuffer(
      `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
    );

    if (!response.success || !response.buffer) message.reply("Failed to fetch proxies");
    if (response.buffer.length === 0) message.reply("Could not fetch data. Try again later");

    const attachment = new MessageAttachment(response.buffer, `${type.toLowerCase()}_proxies.txt`);
    if (msg.deletable) await msg.delete();
    message.reply({ content: `${type.toUpperCase()} Proxies fetched`, files: [attachment] });
  }
};
