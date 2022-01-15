const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (member) => {
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  const embed = new MessageEmbed()
    .setAuthor({
      name: `User information for ${member.displayName}`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addField("User Tag", member.user.tag, true)
    .addField("ID", member.id, true)
    .addField("Guild Joined", member.joinedAt.toUTCString())
    .addField("Discord Registered", member.user.createdAt.toUTCString())
    .addField(`Roles [${member.roles.cache.size}]`, member.roles.cache.map((r) => r.name).join(", "), false)
    .addField("Avatar-URL", member.user.displayAvatarURL({ format: "png" }))
    .setFooter({ text: `Requested by ${member.user.tag}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
