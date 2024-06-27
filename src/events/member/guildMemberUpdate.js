
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent, time } = require("discord.js");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember|import('discord.js').PartialGuildMember} oldMember
 * @param {import('discord.js').GuildMember|import('discord.js').PartialGuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
    if (oldMember.partial) return
    if (!newMember.guild) return;
    const settings = await getSettings(newMember.guild);
    if (!settings.logging.members) return;
    const logChannel = client.channels.cache.get(settings.logging.members);
    let embed = new EmbedBuilder().setColor("Green").setTimestamp();
    if (oldMember.nickname !== newMember.nickname) {
        embed
            .setAuthor({ name: "Nickname Changed" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .addFields(
                { name: "User", value: newMember.toString(), inline: true },
                { name: "Old Nickname", value: oldMember.nickname || "None", inline: true },
                { name: "New Nickname", value: newMember.nickname || "None", inline: true }
            )
            .setFooter({ text: `ID: ${newMember.id}` })
    }

    if (!oldMember.roles.cache.every(role => newMember.roles.cache.has(role.id))) {
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        const rolesMessage = [];

        addedRoles.forEach(role => rolesMessage.push(`+ ${role}`));
        removedRoles.forEach(role => rolesMessage.push(`- ${role}`));
        embed
            .setAuthor({ name: "Role Updated" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .addFields(
                { name: "User", value: newMember.toString(), inline: true },
                { name: "Roles", value: rolesMessage.join("\n") }
            )
            .setFooter({ text: `ID: ${newMember.id}` })
    }
    if (!oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
        const auditLog = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
        const entry = auditLog.entries.first();
        const disabledTill = new Date(entry.changes[0].new);
        const executor = entry.executor;
        embed
            .setAuthor({ name: "Member Timed-out" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .setColor("Red")
            .addFields(
                { name: "User", value: newMember.toString(), inline: true },
                { name: "Till", value: time(disabledTill, "F"), inline: true },
                { name: "Executor", value: executor.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${newMember.id}` })

    }

    if (embed.fields.length === 0) return;
    logChannel.send({ embeds: [embed] }).catch(() => { });

};
