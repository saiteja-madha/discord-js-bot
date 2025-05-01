const { getInviteCache } = require("@handlers/invite");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Invite} invite
 */
module.exports = async (client, invite) => {
  const cachedInvites = getInviteCache(invite?.guild);

  // Check if invite code exists in the cache
  if (cachedInvites && cachedInvites.get(invite.code)) {
    cachedInvites.get(invite.code).deletedTimestamp = Date.now();
  }

  const settings = await getSettings(invite.guild);
  if (!settings.logging?.invites) return;
  const logChannel = client.channels.cache.get(settings.logging.invites);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite Deleted" })
    .setTitle(`Invite deleted (${invite.code}) for ${invite.channel}`)
    .setDescription(`${invite.url}`)
    .setColor("Red")
    .addFields({
      name: "Total uses",
      value: invite.uses?.toString() || "Not Available"
    })
    .setTimestamp()
    .setFooter({ text: `ID: ${invite.code} | Created by: ${invite.inviter?.username || "Not available"}` })

  logChannel.send({ embeds: [embed] })
};
