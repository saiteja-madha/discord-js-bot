const { SlashCommand } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
const { MessageAttachment, CommandInteraction } = require("discord.js");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

module.exports = class ProxiesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "proxies",
      description: "fetch various proxies",
      enabled: true,
      cooldown: 10,
      category: "UTILITY",
      options: [
        {
          name: "type",
          description: "type of proxy",
          type: "STRING",
          required: true,
          choices: PROXY_TYPES.map((p) => ({ name: p, value: p })),
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const type = interaction.options.getString("type");
    await interaction.followUp("Fetching proxies... Please wait");

    const response = await getBuffer(
      `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
    );

    if (!response.success || !response.buffer) return interaction.editReply("Failed to fetch proxies");
    if (response.buffer.length === 0) return interaction.editReply("Could not fetch data. Try again later");

    const attachment = new MessageAttachment(response.buffer, `${type.toLowerCase()}_proxies.txt`);
    await interaction.editReply({ content: `${type.toUpperCase()} Proxies fetched`, files: [attachment] });
  }
};
