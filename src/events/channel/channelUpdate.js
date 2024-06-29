const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent, PermissionsBitField, OverwriteType } = require("discord.js");
const utils = require("@helpers/Utils")
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").GuildBasedChannel} oldChannel
 * @param {import("discord.js").GuildBasedChannel} newChannel
 */
module.exports = async (client, oldChannel, newChannel) => {
    const settings = await getSettings(newChannel.guild);
    if (!settings.logging.channels) return;
    const logChannel = client.channels.cache.get(settings.logging.channels);
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Channel Updated" })
        .setTimestamp()
        .setColor("Green")
    let auditLogType = AuditLogEvent.ChannelUpdate;
    // Return if category deleted, fires for every children channel and not worth logging in my opinion
    if (oldChannel.parent && !newChannel.parent) return;

    // Name change
    if (oldChannel.name !== newChannel.name) {
        embed
            .setAuthor({ name: "Channel Updated" })
            .setTitle(`Channel name updated for ${newChannel}`)
            .setDescription(`\`${oldChannel.name}\` -> \`${newChannel.name}\``)
            .setColor("Green")
    }

    // Category Changed
    if (oldChannel.parent?.id !== newChannel.parent?.id) {
        embed
            .setTitle(`Channel category changed for ${newChannel}`)
            .setDescription(`\`${oldChannel.parent || "none"}\` -> \`${newChannel.parent || "none"}\``)

    }

    // Overwrites changes
    const changes = getDifferrence(oldChannel.permissionOverwrites.cache, newChannel.permissionOverwrites.cache)
    if (changes.changes.length > 0) {
        auditLogType = changes.entryType;
        embed
            .setTitle(`Permission overwrites updated in channel ${newChannel}:`)
            .setDescription(
                changes.changes.join("\n")
            )
    }

    // Channel topic
    if (oldChannel.topic !== newChannel.topic) {
        embed
            .setTitle(`Topic changed for ${newChannel}`)
            .addFields(
                {
                    name: "Old Topic",
                    value: `\`${oldChannel.topic}\``
                },
                {
                    name: "New Topic",
                    value: `\`${newChannel.topic}\``
                }
            )
    }

    // nsfw
    if (oldChannel.nsfw !== newChannel.nsfw) {
        embed
            .setTitle(`NSFW status changed for channel ${newChannel}`)
            .setDescription(`\`${oldChannel.nsfw}\` -> \`${newChannel.nsfw}\``)
            .setColor("Red")
    }

    // Slowmode
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        embed
            .setTitle(`Slowmode updated for ${newChannel}`)
            .setDescription(`\`${oldChannel.rateLimitPerUser ? utils.timeformat(oldChannel.rateLimitPerUser) : "0 seconds"}\` -> \`${newChannel.rateLimitPerUser ? utils.timeformat(newChannel.rateLimitPerUser) : "0 seconds"}\``)
    }
    // bitrate
    if (oldChannel.bitrate !== newChannel.bitrate) {
        embed
            .setTitle(`Channel bitrate changed for ${newChannel}`)
            .setDescription(`\`${oldChannel.bitrate}kbps\` -> \`${newChannel.bitrate}kbps\``)

    }

    // User limit for voice
    if (oldChannel.userLimit !== newChannel.userLimit) {
        embed
            .setTitle(`Channel user limit changed for ${newChannel}`)
            .setDescription(`\`${oldChannel.userLimit} users\` -> \`${newChannel.userLimit} users\``)

    }

    // Idk if i am missing anything, will add if it comes to notice
    const entry = await getAuditLog(auditLogType, newChannel.guild);
    const executor = entry.targetId === newChannel.id ? entry.executor : "Unknown"
    embed.setFooter({ text: `ID: ${newChannel.id} | Executor: ${executor ? executor.username : "Unknown"}` });
    if (!embed.data.title) return;
    logChannel.safeSend({ embeds: [embed] });
};

/**
 * Get Permissions overwrites changes
 * @param {import("discord.js").Collection<string, import("discord.js").PermissionOverwrites} oldOverwrites 
 * @param {import("discord.js").Collection<string, import("discord.js").PermissionOverwrites} newOverwrites 
 */
const getDifferrence = (oldOverwrites, newOverwrites) => {
    const changes = [];
    let entryType;
    // Function to get the permission names from the bitfield
    const getPermissionNames = (bitfield) => {
        return new PermissionsBitField(bitfield).toArray();
    };

    // Check for added or modified permission overwrites
    newOverwrites.forEach((newOverwrite, id) => {
        const oldOverwrite = oldOverwrites.get(id);

        if (!oldOverwrite) {
            entryType = AuditLogEvent.ChannelOverwriteCreate
            const addedPermissions = getPermissionNames(newOverwrite.allow.bitfield).map(p => `${p}: allow`);
            const deniedPermissions = getPermissionNames(newOverwrite.deny.bitfield).map(p => `${p}: deny`);
            changes.push(`+ Added new overwrite for ${newOverwrite.type === OverwriteType.Member ? `<@${id}>` : `<@&${id}>`}: ${[...addedPermissions, ...deniedPermissions].join(', ')}`);
        } else {
            entryType = AuditLogEvent.ChannelOverwriteUpdate
            const oldAllow = getPermissionNames(oldOverwrite.allow.bitfield);
            const newAllow = getPermissionNames(newOverwrite.allow.bitfield);
            const oldDeny = getPermissionNames(oldOverwrite.deny.bitfield);
            const newDeny = getPermissionNames(newOverwrite.deny.bitfield);

            const addedAllow = newAllow.filter(p => !oldAllow.includes(p));
            const removedAllow = oldAllow.filter(p => !newAllow.includes(p));
            const addedDeny = newDeny.filter(p => !oldDeny.includes(p));
            const removedDeny = oldDeny.filter(p => !newDeny.includes(p));
            const changeMap = new Map()
            if (addedAllow.length || removedAllow.length || addedDeny.length || removedDeny.length) {
                changes.push(`+ Modified overwrite for ${newOverwrite.type === OverwriteType.Member ? `<@${id}>` : `<@&${id}>`}:`);

                addedAllow.forEach(p => changeMap.set(p, `none -> allow`));
                removedAllow.forEach(p => changeMap.set(p, `allow -> none`));
                addedDeny.forEach(p => changeMap.set(p, `none -> deny`));
                removedDeny.forEach(p => changeMap.set(p, `deny -> none`));

                // Handle changes from allow to deny or vice versa
                oldAllow.forEach(p => {
                    if (newDeny.includes(p)) {
                        changeMap.set(p, `allow -> deny`);
                    }
                });
                oldDeny.forEach(p => {
                    if (newAllow.includes(p)) {
                        changeMap.set(p, `deny -> allow`);
                    }
                });
                changeMap.forEach((v, id) => changes.push(`- ${id}: ${v}`))
            }
        }
    });

    // Check for removed permission overwrites
    oldOverwrites.forEach((oldOverwrite, id) => {
        if (!newOverwrites.has(id)) {
            entryType = AuditLogEvent.ChannelOverwriteDelete
            const removedPermissions = getPermissionNames(oldOverwrite.allow.bitfield).map(p => `${p}: allow`);
            const deniedPermissions = getPermissionNames(oldOverwrite.deny.bitfield).map(p => `${p}: deny`);
            changes.push(`- Removed overwrites for ${oldOverwrite.type === OverwriteType.Member ? `<@${id}>` : `<@&${id}>`}: ${[...removedPermissions, ...deniedPermissions].join(', ')}`);
        }
    });

    return { entryType, changes }
}

/**
 * 
 * @param {any} type 
 * @param {import("discord.js").Guild} guild 
 * @returns 
 */
const getAuditLog = async (type, guild) => {
    const auditLog = await guild.fetchAuditLogs({ type: type, limit: 1 });
    return auditLog.entries.first();
}