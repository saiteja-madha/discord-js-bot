const { Command } = require("@src/structures");
const { Message, MessageEmbed, ContextMenuInteraction } = require("discord.js");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { getProfile } = require("@schemas/profile-schema");
const { getSettings } = require("@schemas/guild-schema");
const { resolveMember } = require("@utils/guildUtils");
const { getUser } = require("@schemas/user-schema");

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
      contextMenu: {
        enabled: true,
        type: "USER",
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const embed = await buildEmbed(message.guild, target);
    message.channel.send({ embeds: [embed] });
  }

  /**
   * @param {ContextMenuInteraction} interaction
   */
  async contextRun(interaction) {
    const target = (await interaction.guild.members.fetch(interaction.targetId)) || interaction.member;
    const embed = await buildEmbed(interaction.guild, target);
    interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = async (guild, target) => {
  const { user } = target;
  const settings = await getSettings(guild);
  const profile = await getProfile(guild.id, user.id);
  const userData = await getUser(user.id);

  return new MessageEmbed()
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addField("User Tag", user.tag, true)
    .addField("ID", user.id, true)
    .addField("Discord Registered", user.createdAt.toDateString(), false)
    .addField("Cash", `${userData?.coins || 0} ${EMOJIS.CURRENCY}`, true)
    .addField("Bank", `${userData?.bank || 0} ${EMOJIS.CURRENCY}`, true)
    .addField("Net Worth", `${(userData?.coins || 0) + (userData?.bank || 0)}${EMOJIS.CURRENCY}`, true)
    .addField("Messages*", `${settings.ranking.enabled ? (profile?.messages || 0) + " " : "Not Tracked"}`, true)
    .addField("XP*", `${settings.ranking.enabled ? (profile?.xp || 0) + " " : "Not Tracked"}`, true)
    .addField("Level*", `${settings.ranking.enabled ? (profile?.level || 0) + " " : "Not Tracked"}`, true)
    .addField("Strikes*", (profile?.strikes || 0) + " ", true)
    .addField("Warnings*", (profile?.warnings || 0) + " ", true)
    .addField("Reputation", `${userData?.reputation?.received || 0}`, true)
    .addField("Avatar-URL", user.displayAvatarURL({ format: "png" }))
    .setFooter("Fields marked (*) are guild specific");
};
