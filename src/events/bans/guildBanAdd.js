const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * Log when someone gets banned
 * @param {import("@structures/BotClient")} client 
 * @param {import("discord.js").GuildBan} ban 
 */
module.exports = async (client, ban) => {

    const settings = await getSettings(ban.guild)
    if (!settings.logging.bans) return;
    const logChannel = client.channels.cache.get(settings.logging.bans);
    if (!logChannel) return;
    const auditLog = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 }).then((en) => en.entries.first())
    const executor = auditLog.targetId === ban.user.id ? auditLog.executor : "Unknown"
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Member Banned" })
        .setTitle(`${ban.user} (${ban.user.username}) was banned!`)
        .setColor("Red")
        .setDescription(`Reason: ${auditLog.reason || "None"}`)
        .setFooter({ text: `ID: ${ban.user.id} | Executor: ${executor?.username || "Unknown"}` })
        .setThumbnail(ban.user.displayAvatarURL());

    await logChannel.send({ embeds: [embed] })
}
