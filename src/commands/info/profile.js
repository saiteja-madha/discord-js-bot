const { Command } = require("@src/structures");
const { Message, MessageEmbed } = require("discord.js");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { getProfile } = require("@schemas/profile-schema");
const { getSettings } = require("@schemas/guild-schema");
const { resolveMember } = require("@utils/guildUtils");
const { getUser } = require("@root/src/schemas/user-schema");

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "shows members profile",
      cooldown: 5,
      command: {
        enabled: true,
        category: "INFORMATION",
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const { user } = target;

    const settings = await getSettings(message.guild);
    const profile = await getProfile(message.guildId, user.id);
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
      .addField("Messages*", `${settings.ranking.enabled ? profile?.messages + " " || 0 + " " : "Not Tracked"}`, true)
      .addField("XP*", `${settings.ranking.enabled ? (profile?.xp || 0) + " " : "Not Tracked"}`, true)
      .addField("Level*", `${settings.ranking.enabled ? (profile?.level || 0) + " " : "Not Tracked"}`, true)
      .addField("Strikes*", profile?.strikes || 0 + " ", true)
      .addField("Warnings*", profile?.warnings || 0 + " ", true)
      .addField("Reputation", `${userData?.reputation?.received || 0}`, true)
      .addField("Avatar-URL", user.displayAvatarURL({ format: "png" }))
      .setFooter(`Requested By ${message.author.tag}\nFields marked (*) are guild specific`);

    message.channel.send({ embeds: [embed] });
  }
};
