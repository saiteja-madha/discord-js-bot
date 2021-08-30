const { Command } = require("@src/structures");
const { getResponse } = require("@utils/httpUtils");
const { Message } = require("discord.js");

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
      slashCommand: {
        enabled: false,
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

    message.channel.send("Fetching proxies... Please wait").then(async (msg) => {
      const response = await getResponse(
        `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
      );

      if (!response.status) message.reply("Failed to fetch proxies");
      if (response.data.length === 0) message.reply("Could not fetch data. Try again later");

      msg.delete().then(async () => {
        message.reply({
          content: `${type.toUpperCase()} Proxies fetched`,
          files: [
            {
              name: `${type.toLowerCase()}_proxies.txt`,
              attachment: Buffer.from(response.data),
            },
          ],
        });
      });
    });
  }
};
