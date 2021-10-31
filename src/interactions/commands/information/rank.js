const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageAttachment } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/guild-schema");
const { getProfile, getTop100 } = require("@schemas/profile-schema");
const { getBuffer } = require("@utils/httpUtils");

const IMAGE_API_BASE = "https://discord-js-image-manipulation.herokuapp.com";

module.exports = class Rank extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "shows members rank in this server",
      enabled: true,
      category: "INFORMATION",
      options: [
        {
          name: "user",
          description: "target user",
          type: "USER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user);

    const settings = await getSettings(interaction.guild);
    if (!settings.ranking.enabled) return interaction.followUp("Ranking is disabled on this server");

    const profile = await getProfile(interaction.guild.id, user.id);
    if (!profile) return interaction.followUp(`${user.tag} is not ranked yet!`);

    const lb = await getTop100(interaction.guild.id);
    let pos = -1;
    lb.forEach((doc, i) => {
      if (doc.member_id == user.id) {
        pos = i + 1;
      }
    });

    const xpNeeded = profile.level * profile.level * 100;

    const url = new URL(`${IMAGE_API_BASE}/utils/rank-card`);
    url.searchParams.append("name", user.username);
    url.searchParams.append("discriminator", user.discriminator);
    url.searchParams.append("avatar", user.displayAvatarURL({ format: "png", size: 128 }));
    url.searchParams.append("currentxp", profile.xp);
    url.searchParams.append("reqxp", xpNeeded);
    url.searchParams.append("level", profile.level);
    url.searchParams.append("barcolor", EMBED_COLORS.BOT_EMBED);
    url.searchParams.append("status", member?.presence?.status?.toString() || "idle");
    if (pos !== -1) url.searchParams.append("rank", pos);

    const response = await getBuffer(url.href);
    if (!response.success) return interaction.followUp("Failed to generate rank-card");

    const attachment = new MessageAttachment(response.buffer, "rank.png");
    await interaction.followUp({ files: [attachment] });
  }
};
