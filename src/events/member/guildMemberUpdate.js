
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent, time } = require("discord.js");

const timeOutMap = new Map()
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember|import('discord.js').PartialGuildMember} oldMember
 * @param {import('discord.js').GuildMember|import('discord.js').PartialGuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
    if (oldMember.partial) return
    if (!newMember.guild) return;
    if (newMember.user.bot) return;
    const settings = await getSettings(newMember.guild);
    if (!settings.logging?.members) return;
    const logChannel = client.channels.cache.get(settings.logging.members);
    let embed = new EmbedBuilder().setColor("Green").setTimestamp();
    let changed = false;
    // Onboarding
    if (newMember.guild.features.includes("WELCOME_SCREEN_ENABLED") && oldMember.pending && !newMember.pending) {
        changed = true;
        embed
            .setAuthor({ name: "Member Completed Onboarding" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .addFields(
                { name: "User", value: newMember.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${newMember.id}` });
    }

    // Nickname change
    if (oldMember.nickname !== newMember.nickname) {
        changed = true;
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

    // Role changes
    if (!oldMember.roles.cache.every(role => newMember.roles.cache.has(role.id)) || (oldMember.roles.cache.size !== newMember.roles.cache.size)) {
        changed = true;
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        const rolesMessage = [];

        addedRoles.forEach(role => rolesMessage.push(`+ Added ${role}`));
        removedRoles.forEach(role => rolesMessage.push(`\\- Removed ${role}`));
        embed
            .setAuthor({ name: "Member Role Updated" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .addFields(
                { name: "User", value: newMember.toString(), inline: true },
                { name: "Roles", value: rolesMessage.join("\n") }
            )
            .setFooter({ text: `ID: ${newMember.id}` })
    }

    // Timeout
    if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
        changed = true;
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
                { name: "Reason", value: `${entry.reason || "none"}` },
                { name: "Executor", value: executor.toString() }
            )
            .setFooter({ text: `ID: ${newMember.id}` });

        // add a timeout to send a log when timeout expires
        timeOutMap.set(newMember.id, setTimeout(() => {
            const e = new EmbedBuilder()
                .setAuthor({ name: "Member Untimeout" })
                .setThumbnail(newMember.user.displayAvatarURL())
                .setColor("Green")
                .addFields(
                    { name: "User", value: newMember.toString(), inline: true },
                    { name: "Reson", value: "Timeout Expired", inline: true },
                    { name: "Timed-out by", value: executor.toString() }
                )
                .setFooter({ text: `ID: ${newMember.id}` });
            logChannel.send({ embeds: [e] })
            timeOutMap.delete(newMember.id)
        }, disabledTill.getTime() - Date.now()))
    }

    // Untimeout
    if (oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
        changed = true;
        const timeouTinterval = timeOutMap.get(newMember.id);
        if (timeouTinterval) {
            clearTimeout(timeouTinterval);
            timeOutMap.delete(newMember.id)
        }
        const auditLog = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
        const entry = auditLog.entries.first();
        const executor = entry.executor;

        embed
            .setAuthor({ name: "Member Untimeout" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .setColor("Green")
            .addFields(
                { name: "User", value: newMember.toString(), inline: true },
                { name: "Executor", value: executor.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${newMember.id}` });
    }
    // Guild avatar change
    if (oldMember.avatar !== newMember.avatar) {
        changed = true;
        embed
            .setAuthor({ name: "Avatar Changed" })
            .setThumbnail(newMember.displayAvatarURL())
            .addFields(
                { name: "User", value: newMember.toString(), inline: true }
            )
            .setImage(newMember.displayAvatarURL({ size: 2048 }))
            .setFooter({ text: `ID: ${newMember.id}` });
    }

    // Voice muted
    if (!oldMember.voice?.serverMute && newMember.voice?.serverMute) {
        changed = true;
        embed
            .setAuthor({ name: "Member Server Muted for Voice Channels" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .setColor("Red")
            .addFields(
                { name: "User", value: newMember.toString(), inline: true }
            )
            .setFooter({ text: `ID: ${newMember.id}` });
    }

    // Voice Mute Removed
    if (oldMember.voice?.serverMute && !newMember.voice?.serverMute) {
        changed = true;
        embed
            .setAuthor({ name: "Member Server Mute Removed for Voice Channels" })
            .setThumbnail(newMember.user.displayAvatarURL())
            .setColor("Green")
            .addFields({
                name: "User",
                value: newMember.toString(),
            })
            .setFooter({ text: `ID: ${newMember.id}` })
    }
    if (!changed) return;
    await logChannel.send({ embeds: [embed] })

};
