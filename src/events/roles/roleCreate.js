const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * 
 * @param {import("@structures/BotClient")} client 
 * @param {import("discord.js").Role} role 
 */
module.exports = async (client, role) => {
    const settings = await getSettings(role.guild);
    if (!settings.logging?.roles) return;
    const logChannel = client.channels.cache.get(settings.logging.roles);
    if (!logChannel) return;

    // return if role was created by a bot (bot's role)
    if (role.managed) return;
    const auditLog = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 }).then((en) => en.entries.first());
    const executor = auditLog.targetId === role.id ? auditLog.executor : null
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Role Created" })
        .setDescription(`## ${role} was created!`)
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: `ID: ${role.id} | Executor: ${executor?.username || "Unknown"}` });

    logChannel.send({ embeds: [embed] })
}