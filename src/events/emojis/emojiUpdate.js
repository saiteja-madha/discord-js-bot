const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * Log when emoji is updated
 * @param {import("@structures/BotClient")} client 
 * @param {import("discord.js").GuildEmoji} oldEmoji 
 * @param {import("discord.js").GuildEmoji} newEmoji 
 */
module.exports = async (client, oldEmoji, newEmoji) => {
    const settings = await getSettings(newEmoji.guild);
    if (!settings.logging?.emojis) return;
    const logChannel = client.channels.cache.get(settings.logging.emojis)
    if (!logChannel) return;

    const auditLog = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate, limit: 1 }).then((en) => en.entries.first());
    const executor = auditLog.targetId === newEmoji.id ? auditLog.executor : "Unknown"
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Emoji Updated" })
        .setTitle(`${newEmoji} was updated`)
        .setFooter({ text: `ID: ${newEmoji.id} | Executor: ${executor?.username || "Unknown"}` })
        .setThumbnail(newEmoji.imageURL())

    // Name changes   
    if (oldEmoji.name !== newEmoji.name) {
        embed.setDescription(` Name: \`${oldEmoji.name}\` -> \`${newEmoji.name}\``)
    }

    // Allowed roles changes
    if (!oldEmoji.roles.cache.equals(newEmoji.roles.cache)) {
        const changes = [];
        const oldRoles = oldEmoji.roles.cache;
        const newRoles = newEmoji.roles.cache;
        newRoles.forEach((role, id) => {
            if (!oldRoles.has(id)) changes.push(`+ Added ${role}`);
        });

        oldRoles.forEach((role, id) => {
            if (!newRoles.has(id)) changes.push(`\\- Removed ${role}`)
        })
        embed.setDescription(`**Allowed Roles Modified:**\n${changes.join("\n")}`)
    }

    if (!embed.data.description) return;
    logChannel.send({ embeds: [embed] })

}