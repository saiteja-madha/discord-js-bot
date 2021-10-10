const { Util, MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

module.exports = class BigEmojiCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bigemoji",
      description: "enlarge an emoji",
      enabled: true,
      options: [
        {
          name: "emoji",
          description: "emoji to enlarge",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const emoji = interaction.options.getString("emoji");
    const custom = Util.parseEmoji(emoji);

    const embed = new MessageEmbed()
      .setTitle("❯ Big Emoji ❮")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setFooter(`Requested by ${interaction.user.tag}`);

    if (custom.id) {
      embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
      return interaction.followUp({ embeds: [embed] });
    }
    const parsed = parse(emoji, { assetType: "png" });
    if (!parsed[0]) return interaction.followUp("Not a valid emoji");

    embed.setImage(parsed[0].url);
    return interaction.followUp({ embeds: [embed] });
  }
};
