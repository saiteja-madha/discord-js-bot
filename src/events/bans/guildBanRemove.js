const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * Log when someone gets unbanned
 * @param {import("@structures/BotClient")} client 
 * @param {import("discord.js").GuildBan} ban 
 */
module.exports = async (client, ban) => {

    const settings = await getSettings(ban.guild)
    if (!settings.logging.bans) return;
    const logChannel = client.channels.cache.get(settings.logging.bans);
    if (!logChannel) return;
    const auditLog = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 }).then((en) => en.entries.first())
    const executor = auditLog.targetId === ban.user.id ? auditLog.executor : "Unknown"
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Member Unbanned" })
        .setTitle(`${ban.user} (${ban.user.username}) was unbanned!`)
        .setColor("Green")
        .setDescription(`Ban Reason: ${ban.reason || "Not Available"}\n Unban Reason: ${auditLog.reason || "Not"}`)
        .setFooter({ text: `ID: ${ban.user.id} | Executor: ${executor?.username || "Unknown"}` })
        .setThumbnail(ban.user.displayAvatarURL());

    await logChannel.send({ embeds: [embed] })
}
