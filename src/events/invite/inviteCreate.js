const { getInviteCache, cacheInvite } = require("@handlers/invite");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Invite} invite
 */
module.exports = async (client, invite) => {
  const cachedInvites = getInviteCache(invite?.guild);

  // Check if cache for the guild exists and then add it to cache
  if (cachedInvites) {
    cachedInvites.set(invite.code, cacheInvite(invite, false));
  }
  const settings = await getSettings(invite.guild);
  if (!settings.logging?.invites) return;
  const logChannel = client.channels.cache.get(settings.logging.invites);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite Created" })
    .setColor("Green")
    .setTitle(`Invite created (${invite.code}) for ${invite.channel}`)
    .setDescription(`${invite.url}`)
    .addFields({
      name: "Expires in",
      value: invite.maxAge === 0 ? `Never` : require("@helpers/Utils").timeformat(invite.maxAge)
    }, {
      name: "Max uses",
      value: `${invite.maxUses || "Unlimited"}`
    })
    .setTimestamp()
    .setFooter({ text: `ID: ${invite.code} | Created by: ${invite.inviter.username}` })

  logChannel.send({ embeds: [embed] })
};
