const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
/**
 * Log when a role is updated
 * @param {import("@structures/BotClient")} client 
 * @param {import('discord.js').Role} oldRole 
 * @param {import("discord.js").Role} newRole 
 */
module.exports = async (client, oldRole, newRole) => {
    const settings = await getSettings(newRole.guild)
    if (!settings.logging.roles) return;
    const logChannel = client.channels.cache.get(settings.logging.roles);
    if (!logChannel) return;

    const auditLog = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate, limit: 1 }).then((en) => en.entries.first());
    const executor = auditLog.targetId === newRole.id ? auditLog.executor : null

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Role updated" })
        .setTimestamp()
        .setColor("Green")
        .setFooter({ text: `ID: ${newRole.id} | Executor: ${executor?.username || "Unknown"}` })
    let description = `## Role Changes for ${newRole}\n`

    // Name

    if (oldRole.name !== newRole.name) {
        description += `**Name Changed**: \`${oldRole.name}\` -> \`${newRole.name}\`\n`
    }

    // Position
    if (oldRole.rawPosition !== newRole.rawPosition) {
        description += `**Position Changed**: \`${oldRole.rawPosition}\` -> \`${newRole.rawPosition}\`\n`
    }

    // Icon change
    if (oldRole.icon !== newRole.icon) {
        embed
        if (newRole.icon) {
            embed.setThumbnail(newRole.iconURL())
                .setImage(newRole.iconURL())
            description += `**Role Icon Changed**\n`
        } else if (oldRole.icon && !newRole.icon) {
            description += `Icon Removed\n - Old icon: [image](${oldRole.iconURL()})\n`
        }
    }

    // Color changed
    if (oldRole.hexColor !== newRole.hexColor) {
        description += `**Color Changed**: \`${oldRole.hexColor || "none"}\` -> \`${newRole.hexColor || "none"}\`\n`
    }

    // Permissions changes
    const changes = getDifference(oldRole.permissions, newRole.permissions);
    if (changes.length > 0) {
        embed
        description = `## Role permissions changed for ${newRole}\n` + changes.join("\n")
    }

    // Hoisted
    if (oldRole.hoist !== newRole.hoist) {
        description += `**Hoist Changed** (whether to display seperately in members list): \`${oldRole.hoist}\` -> \`${newRole.hoist}\`\n`
    }

    embed.setDescription(description)
    logChannel.send({ embeds: [embed] })
}

/**
 * Get permission differences
 * @param {import("discord.js").PermissionsBitField} oldPerm 
 * @param {import("discord.js").PermissionsBitField} newPerm 
 * @returns {string[]}
 */
const getDifference = (oldPerm, newPerm) => {
    const oldPermissions = oldPerm.toArray()
    const newPermissions = newPerm.toArray()
    const changes = []
    // Added
    newPermissions.forEach((perm) => {
        if (!oldPermissions.includes(perm)) changes.push(`+ **${perm}**`)
    })

    // Removed
    oldPermissions.forEach((perm) => {
        if (!newPermissions.includes(perm)) changes.push(`\\- **${perm}**`)
    })
    return changes;
}