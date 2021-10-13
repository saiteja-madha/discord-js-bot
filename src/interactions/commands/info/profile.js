const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed } = require("discord.js");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { getSettings } = require("@schemas/guild-schema");
const { getProfile } = require("@schemas/profile-schema");
const { getUser } = require("@schemas/user-schema");

module.exports = class Profile extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "shows members profile",
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

    const settings = await getSettings(interaction.guild);
    const profile = await getProfile(interaction.guild.id, user.id);
    const userData = await getUser(user.id);

    const embed = new MessageEmbed()
      .setThumbnail(user.displayAvatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .addField("User Tag", user.tag, true)
      .addField("ID", user.id, true)
      .addField("Discord Registered", user.createdAt.toDateString(), false)
      .addField("Cash", `${userData?.coins || 0} ${EMOJIS.CURRENCY}`, true)
      .addField("Bank", `${userData?.bank || 0} ${EMOJIS.CURRENCY}`, true)
      .addField("Net Worth", `${(userData?.coins || 0) + (userData?.bank || 0)}${EMOJIS.CURRENCY}`, true)
      .addField("Reputation", `${userData?.reputation?.received || 0}`, true)
      .addField("Daily Streak", `${userData?.daily?.streak || 0}`, true)
      .addField("XP*", `${settings.ranking.enabled ? (profile?.xp || 0) + " " : "Not Tracked"}`, true)
      .addField("Level*", `${settings.ranking.enabled ? (profile?.level || 0) + " " : "Not Tracked"}`, true)
      .addField("Strikes*", (profile?.strikes || 0) + " ", true)
      .addField("Warnings*", (profile?.warnings || 0) + " ", true)
      .addField("Avatar-URL", user.displayAvatarURL({ format: "png" }))
      .setFooter("Fields marked (*) are guild specific");

    await interaction.followUp({ embeds: [embed] });
  }
};
