const { Guild, MessageEmbed } = require("discord.js");
const { BotClient } = require("@src/structures");
const { updateGuildLeft } = require("@schemas/guild-schema");

/**
 * Emitted whenever a guild kicks the client or the guild is deleted/left.
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
  client.logger.log(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);
  await updateGuildLeft(guild);

  if (!client.joinLeaveWebhook) return;

  const embed = new MessageEmbed()
    .setAuthor("Guild Left")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addField("Name", guild.name, false)
    .addField("ID", guild.id, false)
    .addField("Owner", `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`, false)
    .addField("Members", `\`\`\`yaml\n${guild.memberCount}\`\`\``, false)
    .setFooter(`Guild #${client.guilds.cache.size}`);

  client.joinLeaveWebhook.send({
    username: "Leave",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
