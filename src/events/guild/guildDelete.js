const { MessageEmbed } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  client.logger.log(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);

  const settings = await getSettings(guild);
  settings.data.leftAt = new Date();
  await settings.save();

  if (!client.joinLeaveWebhook) return;

  const owner = await client.users.fetch(guild.ownerId);
  const embed = new MessageEmbed()
    .setTitle("Guild Left")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.ERROR)
    .addField("Name", guild.name, false)
    .addField("ID", guild.id, false)
    .addField("Owner", `${owner.username}#${owner.discriminator} [\`${owner.id}\`]`, false)
    .addField("Members", `\`\`\`yaml\n${guild.memberCount}\`\`\``, false)
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  client.joinLeaveWebhook.send({
    username: "Leave",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
